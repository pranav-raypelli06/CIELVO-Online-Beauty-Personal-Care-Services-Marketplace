'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { refreshUser } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
      } else {
        await refreshUser();
        router.push(redirectParam || data.redirect || '/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Auto-Fill Helper
  const fillCredentials = (role: 'CUSTOMER' | 'SALON_OWNER' | 'SALON_STAFF' | 'ADMIN') => {
    if (role === 'CUSTOMER') {
      setEmailOrPhone('priya@cielvo.com');
      setPassword('CielvoPass@2026');
    } else if (role === 'SALON_OWNER') {
      setEmailOrPhone('owner.aura@cielvo.com');
      setPassword('CielvoPass@2026');
    } else if (role === 'SALON_STAFF') {
      setEmailOrPhone('staff.meera@cielvo.com');
      setPassword('CielvoPass@2026');
    } else if (role === 'ADMIN') {
      setEmailOrPhone('admin@cielvo.com');
      setPassword('AdminPassword@2026');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-ivory-pure p-8 sm:p-10 rounded-3xl border border-terracotta/20 shadow-luxury-lg">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block relative w-56 sm:w-64 h-16">
            <Image
              src="/images/brand/cielvo-logo-wordmark.png"
              alt="CIELVO - Your beauty. Your way." fill priority unoptimized className="object-contain"
            />
          </Link>
          <h2 className="text-2xl font-serif font-bold text-aubergine">Welcome Back</h2>
          <p className="text-xs text-aubergine/70">Sign in to manage your appointments and beauty portfolio</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-aubergine/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="name@cielvo.com or 10-digit mobile"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-aubergine/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-aubergine/40 hover:text-aubergine"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="pt-4 border-t border-terracotta/15 space-y-2">
          <span className="text-[10px] text-aubergine/60 uppercase tracking-wider font-semibold block text-center">
            Demo Test Profiles (One-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillCredentials('CUSTOMER')}
              className="px-2.5 py-1.5 rounded-lg bg-blush-light hover:bg-blush text-aubergine border border-terracotta/15 text-center font-medium"
            >
              Customer (Priya)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('SALON_OWNER')}
              className="px-2.5 py-1.5 rounded-lg bg-blush-light hover:bg-blush text-aubergine border border-terracotta/15 text-center font-medium"
            >
              Salon Owner (Aura)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('SALON_STAFF')}
              className="px-2.5 py-1.5 rounded-lg bg-blush-light hover:bg-blush text-aubergine border border-terracotta/15 text-center font-medium"
            >
              Staff (Meera)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('ADMIN')}
              className="px-2.5 py-1.5 rounded-lg bg-blush-light hover:bg-blush text-aubergine border border-terracotta/15 text-center font-medium"
            >
              Platform Admin
            </button>
          </div>
        </div>

        {/* Sign Up Links */}
        <div className="text-center space-y-2 text-xs text-aubergine/70 pt-2">
          <p>
            Don&apos;t have a customer account?{' '}
            <Link href="/auth/register" className="text-terracotta font-bold hover:underline">
              Sign Up
            </Link>
          </p>
          <p>
            Are you a salon owner?{' '}
            <Link href="/auth/register-salon" className="text-terracotta font-bold hover:underline">
              Partner With Us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-aubergine/70">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
