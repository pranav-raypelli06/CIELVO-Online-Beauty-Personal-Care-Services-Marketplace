import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { submitReviewSchema } from '@/lib/validations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(req, ['CUSTOMER']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const { id } = await params;
    const validated = submitReviewSchema.parse({ ...body, bookingId: id });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== user.customerId) {
      return NextResponse.json({ error: 'You can only review bookings made by your account' }, { status: 403 });
    }

    // ELIGIBILITY RULE: Only completed bookings can be reviewed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'You can only submit a verified review after your service is completed' }, { status: 400 });
    }

    if (booking.review) {
      return NextResponse.json({ error: 'You have already submitted a review for this booking' }, { status: 400 });
    }

    // Create review and recalculate salon average rating
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          salonId: booking.salonId,
          locationId: booking.locationId,
          rating: validated.rating,
          title: validated.title,
          comment: validated.comment,
          isVerifiedBooking: true,
          moderationStatus: 'APPROVED',
        },
      });

      // Recalculate salon average rating
      const allApprovedReviews = await tx.review.findMany({
        where: {
          salonId: booking.salonId,
          moderationStatus: 'APPROVED',
        },
        select: { rating: true },
      });

      const totalRating = allApprovedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allApprovedReviews.length;
      const roundedRating = Math.round(avgRating * 10) / 10;

      await tx.salon.update({
        where: { id: booking.salonId },
        data: {
          rating: roundedRating,
          reviewCount: allApprovedReviews.length,
        },
      });

      return newReview;
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
