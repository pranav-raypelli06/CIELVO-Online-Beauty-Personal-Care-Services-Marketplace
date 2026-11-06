'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle, Clock, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSafetyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/admin/safety');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetch('/api/bookings')
        .then((r) => r.json())
        .then((data) => {
          if (data.bookings) {
            // Filter at-home bookings with OTP challenges
            const atHomeBookings = data.bookings.filter(
              (b: any) => b.bookingType === 'AT_HOME' && b.otpChallenges?.length > 0
            );
            setChallenges(atHomeBookings);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading safety monitoring...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Security Operations</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">
            Doorstep Two-Way OTP Safety Audit
          </h1>
        </div>

        <Link href="/admin/dashboard" className="text-xs font-semibold text-terracotta hover:underline">
          ← Return to Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-aubergine">
          Active & Historic Verification Challenges ({challenges.length})
        </h2>

        {challenges.length > 0 ? (
          <div className="space-y-4">
            {challenges.map((b: any) => {
              const chal = b.otpChallenges[0];
              const isVerified = chal?.customerOtpVerified && chal?.professionalOtpVerified;

              return (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-terracotta/10 text-xs">
                    <span className="font-mono font-bold text-terracotta uppercase">
                      Booking #{b.bookingNumber}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : chal?.isLocked
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {isVerified ? 'MUTUAL IDENTITY CONFIRMED' : chal?.isLocked ? 'CHALLENGE LOCKED' : 'VERIFICATION IN PROGRESS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-aubergine/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Customer</span>
                      <p className="font-bold text-aubergine">{b.customer?.fullName}</p>
                      <p className="text-[11px] text-aubergine/60">{b.customer?.user?.phone}</p>
                      <p className="mt-1 text-[11px]">
                        Customer OTP Status:{' '}
                        <strong>{chal?.customerOtpVerified ? 'Verified ✓' : 'Pending'}</strong>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Assigned Staff</span>
                      <p className="font-bold text-aubergine">{b.assignedStaff?.fullName}</p>
                      <p className="text-[11px] text-aubergine/60">{b.assignedStaff?.phone}</p>
                      <p className="mt-1 text-[11px]">
                        Staff OTP Status:{' '}
                        <strong>{chal?.professionalOtpVerified ? 'Verified ✓' : 'Pending'}</strong>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Salon Atelier</span>
                      <p className="font-bold text-aubergine">{b.salon?.businessName}</p>
                      <p className="text-[11px] text-aubergine/60">{b.location?.city}</p>
                      <p className="mt-1 text-[11px]">
                        Service Status: <strong>{b.status}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/20 text-center text-xs text-aubergine/70">
            No doorstep OTP challenges recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
