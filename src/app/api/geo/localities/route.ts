import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId');
    const cityName = searchParams.get('cityName');
    const pincode = searchParams.get('pincode');

    const where: any = { isActive: true };

    if (cityId) {
      where.cityId = cityId;
    } else if (cityName) {
      const city = await prisma.city.findFirst({
        where: { name: { equals: cityName } },
      });
      if (city) {
        where.cityId = city.id;
      }
    }

    if (pincode) {
      where.postalCode = pincode;
    }

    const localities = await prisma.locality.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        city: {
          select: {
            name: true,
            state: { select: { name: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      localities,
      total: localities.length,
    });
  } catch (error) {
    console.error('Error fetching localities:', error);
    return NextResponse.json({ error: 'Failed to fetch localities' }, { status: 500 });
  }
}
