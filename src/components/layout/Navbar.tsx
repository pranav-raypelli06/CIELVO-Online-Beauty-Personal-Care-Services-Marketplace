'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, User, Menu, X, ChevronDown, Sparkles, LogOut, Calendar, Heart, Shield } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { location, setIsModalOpen } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Salons', href: '/explore' },
    { label: 'Services', href: '/services' },
    { label: 'At-Home Services', href: '/at-home' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
  ];

  const getDashboardHref = () => {
    if (!user) return '/customer/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'SALON_OWNER') return '/salon/dashboard';
    if (user.role === 'SALON_STAFF') return '/staff/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-ivory/95 backdrop-blur-md border-b border-terracotta/20 transition-all shadow-sm">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20 gap-4 xl:gap-8">
          {/* 1. Left: Approved Brand Logo + Location Anchor */}
          <div className="flex items-center gap-3.5 sm:gap-5 shrink-0">
            <Link href="/" className="flex items-center group shrink-0" title="CIELVO - Home">
              <div className="relative h-14 sm:h-16 w-52 sm:w-60 xl:w-68 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/brand/cielvo-logo-wordmark.png"
                  alt="CIELVO - Your beauty. Your way."
                  fill
                  priority
                  unoptimized
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* Hairline vertical divider */}
            <div className="hidden lg:block h-7 w-px bg-terracotta/25 shrink-0" />

            {/* Location Selector Pill */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush/70 hover:bg-blush border border-terracotta/25 text-aubergine text-xs font-medium transition-all shadow-sm hover:shadow shrink-0 whitespace-nowrap cursor-pointer"
              title="Change service location"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span className="font-bold text-aubergine">{location.city || 'India'}</span>
              {location.pincode && (
                <span className="text-aubergine/65 text-[11px]">({location.pincode})</span>
              )}
              <ChevronDown className="w-3 h-3 text-aubergine/45 shrink-0" />
            </button>
          </div>

          {/* 2. Center: Navigation Links (Strict Single Horizontal Line) */}
          <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-7 2xl:gap-8 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap text-xs xl:text-sm font-semibold tracking-wide transition-colors relative py-1.5 px-1 flex items-center leading-none shrink-0 ${
                    isActive
                      ? 'text-aubergine font-bold'
                      : 'text-aubergine/75 hover:text-terracotta'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-terracotta rounded-full shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Side: Auth & User Actions (Strict Single Horizontal Line) */}
          <div className="hidden sm:flex items-center gap-2.5 xl:gap-4 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3.5 rounded-full border border-terracotta/25 bg-ivory-pure hover:bg-blush/40 transition-colors shadow-sm shrink-0 whitespace-nowrap"
                >
                  <div className="w-7 h-7 rounded-full bg-aubergine text-gold flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs font-bold text-aubergine leading-none truncate max-w-[110px]">
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <span className="text-[10px] text-terracotta uppercase tracking-wider font-semibold leading-none">
                      {user.role === 'SALON_OWNER' ? 'Salon Owner' : user.role === 'SALON_STAFF' ? 'Staff' : user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-aubergine/50 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-ivory rounded-xl shadow-luxury-lg border border-terracotta/20 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-terracotta/10">
                      <p className="text-xs text-aubergine/60">Signed in as</p>
                      <p className="text-xs font-bold text-aubergine truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors font-medium whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      Dashboard
                    </Link>

                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          href="/customer/bookings"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors whitespace-nowrap"
                        >
                          <Calendar className="w-3.5 h-3.5 text-terracotta" />
                          My Bookings
                        </Link>
                        <Link
                          href="/customer/saved"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors whitespace-nowrap"
                        >
                          <Heart className="w-3.5 h-3.5 text-terracotta" />
                          Saved Salons
                        </Link>
                      </>
                    )}

                    <div className="border-t border-terracotta/10 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 transition-colors whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/register-salon"
                  className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-terracotta hover:text-terracotta-700 px-2.5 xl:px-3 py-1.5 transition-colors leading-none shrink-0"
                >
                  Partner With Us
                </Link>
                <Link
                  href="/auth/login"
                  className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-aubergine hover:text-terracotta px-2.5 xl:px-3 py-1.5 transition-colors leading-none shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="whitespace-nowrap text-xs font-bold uppercase tracking-wider px-4 xl:px-5 py-2.5 rounded-full bg-aubergine text-ivory hover:bg-aubergine-900 shadow-luxury hover:shadow-luxury-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 leading-none shrink-0"
                >
                  <span>Join CIELVO</span>
                </Link>
              </>
            )}
          </div>

          {/* 4. Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 p-2 text-xs rounded-lg bg-blush/60 text-aubergine shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span className="font-semibold text-[11px] truncate max-w-[80px]">{location.city}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-aubergine hover:bg-blush/50 transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-terracotta/15 bg-ivory px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-blush text-aubergine font-bold'
                    : 'text-aubergine/80 hover:bg-blush/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-terracotta/10 space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-aubergine text-ivory text-sm font-medium whitespace-nowrap"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full py-2.5 px-4 text-center rounded-xl border border-rose-300 text-rose-700 text-sm font-medium whitespace-nowrap"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl border border-terracotta/30 text-aubergine text-sm font-medium whitespace-nowrap"
                >
                  Customer Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-aubergine text-ivory text-sm font-medium shadow-luxury whitespace-nowrap"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/register-salon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-terracotta text-ivory text-sm font-medium whitespace-nowrap"
                >
                  Become a Salon Partner
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
