'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Search,
  Filter,
  Home,
  Clock,
  ArrowUpDown,
  Sparkles,
  Heart,
  AlertCircle,
  Check,
  Map as MapIcon,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { location, setIsModalOpen } = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [filterAtHome, setFilterAtHome] = useState(searchParams.get('atHome') === 'true');
  const [filterInSalon, setFilterInSalon] = useState(searchParams.get('inSalon') === 'true');
  const [sortBy, setSortBy] = useState('recommended');
  const [categories, setCategories] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<Record<string, boolean>>({});

  // Area interest form state
  const [interestEmail, setInterestEmail] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestSubmitting, setInterestSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/salons')
      .then((res) => res.json())
      .catch(console.error);
  }, []);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (filterAtHome) params.set('atHome', 'true');
      if (filterInSalon) params.set('inSalon', 'true');
      if (sortBy) params.set('sortBy', sortBy);

      // Location filters
      if (location.state && location.state !== 'All India') params.set('state', location.state);
      if (location.city && location.city !== 'All Cities') params.set('city', location.city);
      if (location.latitude && location.longitude) {
        params.set('lat', location.latitude.toString());
        params.set('lng', location.longitude.toString());
      }

      const res = await fetch(`/api/salons?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSalons(data.salons || []);
      }
    } catch (e) {
      console.error('Error fetching salons:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, filterAtHome, filterInSalon, sortBy, location]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const toggleFavourite = (salonId: string) => {
    setFavourites((prev) => ({
      ...prev,
      [salonId]: !prev[salonId],
    }));
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestEmail) return;
    setInterestSubmitting(true);
    try {
      const res = await fetch('/api/geo/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: location.state || 'India',
          city: location.city || 'Your Area',
          pincode: location.pincode || undefined,
          email: interestEmail,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header with Active Location Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">India-Wide Directory</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">
            Explore Luxury Salons
          </h1>
          <div className="flex items-center gap-2 text-xs text-aubergine/70 mt-1">
            <span>Showing verified salons in</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 font-bold text-terracotta hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{location.city || 'All India'}, {location.state}</span>
              {location.pincode && <span>({location.pincode})</span>}
            </button>
          </div>
        </div>

        {/* Change Location Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-4 py-2 rounded-full border border-terracotta/30 bg-blush/40 hover:bg-blush text-aubergine text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
        >
          <MapPin className="w-4 h-4 text-terracotta" />
          <span>Change Location</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-ivory-warm p-4 sm:p-5 rounded-2xl border border-terracotta/15 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-aubergine/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by salon name, service, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs sm:text-sm text-aubergine placeholder:text-aubergine/40 focus:outline-none focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs sm:text-sm text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price_low">Sort: Price: Low to High</option>
              <option value="price_high">Sort: Price: High to Low</option>
              <option value="nearest">Sort: Nearest to Me</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              onClick={() => setFilterAtHome(!filterAtHome)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 border ${
                filterAtHome
                  ? 'bg-terracotta text-ivory border-terracotta'
                  : 'bg-ivory text-aubergine border-terracotta/20 hover:bg-blush/40'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>At-Home</span>
            </button>

            <button
              onClick={() => setFilterInSalon(!filterInSalon)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 border ${
                filterInSalon
                  ? 'bg-aubergine text-ivory border-aubergine'
                  : 'bg-ivory text-aubergine border-terracotta/20 hover:bg-blush/40'
              }`}
            >
              <span>In-Salon</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-aubergine/60 font-medium flex-shrink-0 mr-1">Categories:</span>
          {['all', 'hair-care-styling', 'skin-facial-therapies', 'nails-couture-mani-pedi', 'bridal-pre-bridal-couture', 'spa-massage-wellness', 'makeup-red-carpet', 'mens-grooming'].map((cat) => {
            const labelMap: Record<string, string> = {
              all: 'All Categories',
              'hair-care-styling': 'Hair Care',
              'skin-facial-therapies': 'Facials & Skin',
              'nails-couture-mani-pedi': 'Nails & Mani-Pedi',
              'bridal-pre-bridal-couture': 'Bridal Glam',
              'spa-massage-wellness': 'Spa & Wellness',
              'makeup-red-carpet': 'Makeup',
              'mens-grooming': "Men's Grooming",
            };

            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-aubergine text-ivory font-bold shadow-sm'
                    : 'bg-ivory text-aubergine/80 hover:bg-blush/50 border border-terracotta/15'
                }`}
              >
                {labelMap[cat] || cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Salon Listing Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-blush/30 animate-pulse border border-terracotta/10" />
          ))}
        </div>
      ) : salons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => {
            const isFav = !!favourites[salon.id];
            const primaryBranch = salon.primaryBranch || salon.locations[0];

            return (
              <div
                key={salon.id}
                className="group flex flex-col bg-ivory-pure rounded-2xl overflow-hidden border border-terracotta/15 hover:border-terracotta/40 transition-all shadow-sm hover:shadow-luxury-lg"
              >
                {/* Photo & Overlay Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-blush-dark">
                  <Image
                    src={salon.coverImageUrl || '/images/brand/cielvo-logo-full-blush.jpg'}
                    alt={salon.businessName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aubergine/80 via-transparent to-transparent" />

                  {/* Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ivory/95 backdrop-blur-sm text-aubergine font-bold text-xs shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>{salon.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-aubergine/60 font-normal">({salon.reviewCount})</span>
                  </div>

                  {/* Favourite Button */}
                  <button
                    onClick={() => toggleFavourite(salon.id)}
                    className="absolute top-3 left-3 p-2 rounded-full bg-ivory/90 hover:bg-ivory text-aubergine transition-colors shadow-sm"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-aubergine/60'}`} />
                  </button>

                  {/* Distance pill if available */}
                  {salon.distanceKm !== null && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-aubergine/80 backdrop-blur-sm text-ivory text-[10px] font-semibold">
                      {salon.distanceKm} km away
                    </div>
                  )}

                  {/* Capability Badges */}
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    {salon.allowAtHome && (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta text-ivory text-[9px] font-semibold tracking-wider uppercase">
                        At-Home
                      </span>
                    )}
                    {salon.allowInSalon && (
                      <span className="px-2 py-0.5 rounded-full bg-aubergine text-ivory text-[9px] font-semibold tracking-wider uppercase">
                        In-Salon
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-xl text-aubergine group-hover:text-terracotta transition-colors line-clamp-1">
                      {salon.businessName}
                    </h3>

                    {primaryBranch && (
                      <p className="flex items-center gap-1.5 text-xs text-aubergine/70 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                        <span>
                          {primaryBranch.locality}, {primaryBranch.city}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-aubergine/75 line-clamp-2 leading-relaxed">
                      {salon.description}
                    </p>

                    {/* Category Tags */}
                    {salon.categories && salon.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {salon.categories.slice(0, 3).map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-blush-light text-aubergine font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-terracotta/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-aubergine/60 block">Treatments from</span>
                      <span className="text-base font-bold text-aubergine">₹{salon.startingPrice}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/salons/${salon.slug}`}
                        className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. No Results: CIELVO IS COMING TO YOUR AREA SOON */
        <div className="p-8 sm:p-12 rounded-3xl bg-blush-light border border-terracotta/20 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mx-auto text-terracotta">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-aubergine">
              CIELVO is coming to your area soon.
            </h2>
            <p className="text-sm text-aubergine/70 max-w-md mx-auto leading-relaxed">
              We currently do not have approved partner salons in{' '}
              <strong className="text-aubergine">{location.city || 'this location'}</strong>. We are rapidly expanding our verified salon and doorstep beauty network across India.
            </p>
          </div>

          {interestSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Thank you! We have registered your location and will email you the moment bookings open.</span>
            </div>
          ) : (
            <form onSubmit={handleInterestSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter email to get notified when we launch"
                value={interestEmail}
                onChange={(e) => setInterestEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
              <button
                type="submit"
                disabled={interestSubmitting}
                className="px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold transition-colors disabled:opacity-50"
              >
                {interestSubmitting ? 'Registering...' : 'Notify Me'}
              </button>
            </form>
          )}

          <div className="pt-4 flex flex-wrap gap-3 justify-center text-xs">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterAtHome(false);
                setFilterInSalon(false);
              }}
              className="px-4 py-2 rounded-full bg-aubergine text-ivory font-medium hover:bg-aubergine-900 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full border border-terracotta/30 text-aubergine font-medium hover:bg-blush transition-colors"
            >
              Search Other Indian Cities
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-aubergine/70">Loading explore atelier...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
