'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Check, AlertCircle, Building, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminGeographyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add City State
  const [newCityName, setNewCityName] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [addingCity, setAddingCity] = useState(false);
  const [citySuccess, setCitySuccess] = useState<string | null>(null);

  // Add Locality State
  const [newLocalityName, setNewLocalityName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [addingLocality, setAddingLocality] = useState(false);
  const [localitySuccess, setLocalitySuccess] = useState<string | null>(null);

  const fetchGeoSummary = () => {
    fetch('/api/admin/geo')
      .then((res) => res.json())
      .then((data) => {
        if (data.states) {
          setGeoData(data);
          if (data.states.length > 0 && !selectedStateId) {
            setSelectedStateId(data.states[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/admin/geography');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetchGeoSummary();
    }
  }, [user, authLoading, router]);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !selectedStateId) return;

    setAddingCity(true);
    setCitySuccess(null);

    try {
      const res = await fetch('/api/admin/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CITY',
          name: newCityName.trim(),
          stateId: selectedStateId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCitySuccess(`City "${newCityName}" added successfully.`);
        setNewCityName('');
        fetchGeoSummary();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingCity(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading geographic database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Territory Management</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">
            India Geographic Database
          </h1>
        </div>

        <Link href="/admin/dashboard" className="text-xs font-semibold text-terracotta hover:underline">
          ← Return to Dashboard
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-aubergine/60">States & UTs</span>
          <p className="text-2xl font-serif font-bold text-aubergine">{geoData?.summary?.totalStates || 36}</p>
        </div>
        <div className="p-5 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-aubergine/60">Active Hub Cities</span>
          <p className="text-2xl font-serif font-bold text-aubergine">{geoData?.summary?.totalCities || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-aubergine/60">Registered Localities</span>
          <p className="text-2xl font-serif font-bold text-aubergine">{geoData?.summary?.totalLocalities || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-1">
          <span className="text-[10px] uppercase font-bold text-aubergine/60">PIN Codes</span>
          <p className="text-2xl font-serif font-bold text-aubergine">{geoData?.summary?.totalPostalCodes || 0}</p>
        </div>
      </div>

      {/* Dynamic City Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form: Add New City */}
        <div className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-xl text-aubergine flex items-center gap-2">
            <Plus className="w-5 h-5 text-terracotta" />
            <span>Add New Indian City</span>
          </h3>
          <p className="text-xs text-aubergine/70">
            Expand the platform by onboarding new cities and towns to any state or union territory.
          </p>

          {citySuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{citySuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddCity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                Select Indian State / UT *
              </label>
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              >
                {geoData?.states?.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code}) {st.isUnionTerritory ? '• UT' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                City / Town Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Udaipur, Kochi, Indore, Chandigarh"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <button
              type="submit"
              disabled={addingCity || !newCityName.trim()}
              className="px-6 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {addingCity ? 'Adding City...' : 'Register City'}
            </button>
          </form>
        </div>

        {/* States & UTs Directory Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-xl text-aubergine flex items-center gap-2">
            <Layers className="w-5 h-5 text-terracotta" />
            <span>State / UT Coverage Roster</span>
          </h3>
          <p className="text-xs text-aubergine/70">
            All 36 Indian states and Union Territories are actively supported.
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {geoData?.states?.map((st: any) => (
              <div
                key={st.id}
                className="p-2.5 rounded-xl bg-ivory-warm border border-terracotta/10 text-xs flex items-center justify-between"
              >
                <span className="font-medium text-aubergine truncate">{st.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blush text-aubergine font-bold">
                  {st.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
