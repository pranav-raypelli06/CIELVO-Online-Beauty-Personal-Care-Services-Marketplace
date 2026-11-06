'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Home,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { location } = useLocation();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/auth/login?redirect=/customer/dashboard');
      return;
    }

    if (user && user.role === 'CUSTOMER') {
      fetch('/api/bookings')
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) setBookings(data.bookings);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading customer sanctuary...</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) =>
    ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'PROVIDER_EN_ROUTE', 'ARRIVED', 'IDENTITY_VERIFIED', 'IN_PROGRESS'].includes(b.status)
  );

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-blush-light border border-terracotta/20 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Customer Sanctuary</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-aubergine">
            Welcome back, {user?.name || 'Valued Guest'}
          </h1>
          <p className="text-xs text-aubergine/70 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-terracotta" />
            <span>Browsing salons in: <strong>{location.city}, {location.state}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide shadow-luxury transition-all"
          >
            Explore Salons
          </Link>
          <Link
            href="/at-home"
            className="px-5 py-2.5 rounded-full border border-terracotta/30 bg-ivory hover:bg-blush text-aubergine text-xs font-semibold tracking-wide transition-colors"
          >
            Book At-Home
          </Link>
        </div>
      </div>

      {/* 2. Live Active / Upcoming Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-aubergine flex items-center gap-2">
            <span>Upcoming Appointments</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-aubergine text-ivory font-sans font-bold">
              {upcomingBookings.length}
            </span>
          </h2>
          <Link href="/customer/bookings" className="text-xs font-semibold text-terracotta hover:underline">
            View All Bookings →
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-luxury space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-aubergine/60 font-bold tracking-wider">
                      {b.bookingNumber}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-aubergine mt-0.5">
                      {b.salon?.businessName}
                    </h3>
                    <p className="text-xs text-aubergine/70">{b.location?.branchName} ({b.location?.city})</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'ARRIVED'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'IN_PROGRESS'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blush text-aubergine'
                    }`}
                  >
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-warm border border-terracotta/10 space-y-1.5 text-xs text-aubergine/80">
                  <div className="flex items-center justify-between font-semibold text-aubergine">
                    <span>{b.items?.[0]?.serviceName}</span>
                    <span>₹{b.totalAmount}</span>
                  </div>
                  <div className="flex items-center gap-3 text-aubergine/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-terracotta" />
                      {b.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-terracotta" />
                      {b.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1">
                      {b.bookingType === 'AT_HOME' ? (
                        <span className="text-terracotta font-bold flex items-center gap-0.5">
                          <Home className="w-3 h-3" /> At-Home
                        </span>
                      ) : (
                        'In-Salon'
                      )}
                    </span>
                  </div>
                </div>

                {/* If staff assigned, show staff badge */}
                {b.assignedStaff && (
                  <div className="flex items-center gap-2.5 text-xs text-aubergine">
                    <div className="w-7 h-7 rounded-full bg-blush flex items-center justify-center font-bold text-xs">
                      {b.assignedStaff.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{b.assignedStaff.fullName}</p>
                      <p className="text-[10px] text-aubergine/60">{b.assignedStaff.roleTitle}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href={`/customer/bookings`}
                    className="text-xs font-bold text-terracotta hover:underline"
                  >
                    Manage & Track Booking →
                  </Link>

                  {b.status === 'ARRIVED' && b.bookingType === 'AT_HOME' && (
                    <Link
                      href="/customer/bookings"
                      className="px-3.5 py-1.5 rounded-full bg-terracotta text-ivory text-xs font-bold animate-bounce"
                    >
                      Enter OTP Verification
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-ivory-warm border border-terracotta/15 text-center space-y-3">
            <p className="text-xs sm:text-sm text-aubergine/70">You have no upcoming appointments.</p>
            <Link
              href="/explore"
              className="inline-block px-5 py-2.5 rounded-full bg-aubergine text-ivory text-xs font-semibold"
            >
              Discover Salons Near You
            </Link>
          </div>
        )}
      </div>

      {/* 3. Quick Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/customer/bookings"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm flex items-center gap-4"
        >
          <div className="p-3.5 rounded-2xl bg-blush text-aubergine">
            <Calendar className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-aubergine">My Bookings</h3>
            <p className="text-xs text-aubergine/70">View past treatments & receipts</p>
          </div>
        </Link>

        <Link
          href="/customer/saved"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm flex items-center gap-4"
        >
          <div className="p-3.5 rounded-2xl bg-blush text-aubergine">
            <Heart className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Saved Salons</h3>
            <p className="text-xs text-aubergine/70">Revisit your favourite ateliers</p>
          </div>
        </Link>

        <Link
          href="/customer/profile"
          className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm flex items-center gap-4"
        >
          <div className="p-3.5 rounded-2xl bg-blush text-aubergine">
            <User className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Account Profile</h3>
            <p className="text-xs text-aubergine/70">Addresses & security settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
