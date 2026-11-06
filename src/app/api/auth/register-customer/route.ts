import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { customerRegisterSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = customerRegisterSchema.parse(body);

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 400 });
    }

    // Check if phone exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone: validated.phone.trim() },
    });
    if (existingPhone) {
      return NextResponse.json({ error: 'An account with this mobile number already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(validated.password);

    // Create user and customer profile transactionally
    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone.trim(),
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        customerProfile: {
          create: {
            fullName: validated.fullName.trim(),
            defaultState: validated.state,
            defaultCity: validated.city,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'CUSTOMER' as const,
      name: user.customerProfile?.fullName,
      customerId: user.customerProfile?.id,
    };

    const token = signToken(tokenPayload);

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to CIELVO',
        message: 'Your personal beauty concierge is now active. Discover top-rated salons across India or experience certified doorstep services.',
        type: 'SYSTEM',
        link: '/explore',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome to CIELVO.',
      user: tokenPayload,
      redirect: '/customer/dashboard',
    });

    return setAuthCookie(response, token);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Customer registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during registration' }, { status: 500 });
  }
}
