export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie, TokenPayload } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const term = validated.emailOrPhone.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: term.toLowerCase() },
          { phone: term },
          { phone: term.replace(/\D/g, '') },
        ],
      },
      include: {
        customerProfile: true,
        ownedSalons: true,
        staffProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'This account has been suspended. Please contact CIELVO concierge support.' }, { status: 403 });
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email/phone or password' }, { status: 401 });
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      name: user.customerProfile?.fullName || user.staffProfile?.fullName || (user.ownedSalons[0]?.businessName),
      customerId: user.customerProfile?.id,
      salonId: user.ownedSalons[0]?.id,
      staffId: user.staffProfile?.id,
    };

    const token = signToken(payload);

    let redirectUrl = '/customer/dashboard';
    if (user.role === 'ADMIN') redirectUrl = '/admin/dashboard';
    else if (user.role === 'SALON_OWNER') redirectUrl = '/salon/dashboard';
    else if (user.role === 'SALON_STAFF') redirectUrl = '/staff/dashboard';

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: payload,
      redirect: redirectUrl,
    });

    return setAuthCookie(response, token);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during login' }, { status: 500 });
  }
}
