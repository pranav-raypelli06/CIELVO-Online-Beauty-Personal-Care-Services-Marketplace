import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { locationInterestSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = locationInterestSchema.parse(body);

    const interest = await prisma.locationInterest.create({
      data: {
        state: validated.state,
        city: validated.city,
        pincode: validated.pincode || null,
        email: validated.email || null,
        phone: validated.phone || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! We have noted your area. CIELVO is expanding rapidly and we will notify you as soon as salons launch in your locality.',
      id: interest.id,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to register interest' }, { status: 500 });
  }
}
