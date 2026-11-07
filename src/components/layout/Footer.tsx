import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-aubergine text-ivory pt-16 pb-12 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1 & 2: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative w-56 h-16 brightness-0 invert">
              <Image
                src="/images/brand/cielvo-logo-wordmark.png"
                alt="CIELVO - Your beauty. Your way."
                fill
                unoptimized
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-blush/80 max-w-sm leading-relaxed font-sans">
              Discover salons. Explore artists. Experience beauty. CIELVO is India&apos;s premier beauty marketplace connecting discerning clients with certified salons and verified doorstep beauty professionals.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-gold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-terracotta" />
                <span>Two-Way Doorstep OTP Safety</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-terracotta" />
                <span>100% Direct Salon Payment</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-gold font-semibold mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm text-blush/75">
              <li>
                <Link href="/explore" className="hover:text-terracotta transition-colors">
                  Explore Salons Across India
                </Link>
              </li>
              <li>
                <Link href="/at-home" className="hover:text-terracotta transition-colors">
                  At-Home Salon Services
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-terracotta transition-colors">
                  Full Service Catalogue
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-terracotta transition-colors">
                  Special Promotions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-terracotta transition-colors">
                  About CIELVO
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Salon Partners */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-gold font-semibold mb-4">Salon Partners</h4>
            <ul className="space-y-2.5 text-sm text-blush/75">
              <li>
                <Link href="/auth/register-salon" className="hover:text-terracotta transition-colors font-medium text-ivory">
                  Register Your Salon
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-terracotta transition-colors">
                  Partner Portal Login
                </Link>
              </li>
              <li>
                <Link href="/legal/partner-terms" className="hover:text-terracotta transition-colors">
                  Salon Partner Agreement
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-terracotta transition-colors">
                  Staff Member Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Grievance & Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-gold font-semibold mb-4">Concierge & Legal</h4>
            <ul className="space-y-2.5 text-sm text-blush/75">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                <a href="tel:+917264845323" className="hover:text-terracotta transition-colors">
                  +917264845323
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                <a href="mailto:cielvotechnologies@gmail.com" className="truncate hover:text-terracotta transition-colors">
                  cielvotechnologies@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <Link href="/legal/privacy" className="hover:text-terracotta transition-colors block text-xs">
                  Privacy Policy (India DPDPA)
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-terracotta transition-colors block text-xs">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Pan-India Geographic Coverage Bar - Cities removed */}
        <div className="py-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-blush/70">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-terracotta shrink-0" />
            <span className="font-semibold text-ivory">Pan-India Availability:</span>
            <span>Covering all 28 States, 8 Union Territories, Districts & PIN Codes nationwide.</span>
          </div>
          <div className="text-xs text-gold font-medium">
            Discover & Book Certified Salons Anywhere in India
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-blush/60 gap-4">
          <p>© {new Date().getFullYear()} CIELVO Technologies Private Limited. All rights reserved.</p>
          <p className="max-w-xl text-center md:text-right">
            Important Notice: CIELVO operates as a discovery and booking marketplace connecting customers with registered salons. All payments are paid directly to the salon or its authorized professional after service.
          </p>
        </div>
      </div>
    </footer>
  );
}
