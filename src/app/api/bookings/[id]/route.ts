export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getGoogleMapsNavigationUrl } from '@/lib/maps';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const booking = await prisma.booking.findUnique({
      where: { id: (await params).id },
      include: {
        salon: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            ownerId: true,
          },
        },
        location: true,
        items: true,
        assignedStaff: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            roleTitle: true,
            avatarUrl: true,
            phone: true,
            bio: true,
          },
        },
        customer: {
          include: {
            user: { select: { phone: true, email: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        paymentRecord: true,
        review: {
          include: { response: true },
        },
        otpChallenges: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            customerOtpVerified: true,
            professionalOtpVerified: true,
            isLocked: true,
            expiresAt: true,
            failedAttemptsCustomer: true,
            failedAttemptsProfessional: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role-based access control
    const isCustomer = user.role === 'CUSTOMER' && booking.customerId === user.customerId;
    const isSalonOwner = user.role === 'SALON_OWNER' && booking.salon.ownerId === user.userId;
    const isAssignedStaff = user.role === 'SALON_STAFF' && booking.assignedStaff?.userId === user.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isSalonOwner && !isAssignedStaff && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view this booking' }, { status: 403 });
    }

    // CRITICAL PRIVACY RULE:
    // Customer's exact delivery address is ONLY visible if:
    // 1. The booking is active AND
    // 2. The viewer is the assigned staff, salon owner, or admin.
    let sanitizedAddress: string | null = null;
    let navigationUrl: string | null = null;

    if (booking.bookingType === 'AT_HOME') {
      const isAuthorizedParty = isAssignedStaff || isSalonOwner || isAdmin || isCustomer;
      const isBookingActive = !['CANCELLED', 'REJECTED'].includes(booking.status);

      if (isAuthorizedParty && isBookingActive) {
        sanitizedAddress = booking.serviceAddressSnapshot;
        if ((isAssignedStaff || isSalonOwner) && booking.customerLatitude && booking.customerLongitude) {
          navigationUrl = getGoogleMapsNavigationUrl(
            booking.customerLatitude,
            booking.customerLongitude,
            sanitizedAddress || undefined
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        serviceAddressSnapshot: sanitizedAddress,
        navigationUrl,
      },
    });
  } catch (error) {
    console.error('Error retrieving single booking:', error);
    return NextResponse.json({ error: 'Failed to retrieve booking details' }, { status: 500 });
  }
}
