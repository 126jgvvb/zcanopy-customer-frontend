"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin } from "lucide-react";
import { COLORS } from "@/lib/theme";

const CONTACT = {
  phone: "+256741882818",
  email: "support@zcanopy.com",
  location: "Kampala, Uganda",
};

const FAQS = [
  {
    q: "How do I become a broker?",
    a: "Click \"Become a Broker\", complete the sign-up form, verify your email and phone, and finish onboarding in the ZCanopy mobile app using your broker code.",
  },
  {
    q: "How is my identity verified?",
    a: "You provide a valid government-issued ID during sign-up. Our team reviews it before your account is approved to list properties.",
  },
  {
    q: "What happens if fraud is reported?",
    a: "ZCanopy cooperates with authorities. By agreeing to our Terms of Agreement, you consent to your broker information being shared with the relevant authorities in the event of suspected fraud.",
  },
  {
    q: "How do I reset access or get support?",
    a: "Reach out to us by phone or email below and our support team will assist you.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl">
          Help &amp; Support
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Need a hand? Browse the FAQs below or contact our team directly.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a href={`tel:${CONTACT.phone}`} className="surface-card p-6">
            <Phone className="h-6 w-6" style={{ color: COLORS.primary }} />
            <h3 className="mt-3 text-lg">Call us</h3>
            <p className="mt-1 text-sm text-gray-500">{CONTACT.phone}</p>
          </a>
          <a href={`mailto:${CONTACT.email}`} className="surface-card p-6">
            <Mail className="h-6 w-6" style={{ color: COLORS.primary }} />
            <h3 className="mt-3 text-lg">Email us</h3>
            <p className="mt-1 text-sm text-gray-500">{CONTACT.email}</p>
          </a>
          <div className="surface-card p-6">
            <MapPin className="h-6 w-6" style={{ color: COLORS.primary }} />
            <h3 className="mt-3 text-lg">Visit us</h3>
            <p className="mt-1 text-sm text-gray-500">{CONTACT.location}</p>
          </div>
        </div>

        <h2 className="mt-14 text-2xl">
          Frequently asked questions
        </h2>
        <div className="mt-5 space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="text-lg">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          See our <Link href="/terms" className="font-medium text-[var(--zcanopy-primary)] hover:underline">Terms of Agreement</Link> for full details on fraud handling and data disclosure.
        </p>
      </section>

      <Footer />
    </main>
  );
}
