import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  createTwoWayOtpChallenge,
  verifyCustomerOtpByStaff,
  verifyProfessionalOtpByCustomer,
} from '@/lib/otp';
import { sendOtpSms } from '@/lib/sms';
import { verifyOtpSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'generate'; // generate, verify-customer, verify-professional

    const booking = await prisma.booking.findUnique({
      where: { id: (await params).id },
      include: {
        assignedStaff: { include: { user: true } },
        customer: { include: { user: true } },
        salon: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.bookingType !== 'AT_HOME') {
      return NextResponse.json({ error: 'Doorstep two-way OTP verification is only applicable to at-home services' }, { status: 400 });
    }

    if (!booking.assignedStaff) {
      return NextResponse.json({ error: 'Cannot initiate doorstep verification: No staff assigned' }, { status: 400 });
    }

    // ==========================================
    // ACTION 1: GENERATE / ARRIVAL
    // ==========================================
    if (action === 'generate') {
      // Must be assigned staff, salon owner, or admin
      const isStaff = user.role === 'SALON_STAFF' && booking.assignedStaff.userId === user.userId;
      const isOwner = user.role === 'SALON_OWNER' && booking.salon.ownerId === user.userId;
      const isAdmin = user.role === 'ADMIN';

      if (!isStaff && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the assigned staff or salon can mark arrival and initiate verification' }, { status: 403 });
      }

      // Record arrival and update status
      const arrivedAt = new Date();
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'ARRIVED',
            arrivedAt,
          },
        });

        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            fromStatus: booking.status,
            toStatus: 'ARRIVED',
            changedByUserId: user.userId,
            notes: `Assigned professional marked arrival at doorstep. Generated two-way OTP challenge.`,
          },
        });
      });

      // Generate cryptographically secure two-way OTP challenge
      const otpPair = await createTwoWayOtpChallenge();

      // Upsert challenge for this booking
      const challenge = await prisma.bookingOtpChallenge.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          staffId: booking.assignedStaff.id,
          customerId: booking.customerId,
          customerOtpHashed: otpPair.customerOtpHashed,
          professionalOtpHashed: otpPair.professionalOtpHashed,
          expiresAt: otpPair.expiresAt,
        },
        update: {
          customerOtpHashed: otpPair.customerOtpHashed,
          professionalOtpHashed: otpPair.professionalOtpHashed,
          customerOtpVerified: false,
          professionalOtpVerified: false,
          failedAttemptsCustomer: 0,
          failedAttemptsProfessional: 0,
          isLocked: false,
          expiresAt: otpPair.expiresAt,
          verifiedAt: null,
        },
      });

      // Dispatch SMS
      // 1. Send customerOtp to Customer's phone
      const customerPhone = booking.customer.user.phone;
      const smsCustomer = await sendOtpSms(customerPhone, otpPair.customerOtp, 'CUSTOMER');

      // 2. Send professionalOtp to Professional's phone
      const staffPhone = booking.assignedStaff.phone;
      const smsStaff = await sendOtpSms(staffPhone, otpPair.professionalOtp, 'PROFESSIONAL');

      // In-app notifications
      await prisma.notification.create({
        data: {
          userId: booking.customer.user.id,
          title: 'Professional Arrived at Doorstep',
          message: `${booking.assignedStaff.fullName} has arrived! Your verification code is ready. Check your SMS or booking screen.`,
          type: 'OTP',
          link: `/customer/bookings`,
        },
      });

      const isDev = process.env.NODE_ENV !== 'production' && process.env.OTP_DEV_MODE === 'true';

      return NextResponse.json({
        success: true,
        message: 'Arrival recorded. Two-way verification codes generated and sent to both customer and professional.',
        challengeId: challenge.id,
        expiresAt: challenge.expiresAt,
        // In development mode only, expose demo codes to assist automated testing
        ...(isDev
          ? {
              devDemoNotice: 'DEVELOPMENT TEST MODE ONLY: Real SMS simulated.',
              devCustomerCode: otpPair.customerOtp,
              devProfessionalCode: otpPair.professionalOtp,
            }
          : {}),
      });
    }

    // ==========================================
    // ACTION 2: VERIFY CUSTOMER OTP (Entered by Staff)
    // ==========================================
    if (action === 'verify-customer') {
      const isStaff = user.role === 'SALON_STAFF' && booking.assignedStaff.userId === user.userId;
      const isOwner = user.role === 'SALON_OWNER' && booking.salon.ownerId === user.userId;
      const isAdmin = user.role === 'ADMIN';

      if (!isStaff && !isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the assigned staff can submit the customer verification code' }, { status: 403 });
      }

      const body = await req.json();
      const validated = verifyOtpSchema.parse(body);

      const challenge = await prisma.bookingOtpChallenge.findUnique({
        where: { bookingId: booking.id },
      });

      if (!challenge) {
        return NextResponse.json({ error: 'No active OTP challenge found for this booking' }, { status: 404 });
      }

      const clientIp = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await verifyCustomerOtpByStaff(
        challenge.id,
        validated.code,
        user.userId,
        clientIp,
        userAgent
      );

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        isFullyVerified: result.isFullyVerified,
      });
    }

    // ==========================================
    // ACTION 3: VERIFY PROFESSIONAL OTP (Entered by Customer)
    // ==========================================
    if (action === 'verify-professional') {
      const isCustomer = user.role === 'CUSTOMER' && booking.customerId === user.customerId;
      const isAdmin = user.role === 'ADMIN';

      if (!isCustomer && !isAdmin) {
        return NextResponse.json({ error: 'Only the customer can submit the professional verification code' }, { status: 403 });
      }

      const body = await req.json();
      const validated = verifyOtpSchema.parse(body);

      const challenge = await prisma.bookingOtpChallenge.findUnique({
        where: { bookingId: booking.id },
      });

      if (!challenge) {
        return NextResponse.json({ error: 'No active OTP challenge found for this booking' }, { status: 404 });
      }

      const clientIp = req.headers.get('x-forwarded-for') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      const result = await verifyProfessionalOtpByCustomer(
        challenge.id,
        validated.code,
        user.userId,
        clientIp,
        userAgent
      );

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        isFullyVerified: result.isFullyVerified,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Doorstep OTP error:', error);
    return NextResponse.json({ error: 'Failed to process doorstep OTP verification' }, { status: 500 });
  }
}
