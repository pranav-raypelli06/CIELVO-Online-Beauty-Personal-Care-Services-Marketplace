import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const states = await prisma.state.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        isUnionTerritory: true,
        _count: {
          select: { cities: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      states,
      total: states.length,
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
}
