import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ['ADMIN']);
    if (authResult instanceof NextResponse) return authResult;

    const [
      totalCustomers,
      totalSalons,
      approvedSalons,
      pendingSalons,
      activeBranches,
      totalBookings,
      completedBookings,
      cancelledBookings,
      paymentStats,
      otpChallenges,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.salon.count(),
      prisma.salon.count({ where: { status: 'APPROVED' } }),
      prisma.salon.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.salonLocation.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.paymentRecord.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.bookingOtpChallenge.count(),
      prisma.adminAuditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { adminUser: { select: { email: true } } },
      }),
    ]);

    // State-wise salon distribution
    const stateDistribution = await prisma.salonLocation.groupBy({
      by: ['state'],
      _count: { id: true },
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        totalSalons,
        approvedSalons,
        pendingSalons,
        activeBranches,
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalReportedPaymentVolume: paymentStats._sum.amount || 0,
        totalPaymentTransactions: paymentStats._count.id || 0,
        totalDoorstepOtpChallenges: otpChallenges,
        stateDistribution,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin stats' }, { status: 500 });
  }
}
