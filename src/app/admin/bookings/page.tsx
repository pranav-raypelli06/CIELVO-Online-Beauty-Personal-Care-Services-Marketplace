'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, CreditCard, Shield, Star, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/admin/bookings');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetch('/api/bookings')
        .then((r) => r.json())
        .then((data) => {
          if (data.bookings) setBookings(data.bookings);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading booking records...</div>;
  }

  const filtered = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.salon?.businessName?.toLowerCase().includes(q) ||
      b.customer?.fullName?.toLowerCase().includes(q) ||
      b.location?.city?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Audit & Dispute Oversight</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Platform Bookings Roster</h1>
        </div>

        <Link href="/admin/dashboard" className="text-xs font-semibold text-terracotta hover:underline">
          ← Return to Dashboard
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-ivory-warm border border-terracotta/15 flex items-center gap-3">
        <Search className="w-4 h-4 text-aubergine/40" />
        <input
          type="text"
          placeholder="Filter by booking #, customer, salon, city, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-aubergine placeholder:text-aubergine/40 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-ivory-pure border border-terracotta/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-terracotta">#{b.bookingNumber}</span>
                  <span className="text-aubergine/40">•</span>
                  <span className="font-bold text-aubergine">{b.salon?.businessName} ({b.location?.city})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blush text-aubergine font-bold uppercase">
                    {b.bookingType}
                  </span>
                </div>

                <p className="text-aubergine/80">
                  Service: <strong>{b.items?.[0]?.serviceName}</strong> (₹{b.totalAmount})
                </p>

                <p className="text-aubergine/60">
                  Customer: <strong>{b.customer?.fullName}</strong> ({b.customer?.user?.phone}) • Slot: {b.appointmentDate} at {b.appointmentTime}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {b.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-aubergine/60 bg-ivory-warm rounded-3xl">
            No bookings found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
