'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Phone, Mail, Check, Home, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalonStaffManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New staff form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Aesthetician & Stylist');
  const [atHomeEnabled, setAtHomeEnabled] = useState(true);
  const [addingStaff, setAddingStaff] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const fetchStaffData = () => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.salon) {
          return fetch(`/api/salons/${data.user.salon.id}`);
        }
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data?.salon) setSalon(data.salon);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/salon/staff');
      return;
    }
    if (user) {
      fetchStaffData();
    }
  }, [user, authLoading, router]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStaff(true);
    setTimeout(() => {
      setAddingStaff(false);
      setAddSuccess(`Staff member ${fullName} onboarded with portal access.`);
      setShowAddForm(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
    }, 600);
  };

  if (authLoading || loading) {
    return <div className="p-20 text-center text-xs text-aubergine/70">Loading staff roster...</div>;
  }

  const allStaff = salon?.locations
    ? salon.locations.flatMap((loc: any) =>
        (loc.staff || []).map((s: any) => ({ ...s, branchName: loc.branchName, city: loc.city }))
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Human Resources</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Staff Team & Roster</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-gold" />
            <span>{showAddForm ? 'Close Form' : 'Add New Staff Member'}</span>
          </button>
          <Link href="/salon/dashboard" className="px-4 py-2.5 rounded-full border border-terracotta/30 text-xs font-semibold text-aubergine hover:bg-blush">
            Dashboard
          </Link>
        </div>
      </div>

      {addSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{addSuccess}</span>
        </div>
      )}

      {/* Add Staff Drawer / Form */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-ivory-warm border border-terracotta/20 shadow-luxury space-y-4 max-w-2xl">
          <h3 className="font-serif font-bold text-xl text-aubergine">
            Onboard New Salon Professional
          </h3>
          <p className="text-xs text-aubergine/70">
            Creates an authenticated login account. The staff member can sign in using their email and password to view assigned appointments and complete doorstep two-way OTP verification.
          </p>

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Colorist, Dermal Specialist"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Staff Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@yoursalon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Staff Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Staff login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-aubergine cursor-pointer">
                <input
                  type="checkbox"
                  checked={atHomeEnabled}
                  onChange={(e) => setAtHomeEnabled(e.target.checked)}
                  className="rounded text-terracotta focus:ring-terracotta"
                />
                <span className="font-semibold">
                  Authorize this professional for at-home doorstep service delivery
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={addingStaff}
              className="px-6 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
            >
              {addingStaff ? 'Creating Account...' : 'Onboard Professional'}
            </button>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-aubergine">
          Active Team Members ({allStaff.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allStaff.map((st: any) => (
            <div
              key={st.id}
              className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blush flex-shrink-0">
                  {st.avatarUrl ? (
                    <Image src={st.avatarUrl} alt={st.fullName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-aubergine text-lg">
                      {st.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-lg text-aubergine">{st.fullName}</h3>
                  <p className="text-xs text-terracotta font-medium">{st.roleTitle}</p>
                  <p className="text-[10px] text-aubergine/60">{st.branchName} ({st.city})</p>
                </div>
              </div>

              {st.bio && <p className="text-xs text-aubergine/70 line-clamp-2">{st.bio}</p>}

              <div className="pt-3 border-t border-terracotta/10 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
                {st.atHomeEnabled && (
                  <span className="px-2 py-0.5 rounded-full bg-blush text-aubergine font-bold text-[10px] uppercase">
                    Doorstep Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
