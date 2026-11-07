import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { assignStaffSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req, ['SALON_OWNER', 'ADMIN']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const validated = assignStaffSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: (await params).id },
      include: {
        salon: true,
        customer: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (user.role === 'SALON_OWNER' && booking.salon.ownerId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this salon' }, { status: 403 });
    }

    // Verify staff exists and is active
    const staff = await prisma.salonStaff.findUnique({
      where: { id: validated.staffId },
      include: { location: true },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: 'Staff member not found or is currently inactive' }, { status: 400 });
    }

    // Check staff at-home capability if booking is AT_HOME
    if (booking.bookingType === 'AT_HOME' && !staff.atHomeEnabled) {
      return NextResponse.json({ error: 'This staff member is not authorized for at-home service delivery' }, { status: 400 });
    }

    // Double booking prevention: Check for overlapping confirmed appointments
    const overlapping = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        staffId: staff.id,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        status: { in: ['CONFIRMED', 'PROVIDER_EN_ROUTE', 'ARRIVED', 'IDENTITY_VERIFIED', 'IN_PROGRESS'] },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: `Conflict: ${staff.fullName} already has a confirmed appointment at ${booking.appointmentTime} on ${booking.appointmentDate}.` },
        { status: 409 }
      );
    }

    // Update staff and transition to CONFIRMED
    const updatedStatus = booking.status === 'REQUESTED' || booking.status === 'ACCEPTED' ? 'CONFIRMED' : booking.status;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          staffId: staff.id,
          status: updatedStatus,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: updatedStatus,
          changedByUserId: user.userId,
          notes: `Staff member ${staff.fullName} assigned to booking.`,
        },
      });

      // Notify customer
      await tx.notification.create({
        data: {
          userId: booking.customer.user.id,
          title: 'Staff Assigned to Your Booking',
          message: `${staff.fullName} (${staff.roleTitle}) from ${booking.salon.businessName} has been assigned to your appointment on ${booking.appointmentDate}.`,
          type: 'BOOKING',
          link: `/customer/bookings`,
        },
      });

      // Notify staff if they have an active user account
      if (staff.userId) {
        await tx.notification.create({
          data: {
            userId: staff.userId,
            title: 'New Appointment Assigned',
            message: `You have been assigned to appointment #${booking.bookingNumber} on ${booking.appointmentDate} at ${booking.appointmentTime}.`,
            type: 'BOOKING',
            link: `/staff/dashboard`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Staff ${staff.fullName} assigned successfully`,
      staff: {
        id: staff.id,
        fullName: staff.fullName,
        roleTitle: staff.roleTitle,
        avatarUrl: staff.avatarUrl,
      },
      status: updatedStatus,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error assigning staff:', error);
    return NextResponse.json({ error: 'Failed to assign staff member' }, { status: 500 });
  }
}
