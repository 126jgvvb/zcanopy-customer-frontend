"use client";

import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

import { COLORS } from "@/lib/theme";
import { CreditCard, Lock, PieChart, Banknote, RadioTower } from "lucide-react";

const PAYMENT_NODES = [
  {
    id: "book",
    Icon: CreditCard,
    t: "Book & pay",
    d: "Clients pay booking fees and subscriptions instantly via mobile money.",
  },
  {
    id: "escrow",
    Icon: Lock,
    t: "Escrow hold",
    d: "Funds are secured and reconciled automatically against the transaction.",
  },
  {
    id: "commission",
    Icon: PieChart,
    t: "Commission split",
    d: "The platform commission is calculated and the broker's share is earmarked.",
  },
  {
    id: "payout",
    Icon: Banknote,
    t: "Payout",
    d: "Verified brokers withdraw earnings straight to their mobile money wallet.",
  },
  {
    id: "carriers",
    Icon: RadioTower,
    t: "Carriers we support today",
    d: "ZCanopy settles payments through Uganda's most widely used mobile money networks, with card and bank rails on the roadmap.",
  },
];

// The four money-movement stages form the 2 x 2 matrix; carriers gets the wide card.
const STEPS = PAYMENT_NODES.slice(0, 4);
const CARRIERS_NODE = PAYMENT_NODES[4];

const CARRIERS = [
  { name: "MTN MoMo", logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg" },
  { name: "Airtel Money", logo: "https://upload.wikimedia.org/wikipedia/commons/d/da/Airtel_Africa_logo.svg" },
];

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-[var(--background)]">
        <div
          className="absolute left-1/2 top-1/4 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accentGold}26 0%, transparent 68%)`,
          }}
        />

        <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:py-20">

          <div className="max-w-2xl">
            <span className="eyebrow">Payments</span>
            <h1 className="mt-5 text-4xl sm:text-5xl">A payment flow you can trust</h1>
            <p className="mt-4 text-gray-600">
              From booking to payout, every shilling moves through secure, locally trusted rails.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- 2 x 2 step matrix */}
      <section className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="eyebrow">Step by step</span>
            <h2 className="mt-5 text-3xl sm:text-4xl">How to make payments</h2>
            <p className="mt-4 text-gray-600">
              Four stages move a single booking from a client&apos;s phone to a broker&apos;s mobile
              money wallet.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {STEPS.map((s, idx) => (
              <article
                key={s.id}
                className={`matrix-card surface-card flex flex-col gap-6 p-8 sm:p-10 lg:p-12 slide-up slide-up-${(idx % 6) + 1}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: `color-mix(in srgb, ${COLORS.accentGold} 16%, transparent)`,
                      color: COLORS.primary,
                    }}
                  >
                    <s.Icon size={24} strokeWidth={1.5} />
                  </span>
                  <span
                    className="font-display text-5xl leading-none"
                    style={{ color: COLORS.accentGold }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl" style={{ color: COLORS.cardBrown }}>
                    {s.t}
                  </h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-gray-600">{s.d}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Carriers — wide card closing out the matrix */}
          <article className="surface-card mt-6 flex flex-col gap-6 p-8 sm:p-10 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-12">
            <div className="flex items-start gap-6">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: `color-mix(in srgb, ${COLORS.accentGold} 16%, transparent)`,
                  color: COLORS.primary,
                }}
              >
                <CARRIERS_NODE.Icon size={24} strokeWidth={1.5} />
              </span>
              <div className="max-w-md">
                <h3 className="text-2xl" style={{ color: COLORS.cardBrown }}>
                  {CARRIERS_NODE.t}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                  {CARRIERS_NODE.d}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
              {CARRIERS.map((c) => (
                <span
                  key={c.name}
                  className="flex items-center gap-2 rounded-2xl bg-white/95 px-5 py-2.5 shadow-sm ring-1 ring-white/40"
                >
                  <img src={c.logo} alt={c.name} className="h-6 w-auto object-contain" />
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <Footer />
      <ScrollReveal />
    </main>
  );
}
