import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Lock,
  Smartphone,
  Check,
  ArrowRight,
  Home,
  UserCheck,
} from 'lucide-react';

export default function AtHomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO */}
      <section className="bg-aubergine text-ivory py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/20 border border-terracotta/40 text-terracotta text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Salon Employees Only</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold leading-tight text-ivory">
              At-Home Salon Services. <br />
              <span className="text-terracotta italic font-normal">Reimagined for Unmatched Safety.</span>
            </h1>

            <p className="text-sm sm:text-base text-blush/80 leading-relaxed font-sans max-w-2xl">
              CIELVO transforms personal care at home. We do not dispatch unverified gig freelancers. Every doorstep appointment is fulfilled exclusively by certified, background-verified professionals employed by registered luxury salons across India.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/explore?atHome=true"
                className="px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase tracking-wider shadow-terracotta-glow transition-all"
              >
                Book At-Home Salon
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. THE TWO-WAY DOORSTEP OTP VERIFICATION PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Proprietary Security</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine">
            Two-Way Doorstep OTP Verification
          </h2>
          <p className="text-xs sm:text-sm text-aubergine/70">
            How our mandatory doorstep verification protects both you and the beauty professional before service begins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-aubergine text-gold font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Professional Arrives</h3>
            <p className="text-xs text-aubergine/70 leading-relaxed">
              The assigned salon professional travels to your verified address and taps &ldquo;I&apos;ve Arrived&rdquo; in their authenticated staff dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-aubergine text-gold font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Dual OTPs Dispatched</h3>
            <p className="text-xs text-aubergine/70 leading-relaxed">
              The server generates two independent 6-digit random codes: Customer OTP is sent to your mobile; Professional OTP is sent to the staff member&apos;s phone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-aubergine text-gold font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Mutual Code Exchange</h3>
            <p className="text-xs text-aubergine/70 leading-relaxed">
              After confirming the professional&apos;s photo and salon badge, you verbally share your code. The professional enters your code, and you enter theirs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-aubergine text-gold font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h3 className="font-serif font-bold text-lg text-aubergine">Identity Verified</h3>
            <p className="text-xs text-aubergine/70 leading-relaxed">
              Only when both codes pass cryptographic verification does the portal unlock &ldquo;Start Service&rdquo;. No bypass is ever permitted.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE PILLARS OF OUR AT-HOME STANDARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-blush-light border border-terracotta/20 space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">The CIELVO Guarantee</span>
            <h2 className="text-3xl font-serif font-bold text-aubergine">Our 4 Pillars of Doorstep Excellence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-ivory border border-terracotta/15">
              <div className="p-3 rounded-xl bg-terracotta text-ivory flex-shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-aubergine">Registered Salon Employees Only</h4>
                <p className="text-xs text-aubergine/70 leading-relaxed">
                  We strictly onboard existing, licensed salons. Every beauty professional arriving at your doorstep is a permanent or contractual employee of that salon with background verification and salon manager accountability.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-ivory border border-terracotta/15">
              <div className="p-3 rounded-xl bg-terracotta text-ivory flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-aubergine">Customer Address Confidentiality</h4>
                <p className="text-xs text-aubergine/70 leading-relaxed">
                  Your home address is never made public. It is revealed strictly to the assigned professional only after salon acceptance, and access is revoked once the appointment is concluded.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-ivory border border-terracotta/15">
              <div className="p-3 rounded-xl bg-terracotta text-ivory flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-aubergine">Sealed Monodose Products</h4>
                <p className="text-xs text-aubergine/70 leading-relaxed">
                  Facials, waxing, and manicures use factory-sealed, single-use monodose kits opened in front of you. Tools are sterilized in clinical autoclaves prior to arrival.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-ivory border border-terracotta/15">
              <div className="p-3 rounded-xl bg-terracotta text-ivory flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-aubergine">Pay Directly After Service</h4>
                <p className="text-xs text-aubergine/70 leading-relaxed">
                  No advance payments, no platform wallets. Pay the salon or professional via UPI or Cash only after you inspect and approve the completed service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. READY TO EXPERIENCE CTA */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-aubergine">
          Ready for a Bespoke In-Home Experience?
        </h2>
        <p className="text-xs sm:text-sm text-aubergine/70 max-w-lg mx-auto leading-relaxed">
          Select your city and discover salons currently offering doorstep therapies in your neighborhood.
        </p>
        <div className="pt-2">
          <Link
            href="/explore?atHome=true"
            className="px-8 py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all inline-block"
          >
            Find At-Home Salons Near You
          </Link>
        </div>
      </section>
    </div>
  );
}
