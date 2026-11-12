"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { COLORS } from "@/lib/theme";
import { SUPPORT_EMAIL } from "@/lib/navigation";

interface Section {
  id: string;
  title: string;
  body: string[];
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      "ZCanopy is committed to protecting clients who book or reserve a property through the Platform. This Refund Policy explains the limited circumstances in which funds paid through ZCanopy may be refunded.",
      "By making a payment on the Platform, you acknowledge and agree to the terms set out on this page.",
    ],
  },
  {
    id: "eligibility",
    title: "2. When You Qualify for a Refund",
    body: [
      "A refund of your funds applies only if you physically reach the property you booked — that is, you go to the property on the ground — and you encounter one of the following two situations:",
      "Price mismatch: the actual price of the property on the ground is different from the price that was shown to you on the Platform at the time you made your payment.",
      "Property already taken: you find that the property has already been taken (for example, it has already been booked, sold, rented out, or otherwise committed to another person), and it is therefore not available to you despite your payment.",
    ],
  },
  {
    id: "not-eligible",
    title: "3. When Refunds Do Not Apply",
    body: [
      "Outside of the two situations described in Section 2, refunds are not offered. In particular, no refund will be issued if you did not reach the property on the ground, or if the price shown on the Platform matches the price on the ground and the property is still available to you.",
      "Changing your mind, failing to visit the property, or no longer needing the property does not qualify you for a refund.",
    ],
  },
  {
    id: "how-to-request",
    title: "4. How to Request a Refund",
    body: [
      "To request a refund, contact ZCanopy support as soon as possible after reaching the property, and in any case within the period stated by our support team.",
      "Include your full name, the property booked, your payment reference or transaction details, the date you visited the property, and a clear description of what you found on the ground.",
      "Where available, attach supporting evidence — such as a photo or short video of the property, the price displayed on the ground, or confirmation that the property is already taken.",
    ],
  },
  {
    id: "processing",
    title: "5. How Refunds Are Processed",
    body: [
      "Once your request is received, ZCanopy will review the information and may contact you or the broker for verification. If your claim is confirmed to fall within Section 2, your refund will be approved.",
      "Approved refunds are returned through the same payment channel you used where possible, such as the mobile money number or account used to pay. Processing times may vary depending on the payment provider.",
      "ZCanopy reserves the right to decline any request that does not meet the conditions in Section 2 or that is found to be fraudulent, inaccurate, or incomplete.",
    ],
  },
  {
    id: "contact",
    title: "6. Contact Us",
    body: [
      `For questions about this Refund Policy or to submit a refund request, contact us at ${SUPPORT_EMAIL} or +256741882818, Kampala, Uganda.`,
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl">
          Refund Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-12 rounded-2xl p-6"
          style={{ border: `1px solid ${COLORS.accentGold}`, backgroundColor: `${COLORS.accentGold}1A` }}
        >
          <p className="text-sm text-gray-700">
            In short: your funds can be refunded only if you reach the property on the ground and the
            price differs from what was shown, or if the property is found to be already taken. If the
            property is available at the listed price, no refund applies.
          </p>
          <Link
            href="/help"
            className="btn-primary mt-5 px-6 py-3 text-sm"
          >
            Get Help with a Booking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
