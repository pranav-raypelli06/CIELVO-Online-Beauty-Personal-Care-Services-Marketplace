'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/admin/dashboard');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetch('/api/admin/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) setStats(data.stats);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading executive oversight...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-aubergine text-ivory shadow-luxury">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-luxury text-gold font-bold">Executive Control Room</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">
            CIELVO Platform Administration
          </h1>
          <p className="text-xs text-blush/80">
            India-wide beauty services marketplace analytics, compliance, and safety oversight
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/salons"
            className="px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase tracking-wider shadow-terracotta-glow transition-all"
          >
            Review Salons ({stats?.pendingSalons || 0} Pending)
          </Link>
          <Link
            href="/admin/geography"
            className="px-5 py-2.5 rounded-full border border-gold/40 text-gold hover:bg-white/5 text-xs font-semibold tracking-wider transition-colors"
          >
            Manage Geography
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-aubergine/60 font-semibold">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{stats?.totalCustomers || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Registered Nationwide</span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-aubergine/60 font-semibold">
            <span>Approved Salons</span>
            <Building2 className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{stats?.approvedSalons || 0}</p>
          <span className="text-[10px] text-amber-800 font-semibold">
            {stats?.pendingSalons || 0} Pending Applications
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-aubergine/60 font-semibold">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{stats?.totalBookings || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {stats?.completedBookings || 0} Completed
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-aubergine/60 font-semibold">
            <span>Direct Payment Volume</span>
            <CreditCard className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">
            ₹{(stats?.totalReportedPaymentVolume || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-aubergine/60">
            {stats?.totalPaymentTransactions || 0} Recorded Payments
          </span>
        </div>
      </div>

      {/* 3. Safety & Geographic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* State Performance Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-xl text-aubergine flex items-center gap-2">
            <MapPin className="w-5 h-5 text-terracotta" />
            <span>State-Wise Salon Distribution</span>
          </h3>
          <p className="text-xs text-aubergine/70">
            Active branches distributed across Indian states & Union Territories.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
            {stats?.stateDistribution && stats.stateDistribution.length > 0 ? (
              stats.stateDistribution.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-ivory-warm border border-terracotta/10 text-xs"
                >
                  <span className="font-bold text-aubergine">{item.state}</span>
                  <span className="px-2.5 py-1 rounded-md bg-blush text-aubergine font-bold">
                    {item._count.id} branches
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-aubergine/60">No state data recorded.</p>
            )}
          </div>
        </div>

        {/* Safety & Audit Stream */}
        <div className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-xl text-aubergine flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-terracotta" />
            <span>Doorstep Safety & Audit Events</span>
          </h3>
          <p className="text-xs text-aubergine/70">
            Total two-way OTP challenges generated: <strong>{stats?.totalDoorstepOtpChallenges || 0}</strong>
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
            {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
              stats.recentAuditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-ivory-warm border border-terracotta/10 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-terracotta uppercase tracking-wide">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-aubergine/50">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-aubergine/70 text-[11px] truncate">
                    Target: {log.entityType} #{log.entityId}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-aubergine/60">No recent audit logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
