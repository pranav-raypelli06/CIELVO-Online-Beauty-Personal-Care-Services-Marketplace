import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-aubergine font-sans">
      <div className="space-y-2 border-b border-terracotta/15 pb-6">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">User Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine">Terms and Conditions</h1>
        <p className="text-xs text-aubergine/60">Effective Date: November 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-aubergine/80">
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">1. Platform Nature & Business Model</h2>
          <p>
            CIELVO provides a technology discovery and booking marketplace platform connecting clients with registered salons and salon-employed beauty professionals across India. CIELVO does not operate salons directly nor does it employ independent beauty freelancers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">2. Direct Payment System</h2>
          <p>
            Customers do not pay CIELVO for services. All payments (via Cash, UPI, or Direct POS) are made directly to the registered salon or its authorized professional upon completion of the beauty treatment. CIELVO provides payment acknowledgement tools but does not act as a payment gateway or escrow agent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">3. Doorstep Safety & Two-Way OTP Compliance</h2>
          <p>
            For all at-home salon services, participation in the two-way doorstep OTP verification challenge is mandatory. Customers must visually inspect the assigned professional&apos;s credentials and verify both 6-digit codes before authorizing the professional to commence treatment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">4. Cancellation Policy</h2>
          <p>
            Appointments may be cancelled by customers or salons prior to transit. Cancellations for accepted bookings must be accompanied by a recorded reason. Excessive frivolous cancellations may result in account review or temporary restriction.
          </p>
        </section>
      </div>
    </div>
  );
}
