import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateId = searchParams.get('stateId');
    const stateName = searchParams.get('stateName');
    const query = searchParams.get('q');

    const where: any = { isActive: true };

    if (stateId) {
      where.stateId = stateId;
    } else if (stateName) {
      const state = await prisma.state.findFirst({
        where: { name: { equals: stateName } },
      });
      if (state) {
        where.stateId = state.id;
      }
    }

    if (query && query.trim()) {
      where.name = { contains: query.trim() };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        state: {
          select: { name: true, code: true },
        },
        _count: {
          select: { locations: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      cities,
      total: cities.length,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
