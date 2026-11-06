import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-aubergine text-ivory py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 max-w-3xl">
          <span className="text-xs uppercase tracking-luxury text-gold font-bold">The CIELVO Heritage</span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-ivory leading-tight">
            Your beauty. <br />
            <span className="text-terracotta italic font-normal">Your way.</span>
          </h1>
          <p className="text-base sm:text-xl font-serif italic text-blush/90">
            Discover salons. Explore artists. Experience beauty.
          </p>
          <p className="text-xs sm:text-sm text-blush/80 leading-relaxed font-sans">
            CIELVO is India&apos;s definitive BeautyTech marketplace. We unite discerning beauty seekers with licensed luxury salons and certified doorstep aestheticians across all 28 Indian states and 8 Union Territories.
          </p>
        </div>
      </section>

      {/* Brand Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-ivory-warm border border-terracotta/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-aubergine">Couture Excellence</h3>
            <p className="text-xs text-aubergine/75 leading-relaxed font-sans">
              Every salon and specialist featured on CIELVO passes strict compliance and skill audits. We curate spaces where artistry, botanical purity, and precision converge.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-ivory-warm border border-terracotta/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-aubergine">Doorstep Safety Standard</h3>
            <p className="text-xs text-aubergine/75 leading-relaxed font-sans">
              Our industry-first two-way mutual OTP verification ensures both client and beauty professional independently authenticate identity before doorstep services begin.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-ivory-warm border border-terracotta/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-aubergine">Direct & Transparent</h3>
            <p className="text-xs text-aubergine/75 leading-relaxed font-sans">
              Zero hidden markups. You pay the salon directly via UPI or Cash after inspecting the completed service, fostering mutual trust and honest accountability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-aubergine">
          Experience CIELVO in Your City
        </h2>
        <p className="text-xs sm:text-sm text-aubergine/70 max-w-md mx-auto">
          Explore curated salon menus, select in-salon visits or certified at-home treatments.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/explore"
            className="px-8 py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all"
          >
            Explore Salons
          </Link>
          <Link
            href="/auth/register-salon"
            className="px-8 py-3.5 rounded-full border border-terracotta/30 text-aubergine text-xs font-bold uppercase tracking-wider hover:bg-blush transition-all"
          >
            Partner With Us
          </Link>
        </div>
      </section>
    </div>
  );
}
