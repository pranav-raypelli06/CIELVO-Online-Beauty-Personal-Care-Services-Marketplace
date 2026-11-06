import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        customerProfile: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            defaultCity: true,
            defaultState: true,
          },
        },
        ownedSalons: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            status: true,
            logoUrl: true,
          },
        },
        staffProfile: {
          select: {
            id: true,
            fullName: true,
            roleTitle: true,
            locationId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        name: user.customerProfile?.fullName || user.staffProfile?.fullName || user.ownedSalons[0]?.businessName,
        customerProfile: user.customerProfile,
        salon: user.ownedSalons[0] || null,
        staff: user.staffProfile || null,
      },
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
