"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { Home, CheckCircle, MapPin } from "lucide-react";
import { COLORS } from "@/lib/theme";

const VALUES = [
  { icon: Home, title: "Trusted Listings", text: "Every property is tied to a verified broker, reducing fraud and building trust." },
  { icon: CheckCircle, title: "Verified Brokers", text: "Brokers pass identity verification before they can list on the Platform." },
  { icon: MapPin, title: "Local Expertise", text: "Built in Uganda, for Uganda's property market." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl">
          About ZCanopy
        </h1>
        <p className="mt-5 text-base leading-relaxed text-gray-600">
          ZCanopy is Uganda&apos;s elegant property marketplace, connecting verified brokers with clients
          searching for homes, land, and rentals. Our mission is to make property discovery transparent,
          trustworthy, and simple — while giving brokers the tools they need to grow their business.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="surface-card p-6">
              <v.icon className="h-6 w-6" style={{ color: COLORS.primary }} />
              <h3 className="mt-4 text-lg">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.cardBrown})` }}>
          <h2 className="text-2xl text-white" style={{ color: "#fff" }}>Want to list with us?</h2>
          <Link
            href="/brokers/signup"
            className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5"
            style={{ color: COLORS.primary }}
          >
            Become a broker
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
