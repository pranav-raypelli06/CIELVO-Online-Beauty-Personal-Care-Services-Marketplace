'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Search, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

export default function LocationModal() {
  const { location, setLocation, detectDeviceLocation, isDetecting, detectError, isModalOpen, setIsModalOpen } = useLocation();

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState(location.state || '');
  const [selectedCity, setSelectedCity] = useState(location.city || '');
  const [pincodeInput, setPincodeInput] = useState(location.pincode || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [interestEmail, setInterestEmail] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestSubmitting, setInterestSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetch('/api/geo/states')
        .then((res) => res.json())
        .then((data) => {
          if (data.states) setStates(data.states);
        })
        .catch(console.error);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (selectedState) {
      fetch(`/api/geo/cities?stateName=${encodeURIComponent(selectedState)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.cities) setCities(data.cities);
        })
        .catch(console.error);
    }
  }, [selectedState]);

  if (!isModalOpen) return null;

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setLocation({
      state: selectedState,
      city: cityName,
      pincode: pincodeInput,
    });
    setIsModalOpen(false);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setLocation({
        state: selectedState || 'Maharashtra',
        city: selectedCity || 'Mumbai',
        pincode: pincodeInput,
      });
      setIsModalOpen(false);
    }
  };

  const handleRegisterInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    setInterestSubmitting(true);
    try {
      const res = await fetch('/api/geo/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState || 'India',
          city: selectedCity,
          pincode: pincodeInput || undefined,
          email: interestEmail || undefined,
        }),
      });
      if (res.ok) {
        setInterestSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInterestSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-ivory rounded-2xl shadow-luxury-lg border border-terracotta/20 p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-terracotta/10">
            <div>
              <span className="text-xs uppercase tracking-luxury text-terracotta font-medium">India-Wide Coverage</span>
              <h3 className="text-2xl font-serif font-bold text-aubergine mt-1">Select Your Location</h3>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-aubergine/60 hover:text-aubergine rounded-full hover:bg-blush/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick GPS Location */}
          <div className="mt-5">
            <button
              onClick={() => detectDeviceLocation()}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-terracotta to-terracotta-600 text-ivory font-medium shadow-terracotta-glow hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting your device location...' : 'Use My Current Location'}</span>
            </button>
            {detectError && (
              <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {detectError}
              </p>
            )}
          </div>

          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-terracotta/15"></div>
            <span className="flex-shrink mx-4 text-xs font-serif italic text-aubergine/60">or choose manually across India</span>
            <div className="flex-grow border-t border-terracotta/15"></div>
          </div>

          {/* Manual Selection Form */}
          <div className="space-y-4">
            {/* 1. State Selector */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-aubergine/80 mb-1.5">
                Indian State / Union Territory
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-ivory-pure border border-terracotta/20 text-aubergine focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-sm"
              >
                <option value="">Select State or UT</option>
                {states.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.isUnionTerritory ? '(UT)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. City Selector */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-aubergine/80 mb-1.5">
                City / Town
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-terracotta/10 rounded-xl bg-ivory-warm">
                {cities.length > 0 ? (
                  cities.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCity(c.name)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        location.city === c.name
                          ? 'bg-aubergine text-ivory font-semibold shadow-sm'
                          : 'bg-ivory hover:bg-blush/60 text-aubergine border border-terracotta/10'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {location.city === c.name && <Check className="w-3 h-3 text-gold" />}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-4 text-center text-xs text-aubergine/60">
                    {selectedState ? 'No major hubs registered yet in this state.' : 'Please select a state first'}
                  </div>
                )}
              </div>
            </div>

            {/* 3. PIN Code Search */}
            <form onSubmit={handlePincodeSubmit} className="pt-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-aubergine/80 mb-1.5">
                PIN Code (6 Digits)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400050, 560038, 110001"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-aubergine focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-sm"
                />
                <button
                  type="submit"
                  disabled={pincodeInput.length !== 6}
                  className="px-5 py-2.5 rounded-xl bg-aubergine text-ivory text-sm font-medium hover:bg-aubergine-900 transition-colors disabled:opacity-50"
                >
                  Apply PIN
                </button>
              </div>
            </form>
          </div>

          {/* Area Not Serviceable Notice / Interest Registration */}
          <div className="mt-6 pt-5 border-t border-terracotta/10 bg-blush-light/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-aubergine">CIELVO is coming to your area soon</h4>
                <p className="text-xs text-aubergine/70 mt-1">
                  Don&apos;t see your neighborhood? We are onboarding verified luxury salons and certified at-home professionals nationwide.
                </p>

                {interestSubmitted ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <Check className="w-4 h-4" />
                    <span>Thank you! We will notify you as soon as services launch in your area.</span>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterInterest} className="mt-3 flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter email for launch updates"
                      value={interestEmail}
                      onChange={(e) => setInterestEmail(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-ivory border border-terracotta/20 text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                    />
                    <button
                      type="submit"
                      disabled={interestSubmitting || !interestEmail}
                      className="px-3 py-2 text-xs rounded-lg bg-terracotta text-ivory font-medium hover:bg-terracotta-600 transition-colors disabled:opacity-50"
                    >
                      {interestSubmitting ? 'Submitting...' : 'Notify Me'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
