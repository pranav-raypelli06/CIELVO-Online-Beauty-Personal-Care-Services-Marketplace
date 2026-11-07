export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { recordPaymentSchema, acknowledgePaymentSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'record'; // 'record' or 'acknowledge'

    const booking = await prisma.booking.findUnique({
      where: { id: (await params).id },
      include: {
        salon: true,
        assignedStaff: true,
        customer: { include: { user: true } },
        paymentRecord: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ==========================================
    // ACTION 1: RECORD DIRECT PAYMENT (By Salon or Staff)
    // ==========================================
    if (action === 'record') {
      const isOwner = user.role === 'SALON_OWNER' && booking.salon.ownerId === user.userId;
      const isStaff = user.role === 'SALON_STAFF' && booking.assignedStaff?.userId === user.userId;
      const isAdmin = user.role === 'ADMIN';

      if (!isOwner && !isStaff && !isAdmin) {
        return NextResponse.json({ error: 'Only the salon or assigned staff can record direct payment' }, { status: 403 });
      }

      const body = await req.json();
      const validated = recordPaymentSchema.parse(body);

      const payment = await prisma.paymentRecord.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          salonId: booking.salonId,
          locationId: booking.locationId,
          customerId: booking.customerId,
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          paymentStatus: 'PROVIDER_REPORTED_PAID',
          transactionReference: validated.transactionReference || null,
          notes: validated.notes || null,
          recordedByUserId: user.userId,
        },
        update: {
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          paymentStatus: 'PROVIDER_REPORTED_PAID',
          transactionReference: validated.transactionReference || null,
          notes: validated.notes || null,
          recordedByUserId: user.userId,
        },
      });

      // Notify customer to acknowledge direct payment
      await prisma.notification.create({
        data: {
          userId: booking.customer.user.id,
          title: 'Direct Payment Recorded',
          message: `${booking.salon.businessName} recorded a direct payment of ₹${validated.amount} via ${validated.paymentMethod}. Please acknowledge or view receipt.`,
          type: 'PAYMENT',
          link: `/customer/bookings`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Direct payment recorded successfully. Customer has been notified to acknowledge.',
        payment,
      });
    }

    // ==========================================
    // ACTION 2: ACKNOWLEDGE OR DISPUTE PAYMENT (By Customer)
    // ==========================================
    if (action === 'acknowledge') {
      const isCustomer = user.role === 'CUSTOMER' && booking.customerId === user.customerId;
      const isAdmin = user.role === 'ADMIN';

      if (!isCustomer && !isAdmin) {
        return NextResponse.json({ error: 'Only the customer can acknowledge direct payment' }, { status: 403 });
      }

      if (!booking.paymentRecord) {
        return NextResponse.json({ error: 'No payment has been recorded by the salon yet' }, { status: 400 });
      }

      const body = await req.json();
      const validated = acknowledgePaymentSchema.parse(body);

      const newStatus = validated.isAcknowledged ? 'CUSTOMER_ACKNOWLEDGED' : 'DISPUTED';

      const updatedPayment = await prisma.paymentRecord.update({
        where: { bookingId: booking.id },
        data: {
          paymentStatus: newStatus,
          acknowledgedAt: validated.isAcknowledged ? new Date() : null,
          disputeReason: validated.disputeReason || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: validated.isAcknowledged
          ? 'Payment acknowledged successfully. Thank you!'
          : 'Payment dispute registered. Our grievance team and salon manager will review.',
        payment: updatedPayment,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Failed to process payment record' }, { status: 500 });
  }
}
