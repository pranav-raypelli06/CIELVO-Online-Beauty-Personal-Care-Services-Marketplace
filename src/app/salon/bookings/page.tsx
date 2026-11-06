'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  Check,
  UserCheck,
  CreditCard,
  ShieldCheck,
  Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalonBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'REQUESTED' | 'CONFIRMED' | 'COMPLETED'>('ALL');

  // Staff Assignment Modal
  const [assignModalBooking, setAssignModalBooking] = useState<any | null>(null);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Reject Modal
  const [rejectModalBooking, setRejectModalBooking] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Record Direct Payment Modal
  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'DIRECT_OTHER'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchBookings = useCallback(async () => {
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
    if (!authLoading && (!user || (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN'))) {
      router.push('/auth/login?redirect=/salon/bookings');
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router, fetchBookings]);

  // Open assign modal and load branch staff
  const handleOpenAssignModal = async (b: any) => {
    setAssignModalBooking(b);
    setSelectedStaffId('');
    setAssignError(null);

    try {
      const res = await fetch(`/api/salons/${b.salonId}`);
      if (res.ok) {
        const data = await res.json();
        const branch = data.salon.locations.find((l: any) => l.id === b.locationId) || data.salon.locations[0];
        setAvailableStaff(branch?.staff || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalBooking || !selectedStaffId) return;

    setAssigning(true);
    setAssignError(null);

    try {
      const res = await fetch(`/api/bookings/${assignModalBooking.id}/assign-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: selectedStaffId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.error || 'Failed to assign staff member');
      } else {
        setAssignModalBooking(null);
        await fetchBookings();
      }
    } catch (e: any) {
      setAssignError(e.message || 'Error assigning staff');
    } finally {
      setAssigning(false);
    }
  };

  const handleRejectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalBooking || !rejectionReason.trim()) return;

    setRejecting(true);
    try {
      const res = await fetch(`/api/bookings/${rejectModalBooking.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          cancellationReason: rejectionReason.trim(),
        }),
      });

      if (res.ok) {
        setRejectModalBooking(null);
        setRejectionReason('');
        await fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRejecting(false);
    }
  };

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
        await fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingPayment(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'REQUESTED') return b.status === 'REQUESTED';
    if (activeTab === 'CONFIRMED') {
      return ['ACCEPTED', 'CONFIRMED', 'PROVIDER_EN_ROUTE', 'ARRIVED', 'IDENTITY_VERIFIED', 'IN_PROGRESS'].includes(b.status);
    }
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Salon Desk</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Bookings & Dispatch</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-terracotta/15 pb-2 text-xs font-medium">
        {[
          { key: 'ALL', label: 'All Appointments', count: bookings.length },
          { key: 'REQUESTED', label: 'Pending Requests', count: bookings.filter((b) => b.status === 'REQUESTED').length },
          { key: 'CONFIRMED', label: 'Confirmed / Active', count: bookings.filter((b) => ['CONFIRMED', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length },
          { key: 'COMPLETED', label: 'Completed', count: bookings.filter((b) => b.status === 'COMPLETED').length },
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

      {/* Bookings Table / Cards */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-terracotta uppercase">
                    #{b.bookingNumber}
                  </span>
                  <span className="text-aubergine/40">•</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'REQUESTED'
                        ? 'bg-amber-100 text-amber-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {b.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blush text-aubergine font-bold uppercase">
                    {b.bookingType}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-aubergine">
                  {b.items?.[0]?.serviceName}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-aubergine/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-terracotta" />
                    {b.appointmentDate} at {b.appointmentTime}
                  </span>
                  <span>•</span>
                  <span>Customer: <strong>{b.customer?.fullName}</strong> ({b.customer?.user?.phone})</span>
                  <span>•</span>
                  <span>Total Amount: <strong>₹{b.totalAmount}</strong></span>
                </div>

                {/* If AT_HOME, show service address */}
                {b.bookingType === 'AT_HOME' && b.serviceAddressSnapshot && (
                  <p className="text-xs text-aubergine/80 bg-blush-light p-2 rounded-lg">
                    <strong className="text-terracotta">Delivery Address:</strong> {b.serviceAddressSnapshot}
                  </p>
                )}

                {/* Assigned Staff Info */}
                {b.assignedStaff ? (
                  <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigned Staff: <strong>{b.assignedStaff.fullName}</strong> ({b.assignedStaff.roleTitle})</span>
                  </p>
                ) : (
                  <p className="text-xs text-rose-700 font-medium">⚠️ No staff member assigned yet</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-end gap-2 flex-shrink-0">
                {b.status === 'REQUESTED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenAssignModal(b)}
                      className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold transition-colors shadow-sm"
                    >
                      Accept & Assign Staff
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalBooking(b);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {b.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleOpenAssignModal(b)}
                    className="px-4 py-2 rounded-xl bg-aubergine text-ivory text-xs font-bold"
                  >
                    Assign Staff Member
                  </button>
                )}

                {/* Record Payment Button */}
                {['IN_PROGRESS', 'COMPLETED'].includes(b.status) && (
                  <button
                    onClick={() => {
                      setPaymentModalBooking(b);
                      setPaymentAmount(b.totalAmount);
                      setTransactionRef('');
                    }}
                    className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-600 text-ivory text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{b.paymentRecord ? 'Update Payment' : 'Record Direct Payment'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/20 text-center text-xs text-aubergine/70">
          No appointments in this category.
        </div>
      )}

      {/* Staff Assignment Modal */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 space-y-5 border border-terracotta/20 shadow-luxury-lg">
            <div className="flex items-center justify-between pb-3 border-b border-terracotta/15">
              <h3 className="font-serif font-bold text-xl text-aubergine">Assign Staff Member</h3>
              <button onClick={() => setAssignModalBooking(null)} className="p-1 text-aubergine/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-aubergine/80 space-y-1">
              <p>Booking: <strong>#{assignModalBooking.bookingNumber}</strong></p>
              <p>Service: <strong>{assignModalBooking.items?.[0]?.serviceName}</strong></p>
              <p>Slot: <strong>{assignModalBooking.appointmentDate} at {assignModalBooking.appointmentTime}</strong></p>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-aubergine mb-2">
                  Select Certified Professional *
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {availableStaff.length > 0 ? (
                    availableStaff.map((st: any) => (
                      <label
                        key={st.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedStaffId === st.id
                            ? 'border-aubergine bg-aubergine text-ivory'
                            : 'border-terracotta/15 bg-ivory text-aubergine hover:bg-blush'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="staff"
                            value={st.id}
                            checked={selectedStaffId === st.id}
                            onChange={() => setSelectedStaffId(st.id)}
                            className="text-terracotta focus:ring-terracotta"
                          />
                          <div>
                            <p className="font-bold text-xs">{st.fullName}</p>
                            <p className={`text-[10px] ${selectedStaffId === st.id ? 'text-ivory/70' : 'text-aubergine/60'}`}>
                              {st.roleTitle}
                            </p>
                          </div>
                        </div>
                        {st.atHomeEnabled && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                            At-Home
                          </span>
                        )}
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-aubergine/60">No active staff registered at this branch.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={assigning || !selectedStaffId}
                className="w-full py-3.5 rounded-full bg-aubergine hover:bg-aubergine-900 text-ivory text-xs font-bold uppercase tracking-wider shadow-luxury transition-all disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment & Accept'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 space-y-4 border border-terracotta/20 shadow-luxury-lg">
            <h3 className="font-serif font-bold text-xl text-aubergine">Reject Booking Request</h3>
            <p className="text-xs text-aubergine/70">
              Please provide a professional reason for declining appointment #{rejectModalBooking.bookingNumber}. The customer will be notified.
            </p>

            <form onSubmit={handleRejectBooking} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="e.g. Fully booked at requested hour, outside delivery radius..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={rejecting || !rejectionReason.trim()}
                  className="flex-1 py-3 rounded-full bg-rose-700 hover:bg-rose-800 text-ivory text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalBooking(null)}
                  className="px-5 py-3 rounded-full border border-terracotta/30 text-aubergine text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Payment Recorder Modal */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 space-y-5 border border-terracotta/20 shadow-luxury-lg">
            <div className="flex items-center justify-between pb-3 border-b border-terracotta/15">
              <h3 className="font-serif font-bold text-xl text-aubergine">Record Direct Payment</h3>
              <button onClick={() => setPaymentModalBooking(null)} className="p-1 text-aubergine/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-aubergine/70">
              Record the cash or UPI payment directly received by your salon/staff for booking #{paymentModalBooking.bookingNumber}.
            </p>

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
