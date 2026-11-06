'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  X,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  FileText,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSalonsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('all');

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [rejectionModalSalon, setRejectionModalSalon] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchSalons = useCallback(async () => {
    try {
      const url = statusFilter === 'all' ? '/api/admin/salons' : `/api/admin/salons?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSalons(data.salons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/admin/salons');
      return;
    }
    if (user && user.role === 'ADMIN') {
      fetchSalons();
    }
  }, [user, authLoading, router, fetchSalons]);

  const handleUpdateStatus = async (salonId: string, action: 'APPROVE' | 'SUSPEND' | 'TOGGLE_FEATURED', isFeatured?: boolean) => {
    setActionLoading((prev) => ({ ...prev, [salonId]: true }));
    try {
      const res = await fetch('/api/admin/salons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId,
          action,
          isFeatured,
        }),
      });
      if (res.ok) {
        await fetchSalons();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [salonId]: false }));
    }
  };

  const handleRejectSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalSalon || !rejectionReason.trim()) return;

    const salonId = rejectionModalSalon.id;
    setActionLoading((prev) => ({ ...prev, [salonId]: true }));

    try {
      const res = await fetch('/api/admin/salons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId,
          action: 'REJECT',
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (res.ok) {
        setRejectionModalSalon(null);
        setRejectionReason('');
        await fetchSalons();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [salonId]: false }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-aubergine/70">Loading salon applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-terracotta/15">
        <div>
          <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Moderation & Compliance</span>
          <h1 className="text-3xl font-serif font-bold text-aubergine mt-1">Salon Partner Approvals</h1>
        </div>

        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold text-terracotta hover:underline"
        >
          ← Return to Admin Dashboard
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-terracotta/15 pb-2 text-xs font-medium">
        {[
          { key: 'all', label: 'All Salons' },
          { key: 'PENDING_APPROVAL', label: 'Pending Applications' },
          { key: 'APPROVED', label: 'Approved Salons' },
          { key: 'REJECTED', label: 'Rejected' },
          { key: 'SUSPENDED', label: 'Suspended' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              statusFilter === tab.key
                ? 'bg-aubergine text-ivory font-bold shadow-sm'
                : 'bg-ivory text-aubergine/70 hover:bg-blush'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Salons List */}
      {salons.length > 0 ? (
        <div className="space-y-4">
          {salons.map((salon) => {
            const primaryBranch = salon.locations?.[0];
            const isPending = salon.status === 'PENDING_APPROVAL';

            return (
              <div
                key={salon.id}
                className="p-6 rounded-3xl bg-ivory-pure border border-terracotta/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        salon.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : salon.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {salon.status.replace(/_/g, ' ')}
                    </span>
                    {salon.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gold text-aubergine text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    <span className="text-xs text-aubergine/50">
                      Applied {new Date(salon.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-aubergine">
                    {salon.businessName}
                  </h3>

                  <p className="text-xs text-aubergine/75 leading-relaxed max-w-2xl">
                    {salon.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-aubergine/70 pt-1">
                    {primaryBranch && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-terracotta" />
                        {primaryBranch.locality}, {primaryBranch.city}, {primaryBranch.state}
                      </span>
                    )}
                    <span>•</span>
                    <span>Owner Email: <strong>{salon.owner?.email}</strong></span>
                    <span>•</span>
                    <span>Phone: <strong>{salon.owner?.phone}</strong></span>
                    {salon.registrationNumber && (
                      <>
                        <span>•</span>
                        <span>Reg / GST: <strong>{salon.registrationNumber}</strong></span>
                      </>
                    )}
                  </div>

                  {salon.rejectionReason && (
                    <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg mt-2">
                      <strong>Rejection Note:</strong> {salon.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Administrative Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-end gap-2 flex-shrink-0">
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading[salon.id]}
                        onClick={() => handleUpdateStatus(salon.id, 'APPROVE')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-ivory text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                      >
                        {actionLoading[salon.id] ? 'Updating...' : 'Approve Salon'}
                      </button>
                      <button
                        onClick={() => {
                          setRejectionModalSalon(salon);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {salon.status === 'APPROVED' && (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading[salon.id]}
                        onClick={() => handleUpdateStatus(salon.id, 'TOGGLE_FEATURED', !salon.isFeatured)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                          salon.isFeatured
                            ? 'bg-gold/20 border-gold text-aubergine hover:bg-gold/30'
                            : 'border-terracotta/20 text-aubergine hover:bg-blush'
                        }`}
                      >
                        {salon.isFeatured ? 'Unfeature' : 'Feature on Homepage'}
                      </button>
                      <button
                        disabled={actionLoading[salon.id]}
                        onClick={() => handleUpdateStatus(salon.id, 'SUSPEND')}
                        className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Suspend
                      </button>
                    </div>
                  )}

                  {salon.status === 'SUSPENDED' && (
                    <button
                      disabled={actionLoading[salon.id]}
                      onClick={() => handleUpdateStatus(salon.id, 'APPROVE')}
                      className="px-4 py-2 rounded-xl bg-emerald-700 text-ivory text-xs font-bold"
                    >
                      Re-Activate Salon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-ivory-warm border border-terracotta/20 text-center text-xs text-aubergine/70">
          No salons found for the selected status filter.
        </div>
      )}

      {/* Reject Application Modal */}
      {rejectionModalSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aubergine-950/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 space-y-4 border border-terracotta/20 shadow-luxury-lg">
            <h3 className="font-serif font-bold text-xl text-aubergine">Reject Salon Application</h3>
            <p className="text-xs text-aubergine/70">
              Provide an official reason for declining {rejectionModalSalon.businessName}. The salon owner will receive this feedback.
            </p>

            <form onSubmit={handleRejectSalon} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="e.g. Incomplete business address, missing documentation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-pure border border-terracotta/20 text-xs text-aubergine focus:outline-none focus:ring-1 focus:ring-terracotta"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-3 rounded-full bg-rose-700 hover:bg-rose-800 text-ivory text-xs font-bold transition-colors"
                >
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionModalSalon(null)}
                  className="px-5 py-3 rounded-full border border-terracotta/30 text-aubergine text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
