import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="border-b border-terracotta/20 pb-6">
        <span className="text-xs uppercase tracking-luxury text-terracotta font-semibold">Regulatory Compliance</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aubergine mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-aubergine/60 mt-2">
          Effective Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} | Compliant with Digital Personal Data Protection Act (DPDPA 2023)
        </p>
      </div>

      <div className="space-y-6 text-sm text-aubergine/80 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">1. Overview</h2>
          <p>
            CIELVO Technologies Private Limited (&ldquo;CIELVO&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal data. This privacy notice informs you how we look after your personal data when you visit our marketplace and tells you about your privacy rights under Indian law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">2. Data We Collect</h2>
          <p>
            We collect identity data (full name), contact data (mobile number, email address), delivery address data (for at-home salon bookings), and device location data (with explicit browser/app consent to display salons near you).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-serif font-bold text-aubergine">3. Two-Way Doorstep OTP Safety Verification</h2>
          <p>
            For services requested at customer premises, cryptographic one-time passwords (OTPs) are generated solely for identity verification at doorstep arrival. OTP logs and mutual verification timestamps are retained securely for customer and service professional safety auditing.
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
          <div className="p-4 rounded-xl bg-ivory-warm border border-terracotta/20 text-xs space-y-1">
            <p><strong>Grievance Officer:</strong> Legal & Compliance Desk, CIELVO Technologies Pvt Ltd</p>
            <p><strong>Email:</strong> <a href="mailto:cielvotechnologies@gmail.com" className="text-terracotta font-semibold hover:underline">cielvotechnologies@gmail.com</a></p>
            <p><strong>Support Helpline:</strong> <a href="tel:+917264845323" className="text-terracotta font-semibold hover:underline">+917264845323</a></p>
            <p><strong>Response Time:</strong> Acknowledged within 24 hours, resolved within 15 business days.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
