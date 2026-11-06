import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const [states, citiesCount, localitiesCount, postalCodesCount] = await Promise.all([
      prisma.state.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { cities: true } },
        },
      }),
      prisma.city.count(),
      prisma.locality.count(),
      prisma.postalCode.count(),
    ]);

    return NextResponse.json({
      success: true,
      states,
      summary: {
        totalStates: states.length,
        totalCities: citiesCount,
        totalLocalities: localitiesCount,
        totalPostalCodes: postalCodesCount,
      },
    });
  } catch (error) {
    console.error('Admin geo fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve geographic records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['ADMIN']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const { type, name, stateId, cityId, postalCode, latitude, longitude } = body;

    if (type === 'CITY') {
      if (!name || !stateId) {
        return NextResponse.json({ error: 'City name and state ID are required' }, { status: 400 });
      }

      const city = await prisma.city.create({
        data: {
          name: name.trim(),
          stateId,
          latitude: latitude || null,
          longitude: longitude || null,
          isActive: true,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.userId,
          action: 'CREATE_GEO_CITY',
          entityType: 'City',
          entityId: city.id,
          detailsJson: JSON.stringify({ name: city.name, stateId }),
        },
      });

      return NextResponse.json({ success: true, message: `City ${city.name} added successfully`, city });
    }

    if (type === 'LOCALITY') {
      if (!name || !cityId) {
        return NextResponse.json({ error: 'Locality name and city ID are required' }, { status: 400 });
      }

      const locality = await prisma.locality.create({
        data: {
          name: name.trim(),
          cityId,
          postalCode: postalCode || null,
          latitude: latitude || null,
          longitude: longitude || null,
          isActive: true,
        },
      });

      if (postalCode) {
        const city = await prisma.city.findUnique({ where: { id: cityId } });
        if (city) {
          await prisma.postalCode.upsert({
            where: {
              code_localityName: {
                code: postalCode,
                localityName: locality.name,
              },
            },
            create: {
              code: postalCode,
              cityId,
              stateId: city.stateId,
              localityName: locality.name,
              latitude: latitude || null,
              longitude: longitude || null,
            },
            update: {},
          });
        }
      }

      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.userId,
          action: 'CREATE_GEO_LOCALITY',
          entityType: 'Locality',
          entityId: locality.id,
          detailsJson: JSON.stringify({ name: locality.name, postalCode }),
        },
      });

      return NextResponse.json({ success: true, message: `Locality ${locality.name} added successfully`, locality });
    }

    return NextResponse.json({ error: 'Invalid geographic entity type' }, { status: 400 });
  } catch (error) {
    console.error('Admin geo create error:', error);
    return NextResponse.json({ error: 'Failed to create geographic record' }, { status: 500 });
  }
}
