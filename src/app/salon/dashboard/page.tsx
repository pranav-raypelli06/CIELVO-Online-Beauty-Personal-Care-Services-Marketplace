'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  Scissors,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalonDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [salonData, setSalonData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/salon/dashboard');
      return;
    }

    if (user) {
      Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()),
      ])
        .then(([userData, bookingData]) => {
          if (userData.user?.salon) {
            setSalonData(userData.user.salon);
          }
          if (bookingData.bookings) {
            setBookings(bookingData.bookings);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading salon atelier dashboard...</p>
      </div>
    );
  }

  const isPending = salonData?.status === 'PENDING_APPROVAL';

  // Metrics calculation
  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const activeAppointments = bookings.filter((b) =>
    ['ACCEPTED', 'CONFIRMED', 'PROVIDER_EN_ROUTE', 'ARRIVED', 'IDENTITY_VERIFIED', 'IN_PROGRESS'].includes(b.status)
  );
  const completedServices = bookings.filter((b) => b.status === 'COMPLETED');
  const directRevenue = bookings
    .filter((b) => b.paymentRecord)
    .reduce((sum, b) => sum + (b.paymentRecord?.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Salon Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-luxury">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Salon Management Portal</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {salonData?.status || 'APPROVED'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-aubergine">
            {salonData?.businessName || user?.salon?.businessName || 'Your Salon'}
          </h1>
          <p className="text-xs text-aubergine/70">
            India-wide beauty services marketplace management suite
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/salon/bookings"
            className="px-5 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide shadow-luxury transition-all"
          >
            Manage Bookings ({pendingRequests.length} Pending)
          </Link>
          <Link
            href="/salon/services"
            className="px-5 py-2.5 rounded-full border border-terracotta/30 bg-ivory hover:bg-blush text-aubergine text-xs font-semibold tracking-wide transition-colors"
          >
            Services & Prices
          </Link>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {isPending && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Application Under Review</h4>
            <p className="leading-relaxed">
              Your salon application has been received and is currently undergoing quality and verification review by the CIELVO administrative team. You can configure your services, add staff, and set your branch hours now. Your listing will automatically become publicly searchable across India once approved.
            </p>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <div className="flex items-center justify-between text-aubergine/60 text-xs">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{pendingRequests.length}</p>
          <span className="text-[10px] text-terracotta font-semibold">Requires Salon Action</span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <div className="flex items-center justify-between text-aubergine/60 text-xs">
            <span>Active Appointments</span>
            <Calendar className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{activeAppointments.length}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Confirmed / In-Progress</span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <div className="flex items-center justify-between text-aubergine/60 text-xs">
            <span>Completed Services</span>
            <CheckCircle className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">{completedServices.length}</p>
          <span className="text-[10px] text-aubergine/60">Verified Treatments</span>
        </div>

        <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <div className="flex items-center justify-between text-aubergine/60 text-xs">
            <span>Direct Salon Revenue</span>
            <CreditCard className="w-4 h-4 text-terracotta" />
          </div>
          <p className="text-3xl font-serif font-bold text-aubergine">₹{directRevenue.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">100% Direct Cash/UPI</span>
        </div>
      </div>

      {/* 3. Pending Requests Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-aubergine">
            Incoming Booking Requests
          </h2>
          <Link href="/salon/bookings" className="text-xs font-semibold text-terracotta hover:underline">
            View All in Bookings Tab →
          </Link>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-terracotta">#{b.bookingNumber}</span>
                    <span className="text-xs font-semibold text-aubergine">
                      {b.items?.[0]?.serviceName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blush text-aubergine font-bold uppercase">
                      {b.bookingType}
                    </span>
                  </div>
                  <p className="text-xs text-aubergine/70">
                    Customer: <strong>{b.customer?.fullName}</strong> • Date: <strong>{b.appointmentDate} at {b.appointmentTime}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-aubergine mr-2">₹{b.totalAmount}</span>
                  <Link
                    href={`/salon/bookings`}
                    className="px-4 py-2 rounded-xl bg-aubergine text-ivory text-xs font-semibold hover:bg-aubergine-900 transition-colors"
                  >
                    Accept & Assign Staff
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-ivory-warm border border-terracotta/15 text-center text-xs text-aubergine/70">
            No pending booking requests right now.
          </div>
        )}
      </div>

      {/* 4. Salon Operations Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/salon/bookings"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm space-y-2"
        >
          <div className="p-3 w-fit rounded-xl bg-blush text-aubergine">
            <Calendar className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-lg text-aubergine">Bookings & Payments</h3>
          <p className="text-xs text-aubergine/70">
            Review appointments, assign staff, and record direct customer payments.
          </p>
        </Link>

        <Link
          href="/salon/staff"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm space-y-2"
        >
          <div className="p-3 w-fit rounded-xl bg-blush text-aubergine">
            <Users className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-lg text-aubergine">Staff Management</h3>
          <p className="text-xs text-aubergine/70">
            Onboard stylists and aestheticians with secure mobile logins.
          </p>
        </Link>

        <Link
          href="/salon/branches"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm space-y-2"
        >
          <div className="p-3 w-fit rounded-xl bg-blush text-aubergine">
            <Building2 className="w-5 h-5 text-terracotta" />
          </div>
          <h3 className="font-serif font-bold text-lg text-aubergine">Branch Locations</h3>
          <p className="text-xs text-aubergine/70">
            Manage multi-city branches, addresses, GPS coordinates, and hours.
          </p>
        </Link>
      </div>
    </div>
  );
}
