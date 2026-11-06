'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Clock, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalonBranchesManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/salon/branches');
      return;
    }
    if (user) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.salon) {
            return fetch(`/api/salons/${data.user.salon.id}`);
          }
        })
        .then((r) => r?.json())
        .then((data) => {
          if (data?.salon) setSalon(data.salon);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading branches...</div>;
  }

  const branches = salon?.locations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Location Management</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Multi-Branch Network</h1>
        </div>

        <Link href="/salon/dashboard" className="text-xs font-semibold text-terracotta hover:underline">
          ← Back to Salon Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-aubergine">
          Registered Branches ({branches.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((b: any) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Active Branch
                </span>
                {b.allowAtHome && (
                  <span className="text-[10px] text-terracotta font-bold uppercase">
                    At-Home Enabled
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-aubergine">{b.branchName}</h3>
                <p className="text-xs text-aubergine/70 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                  <span>
                    {b.addressLine}, {b.locality}, {b.city}, {b.state} - {b.postalCode}
                  </span>
                </p>
                <p className="text-xs text-aubergine/70 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-terracotta" />
                  <span>{b.phone}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-terracotta/10 text-xs text-aubergine/80 flex justify-between">
                <span>Staff: <strong>{b.staff?.length || 0} professionals</strong></span>
                <span>Radius: <strong>{b.serviceRadiusKm} km</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
