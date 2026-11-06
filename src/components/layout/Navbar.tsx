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
    <header className="sticky top-0 z-40 w-full bg-ivory/90 backdrop-blur-md border-b border-terracotta/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Left: Approved Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-44 sm:w-52 h-14 transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src="/images/brand/cielvo-logo-wordmark.png"
                alt="CIELVO - Your beauty. Your way."
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* 2. Location Selector Pill */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush/60 hover:bg-blush border border-terracotta/20 text-aubergine text-xs font-medium transition-all shadow-sm hover:shadow"
            title="Change service location"
          >
            <MapPin className="w-3.5 h-3.5 text-terracotta" />
            <span className="font-semibold">{location.city || 'India'}</span>
            {location.pincode && <span className="text-aubergine/60">({location.pincode})</span>}
            <ChevronDown className="w-3 h-3 text-aubergine/40" />
          </button>

          {/* 3. Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-aubergine font-bold'
                      : 'text-aubergine/75 hover:text-terracotta'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 4. Right Side: Auth & User Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-terracotta/20 bg-ivory-pure hover:bg-blush/40 transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-aubergine text-gold flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-aubergine leading-none truncate max-w-[110px]">
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <span className="text-[10px] text-terracotta uppercase tracking-wider font-semibold">
                      {user.role === 'SALON_OWNER' ? 'Salon Owner' : user.role === 'SALON_STAFF' ? 'Staff' : user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-aubergine/50" />
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
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      Dashboard
                    </Link>

                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          href="/customer/bookings"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-terracotta" />
                          My Bookings
                        </Link>
                        <Link
                          href="/customer/saved"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-aubergine hover:bg-blush/50 transition-colors"
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 transition-colors"
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
                  className="text-xs font-semibold uppercase tracking-wider text-terracotta hover:text-terracotta-700 px-3 py-1.5 transition-colors"
                >
                  Partner With Us
                </Link>
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-aubergine hover:text-terracotta px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full bg-aubergine text-ivory hover:bg-aubergine-900 shadow-luxury transition-all"
                >
                  Join CIELVO
                </Link>
              </>
            )}
          </div>

          {/* 5. Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 p-2 text-xs rounded-lg bg-blush/60 text-aubergine"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span className="font-semibold text-[11px] truncate max-w-[80px]">{location.city}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-aubergine hover:bg-blush/50 transition-colors"
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
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-aubergine text-ivory text-sm font-medium"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full py-2.5 px-4 text-center rounded-xl border border-rose-300 text-rose-700 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl border border-terracotta/30 text-aubergine text-sm font-medium"
                >
                  Customer Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-aubergine text-ivory text-sm font-medium shadow-luxury"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/register-salon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-4 text-center rounded-xl bg-terracotta text-ivory text-sm font-medium"
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
