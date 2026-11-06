'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

interface HomeSearchHeroProps {
  categories: { id: string; name: string; slug: string }[];
}

export default function HomeSearchHero({ categories }: HomeSearchHeroProps) {
  const router = useRouter();
  const { location, setIsModalOpen } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (location.city) params.set('city', location.city);
    if (location.state) params.set('state', location.state);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-light via-ivory to-ivory py-16 lg:py-24 border-b border-terracotta/10">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blush/60 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-terracotta/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Search (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush border border-terracotta/25 text-aubergine text-xs font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>India-Wide BeautyTech Marketplace</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-aubergine leading-[1.08]">
                Your beauty. <br />
                <span className="italic font-normal text-terracotta">Your way.</span>
              </h1>
              <p className="text-base sm:text-xl text-aubergine/80 font-serif italic max-w-xl mx-auto lg:mx-0">
                Discover salons. Explore artists. Experience beauty.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-aubergine/70 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans">
              From flagship couture salons to certified at-home professionals verified with doorstep two-way OTP. Seamless booking across all Indian states and Union Territories.
            </p>

            {/* Live Search Box */}
            <form
              onSubmit={handleSearch}
              className="mt-6 p-2.5 sm:p-3 rounded-2xl sm:rounded-full bg-ivory-pure border border-terracotta/25 shadow-luxury-lg flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto lg:mx-0"
            >
              {/* Location Selector Trigger */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl sm:rounded-full bg-blush-light hover:bg-blush border border-terracotta/15 text-aubergine text-xs font-medium transition-colors flex-shrink-0"
              >
                <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span className="font-semibold truncate max-w-[120px]">{location.city || 'Select City'}</span>
              </button>

              {/* Service / Salon Input */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search salons, hydrafacial, balayage, nails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-aubergine placeholder:text-aubergine/50 bg-transparent focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-luxury transition-all flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Find Salons</span>
              </button>
            </form>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/explore"
                className="px-6 py-3 rounded-full bg-aubergine text-ivory text-xs font-semibold tracking-wider uppercase hover:bg-aubergine-900 shadow-luxury transition-all flex items-center gap-2"
              >
                <span>Explore Salons</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold" />
              </Link>
              <Link
                href="/at-home"
                className="px-6 py-3 rounded-full bg-ivory-pure border border-terracotta/30 text-terracotta hover:bg-blush/40 text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm"
              >
                <Home className="w-3.5 h-3.5" />
                <span>At-Home Services</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Hero Visuals (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury-lg border-2 border-terracotta/20">
              <Image
                src="/images/brand/cielvo-logo-full-blush.jpg"
                alt="CIELVO Beauty & Salon Experience"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-aubergine/80 via-transparent to-transparent" />

              {/* Floating Pill 1: Verified Salons */}
              <div className="absolute top-6 left-6 p-3 rounded-2xl bg-ivory/95 backdrop-blur-md shadow-luxury border border-terracotta/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-terracotta flex items-center justify-center text-ivory">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-aubergine">100% Verified Salons</p>
                  <p className="text-[10px] text-aubergine/70">Certified Employees Only</p>
                </div>
              </div>

              {/* Floating Pill 2: Direct Payment */}
              <div className="absolute bottom-6 right-6 p-3 rounded-2xl bg-ivory/95 backdrop-blur-md shadow-luxury border border-terracotta/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-aubergine flex items-center justify-center text-gold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-aubergine">Direct Salon Payment</p>
                  <p className="text-[10px] text-aubergine/70">Cash or UPI after service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
