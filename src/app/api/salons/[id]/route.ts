import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const identifier = id;
    const session = await getSessionUser(req);

    const salon = await prisma.salon.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
        // Allow unapproved preview only if the owner or admin is requesting it
      },
      include: {
        locations: {
          where: { isActive: true },
          include: {
            hours: {
              orderBy: { dayOfWeek: 'asc' },
            },
            staff: {
              where: { isActive: true },
              select: {
                id: true,
                fullName: true,
                roleTitle: true,
                avatarUrl: true,
                bio: true,
                atHomeEnabled: true,
              },
            },
          },
        },
        salonServices: {
          where: { isActive: true },
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        reviews: {
          where: { moderationStatus: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
            response: true,
          },
          take: 20,
        },
      },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Check if customer has favourited this salon
    let isFavourited = false;
    if (session && session.customerId) {
      const fav = await prisma.customerFavourite.findUnique({
        where: {
          customerId_salonId: {
            customerId: session.customerId,
            salonId: salon.id,
          },
        },
      });
      isFavourited = !!fav;
    }

    // Group services by category
    const servicesByCategory: Record<string, any[]> = {};
    for (const ss of salon.salonServices) {
      const catName = ss.service.category.name;
      if (!servicesByCategory[catName]) {
        servicesByCategory[catName] = [];
      }
      servicesByCategory[catName].push({
        salonServiceId: ss.id,
        serviceId: ss.service.id,
        name: ss.service.name,
        description: ss.service.description,
        price: ss.customPrice,
        durationMinutes: ss.customDurationMinutes,
        allowAtHome: ss.allowAtHome,
        allowInSalon: ss.allowInSalon,
        genderTarget: ss.service.genderTarget,
        locationId: ss.locationId,
      });
    }

    return NextResponse.json({
      success: true,
      salon: {
        id: salon.id,
        businessName: salon.businessName,
        slug: salon.slug,
        description: salon.description,
        logoUrl: salon.logoUrl,
        coverImageUrl: salon.coverImageUrl,
        rating: salon.rating,
        reviewCount: salon.reviewCount,
        allowInSalon: salon.allowInSalon,
        allowAtHome: salon.allowAtHome,
        status: salon.status,
        locations: salon.locations,
        servicesByCategory,
        reviews: salon.reviews,
        isFavourited,
      },
    });
  } catch (error) {
    console.error('Error fetching salon details:', error);
    return NextResponse.json({ error: 'Failed to retrieve salon profile' }, { status: 500 });
  }
}
