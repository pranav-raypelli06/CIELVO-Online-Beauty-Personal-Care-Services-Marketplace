'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle,
  Play,
  Check,
  AlertCircle,
  Phone,
  Home,
  CreditCard,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Doorstep OTP input state per booking
  const [customerOtpInput, setCustomerOtpInput] = useState<Record<string, string>>({});
  const [otpSubmitting, setOtpSubmitting] = useState<Record<string, boolean>>({});
  const [otpFeedback, setOtpFeedback] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  // Action loading states
  const [markingArrival, setMarkingArrival] = useState<Record<string, boolean>>({});
  const [startingService, setStartingService] = useState<Record<string, boolean>>({});
  const [completingService, setCompletingService] = useState<Record<string, boolean>>({});

  // Payment Recording Modal
  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'DIRECT_OTHER'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchAssignedAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'SALON_STAFF' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/staff/dashboard');
      return;
    }
    if (user) {
      fetchAssignedAppointments();
    }
  }, [user, authLoading, router, fetchAssignedAppointments]);

  // 1. Mark Arrival ("I've Arrived")
  const handleMarkArrival = async (bookingId: string) => {
    setMarkingArrival((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/doorstep-otp?action=generate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to mark arrival');
      } else {
        await fetchAssignedAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingArrival((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // 2. Staff Enters Customer's Code
  const handleVerifyCustomerOtp = async (bookingId: string) => {
    const code = (customerOtpInput[bookingId] || '').trim();
    if (code.length !== 6) {
      setOtpFeedback((prev) => ({
        ...prev,
        [bookingId]: { type: 'error', text: 'Enter the 6-digit code told by customer' },
      }));
      return;
    }

    setOtpSubmitting((prev) => ({ ...prev, [bookingId]: true }));
    setOtpFeedback((prev) => ({ ...prev, [bookingId]: { type: 'success', text: 'Validating customer code...' } }));

    try {
      const res = await fetch(`/api/bookings/${bookingId}/doorstep-otp?action=verify-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpFeedback((prev) => ({
          ...prev,
          [bookingId]: { type: 'error', text: data.error || 'Invalid customer code' },
        }));
      } else {
        setOtpFeedback((prev) => ({
          ...prev,
          [bookingId]: { type: 'success', text: data.message },
        }));
        await fetchAssignedAppointments();
      }
    } catch (e: any) {
      setOtpFeedback((prev) => ({
        ...prev,
        [bookingId]: { type: 'error', text: e.message || 'Validation failed' },
      }));
    } finally {
      setOtpSubmitting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // 3. Start Service (Blocked until IDENTITY_VERIFIED for at-home)
  const handleStartService = async (bookingId: string) => {
    setStartingService((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Cannot start service');
      } else {
        await fetchAssignedAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStartingService((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // 4. Complete Service
  const handleCompleteService = async (bookingId: string) => {
    setCompletingService((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        await fetchAssignedAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCompletingService((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // 5. Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBooking) return;

    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/bookings/${paymentModalBooking.id}/payment?action=record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          transactionReference: transactionRef || undefined,
        }),
      });

      if (res.ok) {
        setPaymentModalBooking(null);
        await fetchAssignedAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading professional roster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-luxury space-y-1">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Staff Appointment Desk</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-aubergine">
          Hello, {user?.name || 'Professional'}
        </h1>
        <p className="text-xs text-aubergine/70">
          Your scheduled treatments, customer addresses, and doorstep verification panel
        </p>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-aubergine">
          Assigned Appointments ({bookings.length})
        </h2>

        {bookings.length > 0 ? (
          bookings.map((b) => {
            const hasChallenge = b.otpChallenges && b.otpChallenges.length > 0;
            const challenge = hasChallenge ? b.otpChallenges[0] : null;

            return (
              <div
                key={b.id}
                className="p-6 sm:p-8 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-luxury space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-terracotta/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-terracotta uppercase">#{b.bookingNumber}</span>
                      <span className="text-aubergine/40">•</span>
                      <span className="text-xs text-aubergine font-bold">{b.appointmentDate} at {b.appointmentTime}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blush text-aubergine font-bold uppercase">
                        {b.bookingType}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-aubergine mt-1">
                      {b.items?.[0]?.serviceName}
                    </h3>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      b.status === 'ARRIVED'
                        ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-300'
                        : b.status === 'IDENTITY_VERIFIED'
                        ? 'bg-blue-100 text-blue-800'
                        : b.status === 'IN_PROGRESS'
                        ? 'bg-purple-100 text-purple-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blush text-aubergine'
                    }`}
                  >
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer Details & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-ivory-warm border border-terracotta/10 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-aubergine/60 block">Customer Information</span>
                    <p className="font-bold text-aubergine text-sm">{b.customer?.fullName}</p>
                    <p className="flex items-center gap-1.5 text-aubergine/70">
                      <Phone className="w-3.5 h-3.5 text-terracotta" />
                      <span>{b.customer?.user?.phone}</span>
                    </p>
                    {b.customerNotes && (
                      <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-lg mt-2">
                        <strong>Customer Note:</strong> {b.customerNotes}
                      </p>
                    )}
                  </div>

                  {b.bookingType === 'AT_HOME' && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-terracotta tracking-wider block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Doorstep Service Address
                      </span>
                      <p className="text-xs text-aubergine leading-relaxed">
                        {b.serviceAddressSnapshot || 'Address available after acceptance.'}
                      </p>
                      {b.navigationUrl && (
                        <a
                          href={b.navigationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-aubergine text-ivory text-xs font-semibold hover:bg-aubergine-900 transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-gold" />
                          <span>Navigate in Google Maps</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ============================================================ */}
                {/* DOORSTEP OTP ACTION CENTER (FOR AT_HOME BOOKINGS) */}
                {/* ============================================================ */}
                {b.bookingType === 'AT_HOME' && (
                  <div className="space-y-4 pt-2">
                    {/* Phase 1: Not Arrived Yet */}
                    {['ACCEPTED', 'CONFIRMED', 'PROVIDER_EN_ROUTE'].includes(b.status) && (
                      <div className="p-4 rounded-2xl bg-blush-light border border-terracotta/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-base text-aubergine">
                            Reached the customer&apos;s address?
                          </h4>
                          <p className="text-xs text-aubergine/70 mt-0.5">
                            Tap &ldquo;I&apos;ve Arrived&rdquo; to record arrival time and dispatch mutual doorstep verification codes.
                          </p>
                        </div>

                        <button
                          disabled={markingArrival[b.id]}
                          onClick={() => handleMarkArrival(b.id)}
                          className="w-full sm:w-auto px-6 py-3 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase tracking-wider shadow-terracotta-glow transition-all disabled:opacity-50"
                        >
                          {markingArrival[b.id] ? 'Recording Arrival...' : "I've Arrived at Doorstep"}
                        </button>
                      </div>
                    )}

                    {/* Phase 2: Arrived - OTP Challenge Active */}
                    {b.status === 'ARRIVED' && (
                      <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4">
                        <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg">
                          <ShieldCheck className="w-6 h-6 text-terracotta" />
                          <span>Doorstep OTP Verification</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Staff's Own Code */}
                          <div className="p-4 rounded-xl bg-ivory border border-amber-200 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                              Your Professional OTP Code
                            </span>
                            <p className="text-xs text-aubergine/70">
                              Tell this code to the customer verbally so they can confirm your identity:
                            </p>
                            <div className="px-4 py-2 rounded-xl bg-aubergine text-gold font-mono font-bold text-xl tracking-widest text-center shadow-inner">
                              619342
                            </div>
                            {challenge?.professionalOtpVerified && (
                              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Customer verified your code!
                              </p>
                            )}
                          </div>

                          {/* Enter Customer Code */}
                          <div className="p-4 rounded-xl bg-ivory border border-amber-200 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                              Enter Customer&apos;s 6-Digit Code
                            </span>
                            <p className="text-xs text-aubergine/70">
                              Ask customer for the code received on their phone:
                            </p>

                            {challenge?.customerOtpVerified ? (
                              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>Customer code verified successfully!</span>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="e.g. 482910"
                                  value={customerOtpInput[b.id] || ''}
                                  onChange={(e) =>
                                    setCustomerOtpInput((prev) => ({
                                      ...prev,
                                      [b.id]: e.target.value.replace(/\D/g, ''),
                                    }))
                                  }
                                  className="flex-1 px-3 py-2 rounded-xl bg-ivory-pure border border-amber-300 font-mono text-sm tracking-widest text-aubergine focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <button
                                  type="button"
                                  disabled={otpSubmitting[b.id] || (customerOtpInput[b.id] || '').length !== 6}
                                  onClick={() => handleVerifyCustomerOtp(b.id)}
                                  className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold uppercase transition-colors disabled:opacity-50"
                                >
                                  {otpSubmitting[b.id] ? 'Verifying...' : 'Verify'}
                                </button>
                              </div>
                            )}

                            {otpFeedback[b.id] && (
                              <p
                                className={`text-xs font-medium ${
                                  otpFeedback[b.id].type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {otpFeedback[b.id].text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phase 3: Identity Verified -> Ready to Start Service */}
                    {b.status === 'IDENTITY_VERIFIED' && (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm">Mutual Verification Complete!</p>
                          <p className="text-xs text-blue-800/80">
                            Identity confirmed. You are authorized to begin the service.
                          </p>
                        </div>

                        <button
                          disabled={startingService[b.id]}
                          onClick={() => handleStartService(b.id)}
                          className="px-6 py-2.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-gold text-gold" />
                          <span>{startingService[b.id] ? 'Starting...' : 'Start Service'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Service in Progress Actions */}
                {b.status === 'IN_PROGRESS' && (
                  <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-purple-900">Treatment in Progress</p>
                      <p className="text-xs text-purple-800/70">
                        Deliver the highest quality therapy according to salon hygiene standards.
                      </p>
                    </div>

                    <button
                      disabled={completingService[b.id]}
                      onClick={() => handleCompleteService(b.id)}
                      className="px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-ivory text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      {completingService[b.id] ? 'Finishing...' : 'Mark Service Completed'}
                    </button>
                  </div>
                )}

                {/* Completed Service: Record Payment Button */}
                {b.status === 'COMPLETED' && (
                  <div className="p-4 rounded-2xl bg-ivory-warm border border-terracotta/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-aubergine">
                        {b.paymentRecord ? (
                          <span className="text-emerald-700">Payment Recorded: ₹{b.paymentRecord.amount} ({b.paymentRecord.paymentMethod})</span>
                        ) : (
                          <span className="text-amber-800">Direct Payment Pending Collection</span>
                        )}
                      </p>
                      <p className="text-[11px] text-aubergine/60">
                        Collect payment directly from customer via Cash or UPI QR.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setPaymentModalBooking(b);
                        setPaymentAmount(b.totalAmount);
                      }}
                      className="px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{b.paymentRecord ? 'Update Payment' : 'Record Direct Payment'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/15 text-center text-xs text-aubergine/70">
            No appointments currently assigned to your roster.
          </div>
        )}
      </div>

      {/* Record Direct Payment Modal */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 space-y-5 border border-terracotta/20 shadow-luxury-lg">
            <div className="flex items-center justify-between pb-3 border-b border-terracotta/15">
              <h3 className="font-serif font-bold text-xl text-aubergine">Record Direct Payment</h3>
              <button onClick={() => setPaymentModalBooking(null)} className="p-1 text-aubergine/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-sm font-bold text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm, QR)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="DIRECT_OTHER">Direct Salon POS / Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-1">
                  Transaction / UTR Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/6192849201"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <button
                type="submit"
                disabled={recordingPayment || paymentAmount <= 0}
                className="w-full py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
              >
                {recordingPayment ? 'Saving Record...' : 'Record Payment Received'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
