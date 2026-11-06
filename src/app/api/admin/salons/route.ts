import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const salons = await prisma.salon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { email: true, phone: true } },
        locations: true,
        documents: true,
        _count: {
          select: { bookings: true, reviews: true, salonServices: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      salons,
      total: salons.length,
    });
  } catch (error) {
    console.error('Admin salons fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve salons' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['ADMIN']);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const { salonId, action, rejectionReason, isFeatured } = body;

    if (!salonId || !action) {
      return NextResponse.json({ error: 'Salon ID and action are required' }, { status: 400 });
    }

    // Supported actions: 'APPROVE', 'REJECT', 'SUSPEND', 'TOGGLE_FEATURED'
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: { owner: true },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    let updatedStatus = salon.status;
    let approvedAt = salon.approvedAt;
    let reason = salon.rejectionReason;

    if (action === 'APPROVE') {
      updatedStatus = 'APPROVED';
      approvedAt = new Date();
      reason = null;
    } else if (action === 'REJECT') {
      updatedStatus = 'REJECTED';
      reason = rejectionReason || 'Application does not meet platform quality standards';
    } else if (action === 'SUSPEND') {
      updatedStatus = 'SUSPENDED';
      reason = rejectionReason || 'Suspended by platform administrator';
    }

    const updatedSalon = await prisma.$transaction(async (tx) => {
      const s = await tx.salon.update({
        where: { id: salonId },
        data: {
          status: updatedStatus,
          approvedAt,
          rejectionReason: reason,
          ...(typeof isFeatured === 'boolean' ? { isFeatured } : {}),
        },
      });

      // Audit log
      await tx.adminAuditLog.create({
        data: {
          adminUserId: user.userId,
          action: `${action}_SALON`,
          entityType: 'Salon',
          entityId: salonId,
          detailsJson: JSON.stringify({
            previousStatus: salon.status,
            newStatus: updatedStatus,
            reason,
          }),
        },
      });

      // Notify salon owner
      await tx.notification.create({
        data: {
          userId: salon.ownerId,
          title: `Salon Application ${action === 'APPROVE' ? 'Approved!' : action === 'REJECT' ? 'Rejected' : 'Suspended'}`,
          message:
            action === 'APPROVE'
              ? `Congratulations! ${salon.businessName} has been approved and is now live across India on CIELVO.`
              : `Status update for ${salon.businessName}: ${action}. Reason: ${reason}`,
          type: 'SYSTEM',
          link: '/salon/dashboard',
        },
      });

      return s;
    });

    return NextResponse.json({
      success: true,
      message: `Salon application successfully updated to ${updatedStatus}`,
      salon: updatedSalon,
    });
  } catch (error) {
    console.error('Admin salon status update error:', error);
    return NextResponse.json({ error: 'Failed to update salon status' }, { status: 500 });
  }
}
