import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-aubergine font-sans">
      <div className="space-y-2 border-b border-terracotta/15 pb-6">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Compliance & Trust</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine">Privacy Policy</h1>
        <p className="text-xs text-aubergine/60">Last updated: November 2026 • Prepared in alignment with Indian DPDPA 2023</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-aubergine/80">
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">1. Overview & Data Fiduciary</h2>
          <p>
            CIELVO Technologies Private Limited (&ldquo;CIELVO&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates as a BeautyTech marketplace intermediary. We are committed to protecting the privacy, confidentiality, and security of our customers, salon owners, and beauty professionals throughout India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">2. Information We Collect</h2>
          <p>We collect personal information necessary to deliver marketplace services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Identity:</strong> Full Name, Email Address, 10-digit Indian Mobile Number.</li>
            <li><strong>Location Data:</strong> Device GPS coordinates (only upon explicit browser permission), Selected Indian State, District, City, Locality, and 6-digit PIN code.</li>
            <li><strong>Doorstep Service Address:</strong> Street address and landmark provided by customers strictly for fulfilling at-home beauty bookings.</li>
            <li><strong>Doorstep Two-Way Verification Codes:</strong> Hashed random 6-digit OTPs and timestamped verification attempts for doorstep safety.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">3. Doorstep Address Confidentiality</h2>
          <p>
            Customer home addresses are never published or publicly indexed. The delivery address is shared strictly and exclusively with the assigned, background-verified salon employee after salon acceptance, solely for transit and service execution. Access to detailed appointment address snapshots is revoked once the appointment concludes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">4. Financial & Payment Data</h2>
          <p>
            CIELVO does not collect, hold, or process credit card details, debit card numbers, UPI PINs, or net banking passwords. All payments are executed directly between the customer and the salon via Cash or direct UPI QR at front desks or doorsteps.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">5. Grievance Officer Contact</h2>
          <p>
            In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the Grievance Officer for CIELVO is:
          </p>
          <div className="p-4 rounded-xl bg-ivory-warm border border-terracotta/20 text-xs">
            <p><strong>Grievance Officer:</strong> Legal & Compliance Desk, CIELVO Technologies Pvt Ltd</p>
            <p><strong>Email:</strong> grievance@cielvo.com</p>
            <p><strong>Support Helpline:</strong> +91 8000 243586</p>
            <p><strong>Response Time:</strong> Acknowledged within 24 hours, resolved within 15 business days.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
