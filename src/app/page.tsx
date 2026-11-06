import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  Search,
  Star,
  ShieldCheck,
  Home,
  CheckCircle,
  Clock,
  ArrowRight,
  Scissors,
  Heart,
  Calendar,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import HomeSearchHero from '@/components/ui/HomeSearchHero';

export const revalidate = 60; // revalidate every 60s

export default async function HomePage() {
  // Query actual production database records
  const [categories, featuredSalons, topRatedSalons, popularServices, verifiedReviews] =
    await Promise.all([
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.salon.findMany({
        where: { status: 'APPROVED', isFeatured: true },
        take: 4,
        include: {
          locations: { where: { isActive: true } },
          salonServices: {
            where: { isActive: true },
            include: { service: true },
          },
        },
      }),
      prisma.salon.findMany({
        where: { status: 'APPROVED' },
        orderBy: { rating: 'desc' },
        take: 6,
        include: {
          locations: { where: { isActive: true } },
          salonServices: {
            where: { isActive: true },
            include: { service: true },
          },
        },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        take: 6,
        include: { category: true },
      }),
      prisma.review.findMany({
        where: { moderationStatus: 'APPROVED' },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          salon: true,
          location: true,
        },
      }),
    ]);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <HomeSearchHero categories={categories} />

      {/* 2. POPULAR BEAUTY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Curated Collections</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">Explore by Category</h2>
          </div>
          <Link
            href="/services"
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:text-terracotta-700 transition-colors"
          >
            <span>View all services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-ivory-warm border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm hover:shadow-luxury p-5 flex flex-col justify-between h-48"
            >
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-aubergine mb-3 group-hover:scale-110 transition-transform">
                  <Scissors className="w-5 h-5 text-terracotta" />
                </div>
                <h3 className="font-serif font-bold text-lg text-aubergine leading-snug group-hover:text-terracotta transition-colors">
                  {cat.name}
                </h3>
              </div>
              <p className="relative z-10 text-xs text-aubergine/70 line-clamp-2">
                {cat.description || 'Discover verified salons offering bespoke treatments.'}
              </p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blush/40 rounded-full blur-xl group-hover:bg-terracotta/20 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED SALONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Handpicked Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">Featured Salons Across India</h2>
          </div>
          <Link
            href="/explore"
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:text-terracotta-700 transition-colors"
          >
            <span>Explore all salons</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSalons.map((salon) => {
            const minPrice =
              salon.salonServices.length > 0
                ? Math.min(...salon.salonServices.map((s) => s.customPrice))
                : 499;
            const primaryBranch = salon.locations[0];

            return (
              <div
                key={salon.id}
                className="group flex flex-col bg-ivory-pure rounded-2xl overflow-hidden border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm hover:shadow-luxury-lg"
              >
                {/* Image & Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-blush-dark">
                  <Image
                    src={salon.coverImageUrl || '/images/brand/cielvo-logo-full-blush.jpg'}
                    alt={salon.businessName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aubergine/70 via-transparent to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ivory/95 backdrop-blur-sm text-aubergine font-bold text-xs shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>{salon.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-aubergine/60 font-normal">({salon.reviewCount})</span>
                  </div>

                  {/* At-Home capability badge */}
                  {salon.allowAtHome && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-terracotta text-ivory text-[10px] font-semibold tracking-wide uppercase shadow-sm">
                      <Home className="w-3 h-3" />
                      <span>At-Home Available</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-aubergine group-hover:text-terracotta transition-colors line-clamp-1">
                      {salon.businessName}
                    </h3>

                    {primaryBranch && (
                      <p className="flex items-center gap-1 text-xs text-aubergine/70 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                        <span>
                          {primaryBranch.locality}, {primaryBranch.city}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-aubergine/80 mt-2 line-clamp-2 leading-relaxed">
                      {salon.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-terracotta/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-aubergine/60 block uppercase tracking-wider">Starts from</span>
                      <span className="text-base font-bold text-aubergine">₹{minPrice}</span>
                    </div>

                    <Link
                      href={`/salons/${salon.slug}`}
                      className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AT-HOME SALON SERVICES SPOTLIGHT (CUSTOMER SAFETY FOCUS) */}
      <section className="bg-aubergine text-ivory py-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/20 border border-terracotta/40 text-terracotta text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Uncompromising Customer Safety</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight text-ivory">
                Luxury Salon Rituals at Your Doorstep. Verified & Secure.
              </h2>

              <p className="text-blush/80 text-sm sm:text-base leading-relaxed">
                Experience high-touch hair styling, advanced hydrafacials, manicures, and bridal glam in the comfort of your sanctuary. Every at-home service is strictly fulfilled by verified employees from certified salon partners.
              </p>

              {/* Safety Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-gold font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-terracotta" />
                    <span>Two-Way Doorstep OTP</span>
                  </div>
                  <p className="text-xs text-blush/70">
                    Mandatory 6-digit mutual code exchange ensures you and the salon professional verify each other before service begins.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-gold font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-terracotta" />
                    <span>Verified Salon Employees</span>
                  </div>
                  <p className="text-xs text-blush/70">
                    No unvetted freelancers. Background checked and directly employed by registered salons across India.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-gold font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-terracotta" />
                    <span>Direct Salon Payment</span>
                  </div>
                  <p className="text-xs text-blush/70">
                    Pay the salon or professional directly via UPI or Cash only after service is completed to your satisfaction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-gold font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-terracotta" />
                    <span>Sterilized Monodose Kits</span>
                  </div>
                  <p className="text-xs text-blush/70">
                    Sealed, single-use professional disposables and sanitized tools for absolute hygiene.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/at-home"
                  className="px-6 py-3.5 rounded-full bg-terracotta text-ivory text-sm font-semibold hover:bg-terracotta-600 shadow-terracotta-glow transition-all"
                >
                  Explore At-Home Services
                </Link>
                <Link
                  href="/explore?atHome=true"
                  className="px-6 py-3.5 rounded-full border border-gold/40 text-gold text-sm font-semibold hover:bg-white/5 transition-all"
                >
                  Find Salons Delivering Near Me
                </Link>
              </div>
            </div>

            {/* Visual Showcase Card */}
            <div className="relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border-2 border-gold/30 shadow-luxury-lg">
                <div className="relative h-96 w-full">
                  <Image
                    src="/images/brand/cielvo-logo-full-blush.jpg"
                    alt="CIELVO At-Home Luxury Experience"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 bg-aubergine-900/95 backdrop-blur-md border-t border-white/10 space-y-3">
                  <span className="text-xs text-terracotta uppercase tracking-wider font-semibold">Customer Safety Promise</span>
                  <h4 className="text-lg font-serif font-bold text-ivory">The Doorstep Verification Standard</h4>
                  <p className="text-xs text-blush/70 leading-relaxed">
                    Upon arrival, two independent random codes are issued. The professional enters your customer OTP, and you enter the professional OTP. Service unlocks only when both codes pass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP-RATED POPULAR SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Client Favorites</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">Most Requested Therapies</h2>
          <p className="text-sm text-aubergine/70 mt-2">
            Signature treatments crafted by master stylists, dermatologists, and nail artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 hover:border-terracotta/35 transition-all shadow-sm hover:shadow-luxury flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-blush text-aubergine">
                    {srv.category.name}
                  </span>
                  <span className="text-xs text-aubergine/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    {srv.durationMinutes} mins
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-aubergine">{srv.name}</h3>
                <p className="text-xs text-aubergine/70 line-clamp-3 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-terracotta/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-aubergine/60 block">Base Price</span>
                  <span className="text-lg font-bold text-aubergine">₹{srv.basePrice}</span>
                </div>

                <Link
                  href={`/explore?category=${srv.category.slug}`}
                  className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-semibold tracking-wide transition-colors"
                >
                  Find Salons
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW CIELVO WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-blush-light border border-terracotta/20 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Seamless Experience</span>
            <h2 className="text-3xl font-serif font-bold text-aubergine mt-1">How CIELVO Works</h2>
            <p className="text-xs sm:text-sm text-aubergine/70 mt-2">
              Book effortlessly in four transparent, customer-first steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold font-serif font-bold text-xl flex items-center justify-center shadow-md mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-aubergine">Select Location & Salon</h3>
              <p className="text-xs text-aubergine/70 leading-relaxed">
                Choose any city across India or detect your device coordinates. Explore verified salon menus, prices, and reviews.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold font-serif font-bold text-xl flex items-center justify-center shadow-md mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-aubergine">Choose In-Salon or At-Home</h3>
              <p className="text-xs text-aubergine/70 leading-relaxed">
                Visit the salon branch or request certified salon staff to visit your address at your chosen appointment slot.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold font-serif font-bold text-xl flex items-center justify-center shadow-md mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-aubergine">Two-Way Doorstep OTP</h3>
              <p className="text-xs text-aubergine/70 leading-relaxed">
                For at-home bookings, mutual 6-digit code verification confirms identity before your therapy begins.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-aubergine text-gold font-serif font-bold text-xl flex items-center justify-center shadow-md mx-auto sm:mx-0">
                4
              </div>
              <h3 className="font-serif font-bold text-lg text-aubergine">Pay Directly to Salon</h3>
              <p className="text-xs text-aubergine/70 leading-relaxed">
                Pay the salon or its professional via UPI or Cash after service. Then leave a verified review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. VERIFIED CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Client Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">Verified Experiences</h2>
          <p className="text-sm text-aubergine/70 mt-2">
            Genuine reviews submitted only after successful completed appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/15 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center font-bold text-sm text-aubergine">
                    {rev.customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-aubergine">{rev.customer.fullName}</h4>
                    <p className="text-xs text-aubergine/60">
                      Reviewed <span className="font-medium text-aubergine">{rev.salon.businessName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-gold text-gold' : 'text-aubergine/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.title && <h5 className="font-serif font-bold text-base text-aubergine">&ldquo;{rev.title}&rdquo;</h5>}
              <p className="text-xs sm:text-sm text-aubergine/80 italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>

              <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                <span>Verified Booking Review</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BECOME A SALON PARTNER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-aubergine to-aubergine-900 text-ivory p-8 sm:p-16 border border-gold/30 shadow-luxury-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="text-xs uppercase tracking-luxury text-gold font-bold">Partner Onboarding</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">
              Own a Salon? Grow Across India with CIELVO
            </h2>
            <p className="text-sm text-blush/80 leading-relaxed">
              Join India&apos;s fastest-growing luxury beauty marketplace. Manage multi-city branches, assign staff, accept appointments, and empower your team to deliver certified doorstep services.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start text-xs text-gold">
              <span className="flex items-center gap-1">✓ Multi-Branch Support</span>
              <span className="flex items-center gap-1">✓ Zero Commission on Direct Payment</span>
              <span className="flex items-center gap-1">✓ Staff Mobile Portals</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/auth/register-salon"
              className="px-8 py-4 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory font-bold text-sm tracking-wide shadow-terracotta-glow transition-all inline-block text-center"
            >
              Register Your Salon Today
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Clarifications</span>
          <h2 className="text-3xl font-serif font-bold text-aubergine mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-2">
            <h3 className="font-serif font-bold text-base text-aubergine">
              How does the two-way doorstep OTP verification work?
            </h3>
            <p className="text-xs text-aubergine/75 leading-relaxed">
              When an assigned salon professional arrives at your address for an at-home booking, they select &ldquo;I&apos;ve Arrived&rdquo;. The system sends a unique 6-digit code to your phone and a separate code to the professional&apos;s phone. You share your code with the professional, and they share theirs with you. Only when both codes are verified does the system authorize the professional to begin the service.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-2">
            <h3 className="font-serif font-bold text-base text-aubergine">
              How do I pay for my appointment?
            </h3>
            <p className="text-xs text-aubergine/75 leading-relaxed">
              CIELVO operates a transparent direct payment model. You pay the salon or its authorized professional directly after your service is completed via Cash or UPI (Google Pay, PhonePe, Paytm). The salon records the payment in the portal, and you can acknowledge it on your booking receipt.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-2">
            <h3 className="font-serif font-bold text-base text-aubergine">
              Is CIELVO available outside Mumbai and Pune?
            </h3>
            <p className="text-xs text-aubergine/75 leading-relaxed">
              Yes! CIELVO is an India-wide marketplace covering all 28 states, 8 Union Territories, districts, and PIN codes. Salons and customers can register from anywhere in India. If your exact locality has no active salons yet, you can register your interest and we will notify you the moment services launch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
