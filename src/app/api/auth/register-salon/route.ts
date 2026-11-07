export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { salonRegisterSchema } from '@/lib/validations';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = salonRegisterSchema.parse(body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 400 });
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: validated.phone.trim() },
    });
    if (existingPhone) {
      return NextResponse.json({ error: 'An account with this mobile number already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(validated.password);
    const slug = generateSlug(validated.businessName);

    // Default coordinates if not provided (approx based on city if available)
    const lat = 19.076;
    const lng = 72.8777;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: validated.email.toLowerCase().trim(),
          phone: validated.phone.trim(),
          passwordHash,
          role: 'SALON_OWNER',
          status: 'ACTIVE',
        },
      });

      // 2. Create Salon with PENDING_APPROVAL
      const salon = await tx.salon.create({
        data: {
          ownerId: user.id,
          businessName: validated.businessName.trim(),
          slug,
          registrationNumber: validated.registrationNumber || null,
          description: validated.description.trim(),
          status: 'PENDING_APPROVAL',
          allowInSalon: validated.allowInSalon,
          allowAtHome: validated.allowAtHome,
          rating: 5.0,
          reviewCount: 0,
        },
      });

      // 3. Create primary branch
      const branch = await tx.salonLocation.create({
        data: {
          salonId: salon.id,
          branchName: `${validated.businessName.trim()} (Main Branch)`,
          phone: validated.phone.trim(),
          email: validated.email.toLowerCase().trim(),
          addressLine: validated.addressLine.trim(),
          locality: validated.locality.trim(),
          city: validated.city.trim(),
          district: validated.district || null,
          state: validated.state.trim(),
          postalCode: validated.postalCode.trim(),
          latitude: lat,
          longitude: lng,
          allowAtHome: validated.allowAtHome,
          isActive: true,
        },
      });

      // 4. Default 7-day hours (09:00 - 21:00)
      for (let day = 0; day <= 6; day++) {
        await tx.salonHours.create({
          data: {
            locationId: branch.id,
            dayOfWeek: day,
            openTime: '09:00',
            closeTime: '21:00',
            isClosed: false,
          },
        });
      }

      // 5. Audit log
      await tx.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          action: 'REGISTER_SALON_APPLICATION',
          entityType: 'Salon',
          entityId: salon.id,
          detailsJson: JSON.stringify({
            businessName: salon.businessName,
            city: branch.city,
            state: branch.state,
          }),
        },
      });

      return { user, salon, branch };
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      phone: result.user.phone,
      role: 'SALON_OWNER' as const,
      salonId: result.salon.id,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Salon registered successfully! Your account is currently pending administrative review.',
      salon: {
        id: result.salon.id,
        businessName: result.salon.businessName,
        status: result.salon.status,
      },
      redirect: '/salon/dashboard',
    });

    return setAuthCookie(response, token);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Salon registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during salon onboarding' }, { status: 500 });
  }
}
