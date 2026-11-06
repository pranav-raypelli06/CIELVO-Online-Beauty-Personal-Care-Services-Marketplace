import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scissors, Clock, Sparkles, Home, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      services: {
        where: { isActive: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Treatments & Therapies</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-aubergine">
          Beauty Services Catalogue
        </h1>
        <p className="text-sm text-aubergine/70 leading-relaxed font-sans">
          Browse luxury therapies across our 7 core categories. Book appointments in top salons across India or experience certified doorstep delivery.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-terracotta/15 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-aubergine">{cat.name}</h2>
                <p className="text-xs sm:text-sm text-aubergine/70 mt-1 max-w-xl">{cat.description}</p>
              </div>
              <Link
                href={`/explore?category=${cat.slug}`}
                className="mt-3 sm:mt-0 text-xs font-semibold text-terracotta hover:text-terracotta-700 flex items-center gap-1"
              >
                <span>Find Salons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-aubergine/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-terracotta" />
                        {srv.durationMinutes} mins
                      </span>
                      {srv.allowAtHome && (
                        <span className="flex items-center gap-0.5 text-terracotta font-semibold text-[10px]">
                          <Home className="w-3 h-3" /> At-Home
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-xl text-aubergine">{srv.name}</h3>
                    <p className="text-xs text-aubergine/75 line-clamp-3 leading-relaxed">{srv.description}</p>
                  </div>

                  <div className="pt-4 border-t border-terracotta/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-aubergine/60 block">Base Price</span>
                      <span className="text-base font-bold text-aubergine">₹{srv.basePrice}</span>
                    </div>

                    <Link
                      href={`/explore?category=${cat.slug}&q=${encodeURIComponent(srv.name)}`}
                      className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold transition-colors"
                    >
                      Find Salons
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
