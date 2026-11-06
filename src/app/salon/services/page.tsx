'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Clock, Plus, Check, Home, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalonServicesManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/salon/services');
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
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading service catalogue...</div>;
  }

  const allServices = salon?.servicesByCategory
    ? Object.entries(salon.servicesByCategory).flatMap(([cat, list]: any) =>
        list.map((item: any) => ({ ...item, categoryName: cat }))
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Menu Management</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Salon Services & Pricing</h1>
        </div>

        <Link href="/salon/dashboard" className="text-xs font-semibold text-terracotta hover:underline">
          ← Back to Salon Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-aubergine">
          Active Services ({allServices.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allServices.map((srv: any, idx: number) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blush text-aubergine">
                    {srv.categoryName}
                  </span>
                  <span className="text-xs text-aubergine/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    {srv.durationMinutes} mins
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-aubergine">{srv.name}</h3>
                <p className="text-xs text-aubergine/70 line-clamp-2">{srv.description}</p>
              </div>

              <div className="pt-3 border-t border-terracotta/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-aubergine/60 uppercase block">Salon Price</span>
                  <span className="text-lg font-bold text-aubergine">₹{srv.price}</span>
                </div>

                <div className="flex gap-1.5 text-[10px]">
                  {srv.allowInSalon && (
                    <span className="px-2 py-1 rounded bg-aubergine text-ivory font-bold">In-Salon</span>
                  )}
                  {srv.allowAtHome && (
                    <span className="px-2 py-1 rounded bg-terracotta text-ivory font-bold flex items-center gap-0.5">
                      <Home className="w-3 h-3" /> At-Home
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
