'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Building2, User, Mail, Phone, Lock, MapPin, Check, AlertCircle, Home, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterSalonPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Primary Branch Location
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressLine, setAddressLine] = useState('');

  // Step 3: Service capabilities
  const [allowInSalon, setAllowInSalon] = useState(true);
  const [allowAtHome, setAllowAtHome] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/geo/states')
      .then((res) => res.json())
      .then((data) => {
        if (data.states) setStates(data.states);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please agree to the Salon Partner Agreement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          ownerName,
          email,
          phone,
          password,
          registrationNumber: registrationNumber || undefined,
          description,
          state,
          district: district || undefined,
          city,
          locality,
          postalCode,
          addressLine,
          allowInSalon,
          allowAtHome,
          termsAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register salon');
      } else {
        await refreshUser();
        router.push('/salon/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-ivory-pure p-8 sm:p-12 rounded-3xl border border-terracotta/20 shadow-luxury-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block relative w-56 sm:w-64 h-16">
            <Image
              src="/images/brand/cielvo-logo-wordmark.png"
              alt="CIELVO - Your beauty. Your way." fill priority unoptimized className="object-contain"
            />
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-blush text-aubergine text-[10px] uppercase font-bold tracking-wider">
            Salon Partner Onboarding
          </div>
          <h1 className="text-3xl font-serif font-bold text-aubergine">
            Register Your Salon on CIELVO
          </h1>
          <p className="text-xs text-aubergine/70 max-w-md mx-auto">
            Scale your salon appointments across India. Manage multiple branches, staff schedules, and offer certified doorstep beauty services.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BUSINESS ESSENTIALS */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-aubergine border-b border-terracotta/15 pb-2">
              1. Business & Owner Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Salon / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Luxury Salon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Owner / Authorized Representative *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@yoursalon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Business Mobile (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Create Admin Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  GST / Trade License No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                Atelier Description & Specialties *
              </label>
              <textarea
                rows={3}
                required
                minLength={20}
                placeholder="Describe your salon, services, ambiance, hygiene standards, and team expertise..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* SECTION 2: PRIMARY BRANCH ADDRESS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-serif font-bold text-aubergine border-b border-terracotta/15 pb-2">
              2. Primary Branch Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  State / UT *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                >
                  {states.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Pune, Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Locality / Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra West, Indiranagar"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Complete Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Shop / Unit No., Building Name, Street"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  PIN Code (6 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="400050"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SERVICE CAPABILITIES */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-serif font-bold text-aubergine border-b border-terracotta/15 pb-2">
              3. Service Delivery Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-ivory border border-terracotta/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowInSalon}
                  onChange={(e) => setAllowInSalon(e.target.checked)}
                  className="mt-1 rounded text-aubergine focus:ring-aubergine"
                />
                <div>
                  <p className="text-xs font-bold text-aubergine">In-Salon Appointments</p>
                  <p className="text-[11px] text-aubergine/70">
                    Customers visit your salon branch premises for scheduled treatments.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-ivory border border-terracotta/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAtHome}
                  onChange={(e) => setAllowAtHome(e.target.checked)}
                  className="mt-1 rounded text-terracotta focus:ring-terracotta"
                />
                <div>
                  <p className="text-xs font-bold text-aubergine flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-terracotta" /> At-Home Doorstep Delivery
                  </p>
                  <p className="text-[11px] text-aubergine/70">
                    Your certified salon employees travel to customer addresses with two-way doorstep OTP verification.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Terms Agreement & Notice */}
          <div className="p-4 rounded-2xl bg-blush-light border border-terracotta/20 space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="partner-terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-terracotta focus:ring-terracotta"
              />
              <label htmlFor="partner-terms" className="text-xs text-aubergine/80 cursor-pointer">
                I agree to the{' '}
                <Link href="/legal/partner-terms" className="text-terracotta font-bold underline">
                  Salon Partner Terms & Conditions
                </Link>
                . I acknowledge that newly registered salons are placed in{' '}
                <strong className="text-aubergine">PENDING_APPROVAL</strong> status until verified by CIELVO administration.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Submit Salon Partner Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
