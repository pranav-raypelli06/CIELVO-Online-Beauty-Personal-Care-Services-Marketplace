'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Home,
  CheckCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  ArrowLeft,
  X,
  Navigation,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

export default function SalonProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { location: userLocation } = useLocation();

  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'IN_SALON' | 'AT_HOME'>('IN_SALON');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('11:00');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // At-Home Delivery Address Fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locality, setLocality] = useState(userLocation.locality || '');
  const [city, setCity] = useState(userLocation.city || '');
  const [state, setState] = useState(userLocation.state || '');
  const [postalCode, setPostalCode] = useState(userLocation.pincode || '');

  // Booking submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => fetch(`/api/salons/${p.slug}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.salon) {
          setSalon(data.salon);
          if (data.salon.locations && data.salon.locations.length > 0) {
            setSelectedBranchId(data.salon.locations[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-aubergine/70">Loading salon atelier...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-aubergine">Salon Not Found</h2>
        <p className="text-sm text-aubergine/70">The requested salon listing may have been moved or updated.</p>
        <Link
          href="/explore"
          className="inline-block px-6 py-2.5 rounded-full bg-aubergine text-ivory text-xs font-semibold"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const activeBranch =
    salon.locations.find((l: any) => l.id === selectedBranchId) || salon.locations[0];

  const handleOpenBooking = (srv: any) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/salons/${salon?.slug || ''}`);
      return;
    }
    setSelectedService(srv);
    setBookingType(srv.allowInSalon ? 'IN_SALON' : 'AT_HOME');
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !activeBranch) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const payload: any = {
        salonId: salon.id,
        locationId: activeBranch.id,
        salonServiceId: selectedService.salonServiceId,
        bookingType,
        appointmentDate,
        appointmentTime,
        customerNotes,
      };

      if (bookingType === 'AT_HOME') {
        payload.addressLine1 = addressLine1;
        payload.addressLine2 = addressLine2;
        payload.landmark = landmark;
        payload.locality = locality;
        payload.city = city || activeBranch.city;
        payload.state = state || activeBranch.state;
        payload.postalCode = postalCode;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || 'Failed to place booking request');
      } else {
        setBookingSuccess(data.booking);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="pb-20 space-y-10">
      {/* 1. HERO COVER BANNER */}
      <div className="relative h-72 sm:h-96 w-full bg-aubergine-950 overflow-hidden">
        <Image
          src={salon.coverImageUrl || '/images/brand/cielvo-logo-full-blush.jpg'}
          alt={salon.businessName}
          fill
          priority
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aubergine via-aubergine/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-ivory/90 hover:bg-ivory text-aubergine text-xs font-semibold backdrop-blur-md shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </Link>
        </div>

        {/* Floating Salon Header */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-ivory">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-terracotta text-ivory text-[10px] font-bold uppercase tracking-wider">
                Approved Partner
              </span>
              {salon.allowAtHome && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-ivory text-[10px] font-semibold flex items-center gap-1">
                  <Home className="w-3 h-3 text-gold" />
                  At-Home Available
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ivory leading-tight">
              {salon.businessName}
            </h1>

            <div className="flex items-center gap-4 text-xs text-blush/90">
              <div className="flex items-center gap-1 font-bold">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="text-sm">{salon.rating.toFixed(1)}</span>
                <span className="font-normal">({salon.reviewCount} verified reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>
                  {activeBranch.locality}, {activeBranch.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Services, Staff, Reviews (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Multi-Branch Selector Tabs */}
            {salon.locations.length > 1 && (
              <div className="p-4 rounded-2xl bg-ivory-warm border border-terracotta/20 space-y-2">
                <span className="text-xs uppercase tracking-wider text-terracotta font-semibold block">
                  Select Branch Location:
                </span>
                <div className="flex flex-wrap gap-2">
                  {salon.locations.map((loc: any) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedBranchId(loc.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        selectedBranchId === loc.id
                          ? 'bg-aubergine text-ivory shadow-sm'
                          : 'bg-ivory text-aubergine border border-terracotta/20 hover:bg-blush'
                      }`}
                    >
                      {loc.branchName} ({loc.city})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* About Salon */}
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-aubergine">About the Atelier</h2>
              <p className="text-sm text-aubergine/80 leading-relaxed font-sans">{salon.description}</p>
            </div>

            {/* Services Catalogue */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Treatments & Menus</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-aubergine mt-0.5">
                    Service Catalogue
                  </h2>
                </div>
              </div>

              {/* Service Categories Accordion / Lists */}
              {Object.keys(salon.servicesByCategory).length > 0 ? (
                Object.entries(salon.servicesByCategory).map(([catName, srvList]: [string, any]) => (
                  <div key={catName} className="space-y-4">
                    <h3 className="font-serif font-bold text-lg text-aubergine border-b border-terracotta/15 pb-2 flex items-center justify-between">
                      <span>{catName}</span>
                      <span className="text-xs font-sans font-normal text-aubergine/60">
                        {srvList.length} services
                      </span>
                    </h3>

                    <div className="space-y-3">
                      {srvList.map((srv: any) => (
                        <div
                          key={srv.salonServiceId}
                          className="p-5 rounded-2xl bg-ivory-pure border border-terracotta/15 hover:border-terracotta/35 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-lg text-aubergine">{srv.name}</h4>
                              {srv.genderTarget && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blush text-aubergine font-semibold uppercase">
                                  {srv.genderTarget}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-aubergine/70 leading-relaxed max-w-xl">
                              {srv.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-aubergine/60 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-terracotta" />
                                {srv.durationMinutes} mins
                              </span>
                              <span>•</span>
                              <div className="flex items-center gap-1.5">
                                {srv.allowInSalon && (
                                  <span className="text-[10px] text-aubergine font-medium">In-Salon</span>
                                )}
                                {srv.allowInSalon && srv.allowAtHome && <span>/</span>}
                                {srv.allowAtHome && (
                                  <span className="text-[10px] text-terracotta font-bold flex items-center gap-0.5">
                                    <Home className="w-3 h-3" /> At-Home
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-terracotta/10">
                            <div className="text-left sm:text-right">
                              <span className="text-lg font-bold text-aubergine">₹{srv.price}</span>
                            </div>

                            <button
                              onClick={() => handleOpenBooking(srv)}
                              className="px-5 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide transition-colors shadow-sm"
                            >
                              Book Appointment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-ivory-warm text-center text-xs text-aubergine/70">
                  No active services currently listed for this branch.
                </div>
              )}
            </div>

            {/* Verified Salon Staff */}
            {activeBranch.staff && activeBranch.staff.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-terracotta/15">
                <div>
                  <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Our Certified Team</span>
                  <h2 className="text-2xl font-serif font-bold text-aubergine mt-0.5">
                    Professionals at this Branch
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeBranch.staff.map((st: any) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl bg-ivory-pure border border-terracotta/15 flex items-start gap-4"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blush flex-shrink-0">
                        {st.avatarUrl ? (
                          <Image src={st.avatarUrl} alt={st.fullName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-aubergine text-lg">
                            {st.fullName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-aubergine">{st.fullName}</h4>
                          {st.atHomeEnabled && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">
                              Doorstep Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-terracotta font-medium">{st.roleTitle}</p>
                        {st.bio && <p className="text-xs text-aubergine/70 line-clamp-2">{st.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Reviews Section */}
            <div className="space-y-4 pt-6 border-t border-terracotta/15">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Testimonials</span>
                  <h2 className="text-2xl font-serif font-bold text-aubergine mt-0.5">
                    Verified Customer Reviews
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-aubergine font-bold">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span>{salon.rating.toFixed(1)}</span>
                  <span className="text-xs text-aubergine/60 font-normal">({salon.reviewCount})</span>
                </div>
              </div>

              {salon.reviews && salon.reviews.length > 0 ? (
                <div className="space-y-4">
                  {salon.reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-ivory-pure border border-terracotta/15 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blush flex items-center justify-center font-bold text-xs text-aubergine">
                            {r.customer?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-aubergine">{r.customer?.fullName}</p>
                            <span className="text-[10px] text-aubergine/50">Verified Appointment</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < r.rating ? 'fill-gold text-gold' : 'text-aubergine/20'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.title && <h5 className="font-serif font-bold text-sm text-aubergine">{r.title}</h5>}
                      <p className="text-xs text-aubergine/80 italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>

                      {r.response && (
                        <div className="p-3 rounded-xl bg-blush-light border border-terracotta/15 text-xs text-aubergine space-y-1">
                          <p className="font-bold text-terracotta">Salon Response:</p>
                          <p className="text-aubergine/80">{r.response.responseText}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-ivory-warm text-center text-xs text-aubergine/70">
                  No customer reviews yet. Be the first to experience this salon!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Branch Details, Hours & Direct Payment Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Branch Address Card */}
              <div className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-luxury space-y-4">
                <h3 className="font-serif font-bold text-xl text-aubergine">Branch Location</h3>

                <div className="space-y-3 text-xs text-aubergine/80">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-aubergine">{activeBranch.branchName}</p>
                      <p className="mt-0.5">{activeBranch.addressLine}</p>
                      <p>
                        {activeBranch.locality}, {activeBranch.city}, {activeBranch.state} - {activeBranch.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-terracotta flex-shrink-0" />
                    <span>{activeBranch.phone}</span>
                  </div>

                  {activeBranch.latitude && activeBranch.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeBranch.latitude},${activeBranch.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blush hover:bg-blush-dark text-aubergine font-semibold transition-colors mt-2"
                    >
                      <Navigation className="w-3.5 h-3.5 text-terracotta" />
                      <span>Get Directions on Google Maps</span>
                    </a>
                  )}
                </div>

                {/* Business Hours Table */}
                <div className="pt-4 border-t border-terracotta/15 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-aubergine flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    Business Hours
                  </h4>
                  <div className="space-y-1 text-xs">
                    {activeBranch.hours && activeBranch.hours.length > 0 ? (
                      activeBranch.hours.map((h: any) => (
                        <div key={h.id} className="flex justify-between py-0.5 text-aubergine/70">
                          <span>{dayNames[h.dayOfWeek]}</span>
                          <span className="font-medium text-aubergine">
                            {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-aubergine/60">Mon - Sun: 09:00 - 21:00</p>
                    )}
                  </div>
                </div>

                {/* Direct Payment Guarantee */}
                <div className="pt-4 border-t border-terracotta/15 space-y-2 bg-blush-light/60 -mx-6 -mb-6 p-6 rounded-b-2xl">
                  <div className="flex items-center gap-2 text-aubergine font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-terracotta" />
                    <span>Direct Payment Only</span>
                  </div>
                  <p className="text-[11px] text-aubergine/70 leading-relaxed">
                    CIELVO does not collect customer advance payments. Pay the salon or its assigned professional directly via UPI or Cash after service completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPLETE BOOKING MODAL */}
      {isBookingModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-ivory rounded-2xl shadow-luxury-lg border border-terracotta/20 p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-terracotta/15">
              <div>
                <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Appointment Request</span>
                <h3 className="text-2xl font-serif font-bold text-aubergine mt-0.5">Book Service</h3>
              </div>
              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingSuccess(null);
                  setBookingError(null);
                }}
                className="p-2 text-aubergine/60 hover:text-aubergine rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-serif font-bold text-aubergine">Request Submitted!</h4>
                  <p className="text-xs text-aubergine/70">
                    Booking Reference: <strong className="text-aubergine font-mono">{bookingSuccess.bookingNumber}</strong>
                  </p>
                  <p className="text-xs text-aubergine/80 max-w-md mx-auto leading-relaxed">
                    The salon manager has received your appointment request. You will be notified the moment your booking is confirmed and staff is assigned.
                  </p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <Link
                    href="/customer/bookings"
                    className="px-6 py-2.5 rounded-full bg-aubergine text-ivory text-xs font-semibold"
                  >
                    View My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      setBookingSuccess(null);
                    }}
                    className="px-6 py-2.5 rounded-full border border-terracotta/30 text-aubergine text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="mt-5 space-y-5">
                {/* Selected Service Card */}
                <div className="p-4 rounded-xl bg-blush-light border border-terracotta/15 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-aubergine">{selectedService.name}</h4>
                    <p className="text-xs text-aubergine/70">
                      Duration: {selectedService.durationMinutes} mins • {activeBranch.branchName}
                    </p>
                  </div>
                  <span className="text-base font-bold text-aubergine">₹{selectedService.price}</span>
                </div>

                {/* In-Salon vs At-Home Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-2">
                    Service Delivery Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!selectedService.allowInSalon}
                      onClick={() => setBookingType('IN_SALON')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bookingType === 'IN_SALON'
                          ? 'border-aubergine bg-aubergine text-ivory shadow-sm'
                          : 'border-terracotta/20 bg-ivory text-aubergine hover:bg-blush'
                      } ${!selectedService.allowInSalon ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <p className="font-bold text-xs">In-Salon Visit</p>
                      <p className={`text-[10px] mt-0.5 ${bookingType === 'IN_SALON' ? 'text-ivory/80' : 'text-aubergine/60'}`}>
                        Visit {activeBranch.branchName}
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedService.allowAtHome || !activeBranch.allowAtHome}
                      onClick={() => setBookingType('AT_HOME')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bookingType === 'AT_HOME'
                          ? 'border-terracotta bg-terracotta text-ivory shadow-sm'
                          : 'border-terracotta/20 bg-ivory text-aubergine hover:bg-blush'
                      } ${!selectedService.allowAtHome || !activeBranch.allowAtHome ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <p className="font-bold text-xs flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" /> At-Home Service
                      </p>
                      <p className={`text-[10px] mt-0.5 ${bookingType === 'AT_HOME' ? 'text-ivory/80' : 'text-aubergine/60'}`}>
                        Two-Way Doorstep OTP
                      </p>
                    </button>
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1.5">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1.5">
                      Preferred Time Slot
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                    >
                      <option value="10:00">10:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:30">02:30 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:30">05:30 PM</option>
                      <option value="19:00">07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* AT_HOME Address Fields */}
                {bookingType === 'AT_HOME' && (
                  <div className="p-4 rounded-xl bg-ivory-warm border border-terracotta/15 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Doorstep Service Address</span>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="House / Flat No., Apartment Name, Street *"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Locality / Area *"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="City *"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="PIN Code (6 digits) *"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 rounded-lg bg-ivory border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions / Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                    Special Notes for Salon (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Allergies, sensitive skin, special requests..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                  />
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Direct Payment Note */}
                <p className="text-[11px] text-aubergine/70 text-center">
                  Payment is paid directly to the salon via Cash or UPI after service completion.
                </p>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Request...' : `Confirm Request • ₹${selectedService.price}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
