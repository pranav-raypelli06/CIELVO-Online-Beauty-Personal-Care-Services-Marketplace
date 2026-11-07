export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateBookingStatusSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const validated = updateBookingStatusSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: (await params).id },
      include: {
        salon: true,
        assignedStaff: true,
        customer: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const currentStatus = booking.status;
    const targetStatus = validated.status;

    // Authorization checks based on target transition
    const isOwner = user.role === 'SALON_OWNER' && booking.salon.ownerId === user.userId;
    const isStaff = user.role === 'SALON_STAFF' && booking.assignedStaff?.userId === user.userId;
    const isCustomer = user.role === 'CUSTOMER' && booking.customerId === user.customerId;
    const isAdmin = user.role === 'ADMIN';

    // 1. REJECT / ACCEPT
    if (targetStatus === 'ACCEPTED' || targetStatus === 'REJECTED') {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the salon owner or administrator can accept or reject bookings' }, { status: 403 });
      }
      if (currentStatus !== 'REQUESTED') {
        return NextResponse.json({ error: `Cannot transition to ${targetStatus} from current status ${currentStatus}` }, { status: 400 });
      }
      if (targetStatus === 'REJECTED' && !validated.cancellationReason) {
        return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
      }
    }

    // 2. PROVIDER_EN_ROUTE / ARRIVED
    if (targetStatus === 'PROVIDER_EN_ROUTE' || targetStatus === 'ARRIVED') {
      if (!isStaff && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the assigned professional or salon can update transit/arrival status' }, { status: 403 });
      }
    }

    // 3. START SERVICE (IN_PROGRESS)
    if (targetStatus === 'IN_PROGRESS') {
      if (!isStaff && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the assigned professional or salon can start the service' }, { status: 403 });
      }

      // CRITICAL SAFETY CHECK:
      // If this is an AT_HOME booking, the service CANNOT start unless IDENTITY_VERIFIED has passed!
      if (booking.bookingType === 'AT_HOME') {
        if (currentStatus !== 'IDENTITY_VERIFIED') {
          return NextResponse.json(
            { error: 'Customer safety rule: Two-way doorstep OTP verification is mandatory before starting an at-home service.' },
            { status: 400 }
          );
        }
      }
    }

    // 4. MARK COMPLETED
    if (targetStatus === 'COMPLETED') {
      if (!isStaff && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the assigned professional or salon can mark service completed' }, { status: 403 });
      }
    }

    // 5. CANCEL
    if (targetStatus === 'CANCELLED') {
      if (!isCustomer && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 });
      }
      if (['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(currentStatus)) {
        return NextResponse.json({ error: `Cannot cancel a booking that is currently ${currentStatus}` }, { status: 400 });
      }
    }

    // Prepare timestamp updates
    const updateData: any = {
      status: targetStatus,
    };

    if (targetStatus === 'ACCEPTED') updateData.acceptedAt = new Date();
    if (targetStatus === 'ARRIVED') updateData.arrivedAt = new Date();
    if (targetStatus === 'IN_PROGRESS') updateData.startedAt = new Date();
    if (targetStatus === 'COMPLETED') updateData.completedAt = new Date();
    if (targetStatus === 'CANCELLED' || targetStatus === 'REJECTED') {
      updateData.cancellationReason = validated.cancellationReason || validated.notes || 'Cancelled';
      updateData.cancelledBy = user.role;
    }

    // Execute state update transactionally
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: updateData,
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          changedByUserId: user.userId,
          notes: validated.notes || validated.cancellationReason || `Status changed to ${targetStatus}`,
        },
      });

      // Send notifications to relevant parties
      let recipientUserId: string | null = null;
      if (isOwner || isStaff) {
        recipientUserId = booking.customer.user.id;
      } else if (isCustomer) {
        recipientUserId = booking.salon.ownerId;
      }

      if (recipientUserId) {
        await tx.notification.create({
          data: {
            userId: recipientUserId,
            title: `Booking Update: ${targetStatus.replace(/_/g, ' ')}`,
            message: `Your booking #${booking.bookingNumber} is now ${targetStatus.replace(/_/g, ' ')}.`,
            type: 'BOOKING',
            link: isCustomer ? `/salon/bookings` : `/customer/bookings`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${targetStatus}`,
      status: targetStatus,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error updating booking status:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
