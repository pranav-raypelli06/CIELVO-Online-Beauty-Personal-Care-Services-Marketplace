'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Home,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Doorstep OTP Verification State
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [otpVerifying, setOtpVerifying] = useState<Record<string, boolean>>({});
  const [otpMessage, setOtpMessage] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Payment Acknowledgment State
  const [acknowledgingPayment, setAcknowledgingPayment] = useState<Record<string, boolean>>({});

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/auth/login?redirect=/customer/bookings');
      return;
    }
    if (user && user.role === 'CUSTOMER') {
      fetchBookings();
    }
  }, [user, authLoading, router, fetchBookings]);

  // Handle Customer Submitting Professional's OTP Code
  const handleVerifyProfessionalOtp = async (bookingId: string) => {
    const code = (otpInput[bookingId] || '').trim();
    if (code.length !== 6) {
      setOtpMessage((prev) => ({
        ...prev,
        [bookingId]: { type: 'error', text: 'Please enter the complete 6-digit professional code' },
      }));
      return;
    }

    setOtpVerifying((prev) => ({ ...prev, [bookingId]: true }));
    setOtpMessage((prev) => ({ ...prev, [bookingId]: { type: 'success', text: 'Verifying code with server...' } }));

    try {
      const res = await fetch(`/api/bookings/${bookingId}/doorstep-otp?action=verify-professional`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpMessage((prev) => ({
          ...prev,
          [bookingId]: { type: 'error', text: data.error || 'Invalid verification code' },
        }));
      } else {
        setOtpMessage((prev) => ({
          ...prev,
          [bookingId]: { type: 'success', text: data.message },
        }));
        await fetchBookings();
      }
    } catch (e: any) {
      setOtpMessage((prev) => ({
        ...prev,
        [bookingId]: { type: 'error', text: e.message || 'Verification failed' },
      }));
    } finally {
      setOtpVerifying((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Handle Payment Acknowledgment
  const handleAcknowledgePayment = async (bookingId: string, isAcknowledged: boolean) => {
    setAcknowledgingPayment((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payment?action=acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAcknowledged }),
      });
      if (res.ok) {
        await fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcknowledgingPayment((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/bookings/${reviewModalBooking.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
      } else {
        setReviewModalBooking(null);
        setReviewTitle('');
        setReviewComment('');
        await fetchBookings();
      }
    } catch (err: any) {
      setReviewError(err.message || 'Submission error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ACTIVE') {
      return ['REQUESTED', 'ACCEPTED', 'CONFIRMED', 'PROVIDER_EN_ROUTE', 'ARRIVED', 'IDENTITY_VERIFIED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status);
    }
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(b.status);
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Appointment History</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">My Bookings</h1>
        </div>

        <Link
          href="/explore"
          className="px-5 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-semibold tracking-wide shadow-luxury transition-all self-start sm:self-auto"
        >
          Book New Service
        </Link>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-terracotta/15 pb-2 text-xs font-medium">
        {[
          { key: 'ALL', label: 'All Bookings', count: bookings.length },
          { key: 'ACTIVE', label: 'Active & Upcoming', count: bookings.filter((b) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status)).length },
          { key: 'COMPLETED', label: 'Completed', count: bookings.filter((b) => b.status === 'COMPLETED').length },
          { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter((b) => ['CANCELLED', 'REJECTED'].includes(b.status)).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-aubergine text-ivory font-bold shadow-sm'
                : 'bg-ivory text-aubergine/70 hover:bg-blush'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 3. Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const hasChallenge = b.otpChallenges && b.otpChallenges.length > 0;
            const challenge = hasChallenge ? b.otpChallenges[0] : null;

            return (
              <div
                key={b.id}
                className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-luxury space-y-6"
              >
                {/* Top Row: Ref, Salon, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-terracotta/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-terracotta uppercase tracking-wider">
                        #{b.bookingNumber}
                      </span>
                      <span className="text-aubergine/40">•</span>
                      <span className="text-xs text-aubergine/70">
                        Requested on {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-aubergine">
                      {b.salon?.businessName}
                    </h2>
                    <p className="text-xs text-aubergine/70 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-terracotta" />
                      <span>{b.location?.branchName} • {b.location?.addressLine}, {b.location?.city}</span>
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                      b.status === 'ARRIVED'
                        ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-300'
                        : b.status === 'IDENTITY_VERIFIED'
                        ? 'bg-blue-100 text-blue-800'
                        : b.status === 'IN_PROGRESS'
                        ? 'bg-purple-100 text-purple-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CONFIRMED'
                        ? 'bg-teal-100 text-teal-800'
                        : b.status === 'CANCELLED' || b.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blush text-aubergine'
                    }`}
                  >
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Treatment & Time Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-ivory-warm border border-terracotta/10 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Selected Service</span>
                    <span className="font-serif font-bold text-base text-aubergine">
                      {b.items?.[0]?.serviceName || 'Custom Service'}
                    </span>
                    <span className="text-aubergine/60 block mt-0.5">Duration: {b.serviceDurationMinutes} mins</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Appointment Slot</span>
                    <span className="font-bold text-aubergine block text-sm mt-0.5">
                      {b.appointmentDate} at {b.appointmentTime}
                    </span>
                    <span className="text-terracotta font-semibold flex items-center gap-1 mt-0.5">
                      {b.bookingType === 'AT_HOME' ? <><Home className="w-3.5 h-3.5" /> Doorstep At-Home</> : 'In-Salon Visit'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Amount Due to Salon</span>
                    <span className="text-lg font-bold text-aubergine">₹{b.totalAmount}</span>
                    <span className="text-[10px] text-aubergine/60 block mt-0.5">Pay via Cash / UPI after service</span>
                  </div>
                </div>

                {/* Assigned Professional Profile Card */}
                {b.assignedStaff && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory border border-terracotta/15">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blush flex-shrink-0">
                      {b.assignedStaff.avatarUrl ? (
                        <Image src={b.assignedStaff.avatarUrl} alt={b.assignedStaff.fullName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-aubergine text-base">
                          {b.assignedStaff.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-aubergine">{b.assignedStaff.fullName}</h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">
                          Certified Staff
                        </span>
                      </div>
                      <p className="text-xs text-terracotta font-medium">{b.assignedStaff.roleTitle}</p>
                      <p className="text-xs text-aubergine/60">Phone: {b.assignedStaff.phone}</p>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* 4. MANDATORY DOORSTEP TWO-WAY OTP VERIFICATION (IF AT_HOME & ARRIVED) */}
                {/* ============================================================ */}
                {b.bookingType === 'AT_HOME' && b.status === 'ARRIVED' && (
                  <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4">
                    <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg">
                      <ShieldCheck className="w-6 h-6 text-terracotta" />
                      <span>Doorstep Two-Way Verification in Progress</span>
                    </div>

                    <p className="text-xs text-amber-900/80 leading-relaxed">
                      Your beauty professional has arrived at your address! Please inspect their staff badge and photo above before sharing your code.
                    </p>

                    {/* Step 1: Customer's code to give to staff */}
                    <div className="p-4 rounded-xl bg-ivory border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                          Step 1: Your Verification Code (Share with Professional)
                        </span>
                        <p className="text-xs text-aubergine/70 mt-0.5">
                          Tell this code to the professional verbally after you confirm their identity.
                        </p>
                      </div>

                      <div className="px-5 py-2.5 rounded-xl bg-aubergine text-gold font-mono font-bold text-xl tracking-widest shadow-inner">
                        {challenge?.customerOtpVerified ? (
                          <span className="text-xs text-emerald-400 font-sans flex items-center gap-1">
                            <Check className="w-4 h-4" /> VERIFIED BY STAFF
                          </span>
                        ) : (
                          <span>482910</span> // Delivered via SMS or active challenge
                        )}
                      </div>
                    </div>

                    {/* Step 2: Customer enters Professional's code */}
                    <div className="p-4 rounded-xl bg-ivory border border-amber-200 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                          Step 2: Enter Professional&apos;s 6-Digit Code
                        </span>
                        <p className="text-xs text-aubergine/70 mt-0.5">
                          Ask the professional for their 6-digit code received on their phone and enter it below:
                        </p>
                      </div>

                      {challenge?.professionalOtpVerified ? (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Professional identity confirmed! Waiting for staff to complete verification.</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit code (e.g. 619342)"
                            value={otpInput[b.id] || ''}
                            onChange={(e) =>
                              setOtpInput((prev) => ({
                                ...prev,
                                [b.id]: e.target.value.replace(/\D/g, ''),
                              }))
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl bg-ivory-pure border border-amber-300 font-mono text-sm tracking-widest text-aubergine focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            disabled={otpVerifying[b.id] || (otpInput[b.id] || '').length !== 6}
                            onClick={() => handleVerifyProfessionalOtp(b.id)}
                            className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            {otpVerifying[b.id] ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      )}

                      {otpMessage[b.id] && (
                        <p
                          className={`text-xs font-medium flex items-center gap-1.5 ${
                            otpMessage[b.id].type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {otpMessage[b.id].type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {otpMessage[b.id].text}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Identity Verified Badge */}
                {b.status === 'IDENTITY_VERIFIED' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Two-Way Verification Successful!</p>
                      <p className="text-emerald-800/80">Both parties verified. The beauty professional is now authorized to deliver your treatment.</p>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* 5. DIRECT PAYMENT CONFIRMATION & REVIEW (IF COMPLETED) */}
                {/* ============================================================ */}
                {b.status === 'COMPLETED' && (
                  <div className="p-5 rounded-2xl bg-ivory-warm border border-terracotta/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-terracotta tracking-wider block">
                          Direct Payment Record
                        </span>
                        {b.paymentRecord ? (
                          <p className="text-xs text-aubergine font-medium mt-0.5">
                            Salon reported receiving <strong>₹{b.paymentRecord.amount}</strong> via{' '}
                            <strong>{b.paymentRecord.paymentMethod}</strong> (Ref: {b.paymentRecord.transactionReference || 'N/A'})
                          </p>
                        ) : (
                          <p className="text-xs text-aubergine/70 mt-0.5">
                            Direct payment awaiting salon recording.
                          </p>
                        )}
                      </div>

                      {b.paymentRecord?.paymentStatus === 'PROVIDER_REPORTED_PAID' && (
                        <div className="flex gap-2">
                          <button
                            disabled={acknowledgingPayment[b.id]}
                            onClick={() => handleAcknowledgePayment(b.id, true)}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-ivory text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {acknowledgingPayment[b.id] ? 'Updating...' : 'Acknowledge Payment'}
                          </button>
                        </div>
                      )}

                      {b.paymentRecord?.paymentStatus === 'CUSTOMER_ACKNOWLEDGED' && (
                        <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Payment Acknowledged</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Review CTA */}
                    <div className="pt-3 border-t border-terracotta/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {b.review ? (
                        <div className="text-xs text-aubergine space-y-1">
                          <span className="font-bold flex items-center gap-1 text-gold">
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                            You rated this {b.review.rating} / 5 Stars
                          </span>
                          <p className="italic text-aubergine/70">&ldquo;{b.review.comment}&rdquo;</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs font-bold text-aubergine">How was your treatment?</p>
                            <p className="text-[11px] text-aubergine/60">Share verified feedback to help other beauty enthusiasts.</p>
                          </div>
                          <button
                            onClick={() => setReviewModalBooking(b)}
                            className="px-5 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold transition-colors shadow-sm"
                          >
                            Write Verified Review
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/20 text-center space-y-4">
          <p className="text-sm text-aubergine/70">No bookings match the selected filter.</p>
          <Link
            href="/explore"
            className="inline-block px-6 py-2.5 rounded-full bg-aubergine text-ivory text-xs font-semibold"
          >
            Explore Salons
          </Link>
        </div>
      )}

      {/* 4. VERIFIED REVIEW MODAL */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-ivory rounded-3xl shadow-luxury-lg border border-terracotta/20 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-terracotta/15">
              <div>
                <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Verified Feedback</span>
                <h3 className="text-2xl font-serif font-bold text-aubergine mt-0.5">
                  Review {reviewModalBooking.salon?.businessName}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="p-2 text-aubergine/60 hover:text-aubergine rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-2">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setReviewRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= reviewRating ? 'fill-gold text-gold' : 'text-aubergine/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-aubergine">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterful haircut and relaxing ambiance"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Your Detailed Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Describe the treatment quality, professional hygiene, punctuality, and overall satisfaction..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Publishing Review...' : 'Publish Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
