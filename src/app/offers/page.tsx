import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Tag, ArrowRight, Clock, Star } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function OffersPage() {
  const featuredSalons = await prisma.salon.findMany({
    where: { status: 'APPROVED', isFeatured: true },
    include: {
      locations: true,
      salonServices: { include: { service: true } },
    },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Seasonal Privileges</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-aubergine">
          Special Salon Promotions
        </h1>
        <p className="text-sm text-aubergine/70 leading-relaxed font-sans">
          Discover exclusive treatments, introductory privileges, and seasonal beauty rituals across verified CIELVO salons nationwide.
        </p>
      </div>

      {/* Featured Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-aubergine via-aubergine-900 to-terracotta-900 text-ivory border border-gold/30 shadow-luxury-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Welcome Privilege</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">
            Complimentary Kérastase Caviar Infusion
          </h2>
          <p className="text-xs sm:text-sm text-blush/80 leading-relaxed">
            Book any haircut or facial therapy above ₹1,800 across participating flagship salons in Mumbai, Bengaluru, and Delhi NCR and enjoy a complimentary caviar gloss infusion.
          </p>
        </div>

        <Link
          href="/explore"
          className="px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase tracking-wider shadow-terracotta-glow transition-all whitespace-nowrap"
        >
          Explore Participating Salons
        </Link>
      </div>

      {/* Offers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredSalons.map((salon) => (
          <div
            key={salon.id}
            className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blush text-aubergine">
                  Atelier Special
                </span>
                <span className="text-xs font-bold text-aubergine flex items-center gap-1">
                  <Star className="w-3 h-3 fill-gold text-gold" />
                  {salon.rating.toFixed(1)}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-aubergine">{salon.businessName}</h3>
              <p className="text-xs text-aubergine/70 line-clamp-2">{salon.description}</p>
            </div>

            <div className="pt-4 border-t border-terracotta/10 flex items-center justify-between">
              <span className="text-xs font-bold text-terracotta">Direct Payment at Salon</span>
              <Link
                href={`/salons/${salon.slug}`}
                className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold transition-colors"
              >
                View Menu
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
