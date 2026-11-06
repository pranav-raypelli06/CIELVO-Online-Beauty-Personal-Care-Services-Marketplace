import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistanceKm } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const locality = searchParams.get('locality');
    const pincode = searchParams.get('pincode');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const atHome = searchParams.get('atHome');
    const inSalon = searchParams.get('inSalon');
    const minRating = searchParams.get('minRating');
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const sortBy = searchParams.get('sortBy') || 'recommended';

    // Base query for approved salons
    const where: any = {
      status: 'APPROVED',
    };

    if (atHome === 'true') {
      where.allowAtHome = true;
    }
    if (inSalon === 'true') {
      where.allowInSalon = true;
    }
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    // Keyword search across salon name, description
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { businessName: { contains: term } },
        { description: { contains: term } },
        { locations: { some: { city: { contains: term } } } },
        { locations: { some: { locality: { contains: term } } } },
        { salonServices: { some: { service: { name: { contains: term } } } } },
      ];
    }

    // Location filtering through branches
    const locationWhere: any = { isActive: true };
    if (state && state !== 'All India' && state !== 'all') {
      locationWhere.state = { contains: state };
    }
    if (city && city !== 'All Cities' && city !== 'all') {
      locationWhere.city = { contains: city };
    }
    if (locality) {
      locationWhere.locality = { contains: locality };
    }
    if (pincode) {
      locationWhere.postalCode = pincode;
    }

    if (Object.keys(locationWhere).length > 1) {
      where.locations = { some: locationWhere };
    }

    // Category filter
    if (category && category !== 'all') {
      where.salonServices = {
        some: {
          isActive: true,
          service: {
            category: {
              OR: [
                { slug: category },
                { id: category },
              ],
            },
          },
        },
      };
    }

    // Fetch matching salons
    const salons = await prisma.salon.findMany({
      where,
      include: {
        locations: {
          where: { isActive: true },
          select: {
            id: true,
            branchName: true,
            addressLine: true,
            locality: true,
            city: true,
            state: true,
            postalCode: true,
            latitude: true,
            longitude: true,
            allowAtHome: true,
            phone: true,
          },
        },
        salonServices: {
          where: { isActive: true },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                slug: true,
                categoryId: true,
                genderTarget: true,
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    // Compute lowest service price and distance for each salon
    const enhancedSalons = salons.map((salon) => {
      // Find starting price
      const prices = salon.salonServices.map((s) => s.customPrice);
      const startingPrice = prices.length > 0 ? Math.min(...prices) : 499;

      // Extract unique categories
      const categories = Array.from(
        new Set(salon.salonServices.map((s) => s.service.category.name))
      );

      // Compute nearest branch distance if user coordinates provided
      let nearestDistanceKm: number | null = null;
      let primaryBranch = salon.locations[0] || null;

      if (userLat !== null && userLng !== null && salon.locations.length > 0) {
        let minDist = Infinity;
        for (const loc of salon.locations) {
          const dist = calculateDistanceKm(userLat, userLng, loc.latitude, loc.longitude);
          if (dist < minDist) {
            minDist = dist;
            primaryBranch = loc;
          }
        }
        nearestDistanceKm = minDist;
      }

      return {
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
        isFeatured: salon.isFeatured,
        startingPrice,
        categories,
        locations: salon.locations,
        primaryBranch,
        distanceKm: nearestDistanceKm,
      };
    });

    // Sort results
    if (sortBy === 'rating') {
      enhancedSalons.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      enhancedSalons.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'price_high') {
      enhancedSalons.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'nearest' && userLat !== null && userLng !== null) {
      enhancedSalons.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else {
      // Default: featured first, then rating
      enhancedSalons.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
    }

    return NextResponse.json({
      success: true,
      salons: enhancedSalons,
      total: enhancedSalons.length,
      filtersApplied: {
        state: state || 'All India',
        city: city || 'All Cities',
        category: category || 'All',
        atHome: atHome === 'true',
        inSalon: inSalon === 'true',
      },
    });
  } catch (error) {
    console.error('Marketplace search error:', error);
    return NextResponse.json({ error: 'Failed to search salons' }, { status: 500 });
  }
}
