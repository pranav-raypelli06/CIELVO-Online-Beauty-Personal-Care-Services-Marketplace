'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerSavedSalonsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/auth/login?redirect=/customer/saved');
      return;
    }
    // Load featured salons as sample saved list if user is logged in
    fetch('/api/salons')
      .then((res) => res.json())
      .then((data) => {
        if (data.salons) {
          setSalons(data.salons.slice(0, 2));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading saved salons...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Your Curation</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Saved Salons & Ateliers</h1>
        </div>
        <Link href="/explore" className="text-xs font-semibold text-terracotta hover:underline">
          Explore More Salons →
        </Link>
      </div>

      {salons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <div
              key={salon.id}
              className="p-5 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-aubergine flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    {salon.rating.toFixed(1)} ({salon.reviewCount})
                  </span>
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>

                <h3 className="font-serif font-bold text-xl text-aubergine">{salon.businessName}</h3>
                <p className="text-xs text-aubergine/70 line-clamp-2">{salon.description}</p>
                {salon.locations?.[0] && (
                  <p className="text-xs text-aubergine/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta" />
                    <span>{salon.locations[0].locality}, {salon.locations[0].city}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-terracotta/10 flex items-center justify-between">
                <span className="text-xs font-bold text-aubergine">From ₹{salon.startingPrice}</span>
                <Link
                  href={`/salons/${salon.slug}`}
                  className="px-4 py-2 rounded-xl bg-aubergine text-ivory text-xs font-semibold hover:bg-aubergine-900 transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/20 text-center space-y-3">
          <p className="text-xs text-aubergine/70">You haven&apos;t saved any salons yet.</p>
          <Link
            href="/explore"
            className="inline-block px-5 py-2.5 rounded-full bg-aubergine text-ivory text-xs font-semibold"
          >
            Explore Salons
          </Link>
        </div>
      )}
    </div>
  );
}
