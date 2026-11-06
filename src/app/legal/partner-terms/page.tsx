import React from 'react';
import Link from 'next/link';

export default function PartnerTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-aubergine font-sans">
      <div className="space-y-2 border-b border-terracotta/15 pb-6">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">B2B2C Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine">Salon Partner Agreement</h1>
        <p className="text-xs text-aubergine/60">Applicable to all registered salons across India • November 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-aubergine/80">
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">1. Partner Eligibility & Onboarding Status</h2>
          <p>
            All registered salons enter the marketplace in <strong>PENDING_APPROVAL</strong> status. The salon must provide valid business details, physical branch address, and agree to audit by CIELVO. Salons become visible to public clients only after formal administrative approval.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">2. Employee Verification & At-Home Obligations</h2>
          <p>
            For any service marked as available for at-home delivery, the salon warrants that only background-checked, certified employees under direct salon management will be assigned. Salons must ensure staff participate strictly in the two-way doorstep OTP verification protocol and adhere to clinical sterilization standards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">3. Direct Payment Accounting</h2>
          <p>
            Salons agree to accurately record all payments received directly from customers (Cash or UPI) through the salon portal. Salons shall promptly investigate any customer disputes regarding amount discrepancies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">4. Multi-Branch Operations</h2>
          <p>
            One salon entity may register multiple branches across Indian cities and states under a unified master account, with independent staff rosters, service pricing, and operating hours per branch location.
          </p>
        </section>
      </div>
    </div>
  );
}
