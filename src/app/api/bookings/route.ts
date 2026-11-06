import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations';
import { formatAddress } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['CUSTOMER']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    if (!user.customerId) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 400 });
    }

    const body = await req.json();
    const validated = createBookingSchema.parse(body);

    // Fetch the salon service to confirm pricing and availability
    const salonService = await prisma.salonService.findUnique({
      where: { id: validated.salonServiceId },
      include: {
        service: { include: { category: true } },
        salon: true,
        location: true,
      },
    });

    if (!salonService || !salonService.isActive) {
      return NextResponse.json({ error: 'The requested service is not currently available' }, { status: 400 });
    }

    if (validated.bookingType === 'AT_HOME') {
      if (!salonService.allowAtHome || !salonService.location.allowAtHome) {
        return NextResponse.json({ error: 'At-home delivery is not available for this service at this branch' }, { status: 400 });
      }
      if (!validated.addressLine1 || !validated.locality || !validated.city || !validated.postalCode) {
        return NextResponse.json({ error: 'Complete delivery address is mandatory for at-home service' }, { status: 400 });
      }
    }

    // Format address snapshot
    let serviceAddressSnapshot: string | null = null;
    if (validated.bookingType === 'AT_HOME') {
      serviceAddressSnapshot = formatAddress({
        addressLine1: validated.addressLine1!,
        addressLine2: validated.addressLine2,
        landmark: validated.landmark,
        locality: validated.locality!,
        city: validated.city!,
        state: validated.state || salonService.location.state,
        postalCode: validated.postalCode!,
      });
    }

    // Generate unique booking number: CLV-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingNumber = `CLV-${year}-${randomSuffix}`;

    // Create booking in database
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: user.customerId!,
          salonId: validated.salonId,
          locationId: validated.locationId,
          salonServiceId: validated.salonServiceId,
          bookingType: validated.bookingType,
          status: 'REQUESTED',
          appointmentDate: validated.appointmentDate,
          appointmentTime: validated.appointmentTime,
          serviceDurationMinutes: salonService.customDurationMinutes,
          servicePrice: salonService.customPrice,
          totalAmount: salonService.customPrice,
          customerNotes: validated.customerNotes || null,
          serviceAddressSnapshot,
          customerLatitude: validated.customerLatitude || null,
          customerLongitude: validated.customerLongitude || null,
        },
      });

      // Snapshot line item
      await tx.bookingItem.create({
        data: {
          bookingId: newBooking.id,
          serviceName: salonService.service.name,
          categoryName: salonService.service.category.name,
          price: salonService.customPrice,
          durationMinutes: salonService.customDurationMinutes,
        },
      });

      // Initial status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: newBooking.id,
          fromStatus: null,
          toStatus: 'REQUESTED',
          changedByUserId: user.userId,
          notes: `Booking requested by customer ${user.name || user.email}`,
        },
      });

      // Notify salon owner
      await tx.notification.create({
        data: {
          userId: salonService.salon.ownerId,
          title: 'New Booking Request',
          message: `New ${validated.bookingType === 'AT_HOME' ? 'At-Home' : 'In-Salon'} booking request for ${salonService.service.name} on ${validated.appointmentDate} at ${validated.appointmentTime}.`,
          type: 'BOOKING',
          link: `/salon/bookings`,
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request placed successfully! The salon has been notified to confirm.',
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        totalAmount: booking.totalAmount,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Failed to create booking request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    if (user.role === 'CUSTOMER') {
      if (!user.customerId) return NextResponse.json({ bookings: [] });
      where.customerId = user.customerId;
    } else if (user.role === 'SALON_OWNER') {
      if (!user.salonId) return NextResponse.json({ bookings: [] });
      where.salonId = user.salonId;
    } else if (user.role === 'SALON_STAFF') {
      if (!user.staffId) return NextResponse.json({ bookings: [] });
      where.staffId = user.staffId;
    }
    // Admin sees all

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        salon: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
          },
        },
        location: {
          select: {
            id: true,
            branchName: true,
            phone: true,
            addressLine: true,
            locality: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
        items: true,
        assignedStaff: {
          select: {
            id: true,
            fullName: true,
            roleTitle: true,
            avatarUrl: true,
            phone: true,
          },
        },
        customer: {
          select: {
            fullName: true,
            avatarUrl: true,
            user: { select: { phone: true, email: true } },
          },
        },
        paymentRecord: true,
        review: true,
        otpChallenges: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            customerOtpVerified: true,
            professionalOtpVerified: true,
            isLocked: true,
            expiresAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}
