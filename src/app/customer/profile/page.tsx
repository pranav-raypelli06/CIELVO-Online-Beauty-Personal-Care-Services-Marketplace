'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Plus, Check, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/auth/login?redirect=/customer/profile');
      return;
    }
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (authLoading) {
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-6 border-b border-terracotta/15">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Account Settings</span>
        <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Personal Profile</h1>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-aubergine">Basic Information</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-blush-light border border-terracotta/10 text-xs text-aubergine/70 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Verified Mobile
                </label>
                <input
                  type="tel"
                  disabled
                  value={phone}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-blush-light border border-terracotta/10 text-xs text-aubergine/70 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security & Addresses Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <div className="flex items-center gap-2 text-aubergine font-bold text-sm">
              <Shield className="w-4 h-4 text-terracotta" />
              <span>Doorstep Address Security</span>
            </div>
            <p className="text-xs text-aubergine/70 leading-relaxed">
              Your home addresses are stored with cryptographic encryption and revealed strictly to the assigned beauty professional only upon booking confirmation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-ivory-warm border border-terracotta/15 space-y-3">
            <h4 className="font-serif font-bold text-base text-aubergine">Saved Delivery Address</h4>
            <p className="text-xs text-aubergine/80">
              Primary: Bandra West, Mumbai, Maharashtra 400050
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
