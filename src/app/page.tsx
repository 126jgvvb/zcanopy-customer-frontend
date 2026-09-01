import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { BROKER_SIGNUP_URL } from "@/lib/navigation";
import FeaturedSlideshow from "@/components/FeaturedSlideshow";
import GlowFallingText from "@/components/GlowFallingText";
import Footer from "@/components/Footer";
import { Home as HomeIcon, Handshake, BarChart3, Shield, MessageSquare, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: HomeIcon,
    title: "List with ease",
    text: "Brokers upload properties with photos and video, set availability, and reach buyers across Uganda.",
  },
  {
    icon: Handshake,
    title: "Smart connections",
    text: "Every broker gets a unique broker code clients use in the mobile app to discover their listings.",
  },
  {
    icon: BarChart3,
    title: "Transparent earnings",
    text: "Track commissions, bookings, and payouts in real time with clear, auditable reporting.",
  },
  {
    icon: Shield,
    title: "Verified & trusted",
    text: "Document verification and OTP confirmation keep the marketplace safe for everyone.",
  },
  {
    icon: MessageSquare,
    title: "Unified messaging",
    text: "Coordinate with clients and brokers from one console — email and SMS, fully logged.",
  },
  {
    icon: Zap,
    title: "Instant invoicing",
    text: "The notification service auto-generates and delivers invoices for subscriptions and listings.",
  },
];

const STATS = [
  { value: "12k+", label: "Active listings" },
  { value: "3k+", label: "Verified brokers" },
  { value: "UGX 22M+", label: "Paid out in commissions" },
  { value: "99.9%", label: "Platform uptime" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 500px at 80% -10%, rgba(209,160,84,0.25), transparent), radial-gradient(700px 500px at 0% 0%, rgba(169,113,14,0.12), transparent)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="eyebrow">Real estate, reimagined</span>
            <h1 className="mt-6 text-4xl leading-tight sm:text-5xl lg:text-[3.4rem]">
              Find your next home in Uganda.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-600">
              Browse verified properties from trusted brokers, view details, and book directly — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn-primary px-6 py-3 text-sm">
                Browse Properties
              </Link>
              <Link href="/login" className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]">
                Broker Login
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-[var(--zcanopy-accent-gold)]/40 bg-[var(--zcanopy-surface)] p-3 shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.accentGold, color: COLORS.cardBrown }}
                  >
                    Z
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Featured listings
                  </span>
                </div>
              </div>
              <FeaturedSlideshow />
            </div>
          </div>
        </div>
      </section>

      <section id="properties" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">Latest Properties</h2>
          <p className="mt-3 text-gray-600">Explore available homes, apartments, and land across Uganda.</p>
        </div>
        <div className="mt-12 text-center">
          <Link href="/properties" className="btn-ghost px-6 py-3 text-sm">
            View all properties
          </Link>
        </div>
      </section>

      <section id="how" className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl">How it works</h2>
            <p className="mt-3 text-gray-600">From browsing to booking in three simple steps.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Browse listings", d: "Search and filter properties by location, type, and price." },
              { n: "02", t: "Book a viewing", d: "Select a property and submit a booking request with your details." },
              { n: "03", t: "Connect with broker", d: "A verified broker will reach out to confirm and complete the process." },
            ].map((step) => (
              <div key={step.n} className="surface-card relative p-7">
                <span className="font-display text-4xl" style={{ color: COLORS.accentGold }}>{step.n}</span>
                <h3 className="mt-3 text-xl">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width video */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-lift)] ring-1 ring-black/5">
            <video
              className="h-[320px] w-full object-cover sm:h-[440px]"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=70"
            >
              <source src="/sample_vid.mp4" type="video/mp4" />
            </video>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 via-black/10 to-black/40">
              <GlowFallingText text="let zcanopy deliver the property to you" />
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Discover homes across Uganda — tours, bookings, and verified brokers, all in one place.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-[var(--border)] bg-[var(--zcanopy-surface)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-14 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl sm:text-4xl" style={{ color: COLORS.primary }}>{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment flow */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Payments</span>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            A payment flow you can trust
          </h2>
          <p className="mt-3 text-gray-600">
            From booking to payout, every shilling moves through secure, locally trusted rails.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {[
            { n: "01", t: "Book & pay", d: "Clients pay booking fees and subscriptions instantly via mobile money." },
            { n: "02", t: "Escrow hold", d: "Funds are secured and reconciled automatically against the transaction." },
            { n: "03", t: "Commission split", d: "The platform commission is calculated and the broker's share is earmarked." },
            { n: "04", t: "Payout", d: "Verified brokers withdraw earnings straight to their mobile money wallet." },
          ].map((s) => (
            <div key={s.n} className="surface-card p-6">
              <span className="font-display text-3xl" style={{ color: COLORS.accentGold }}>{s.n}</span>
              <h3 className="mt-3 text-lg">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 overflow-hidden rounded-3xl p-8 sm:p-10"
          style={{ background: `linear-gradient(135deg, ${COLORS.cardBrown}, ${COLORS.primary})` }}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white" style={{ color: "#fff" }}>Carriers we support today</h3>
              <p className="mt-2 max-w-md text-sm text-white/80">
                ZCanopy settles payments through Uganda&apos;s most widely used mobile money networks,
                with card and bank rails on the roadmap.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { name: "MTN MoMo", logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg" },
                { name: "Airtel Money", logo: "https://upload.wikimedia.org/wikipedia/commons/d/da/Airtel_Africa_logo.svg" },
              ].map((c) => (
                <span
                  key={c.name}
                  className="flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-sm ring-1 ring-white/40"
                >
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="h-7 w-auto object-contain"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">Everything brokers need</h2>
          <p className="mt-3 text-gray-600">
            A complete toolkit to list, connect, and earn — built for clarity and trust.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-card p-7">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${COLORS.accentGold}22` }}
              >
                <f.icon className="h-6 w-6" style={{ color: COLORS.primary }} />
              </div>
              <h3 className="mt-4 text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For brokers */}
      <section id="brokers" className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl">List your properties with ZCanopy</h2>
            <p className="mt-3 text-gray-600">From sign-up to your first payout in three simple steps.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Create your account", d: "Sign up, confirm email & phone with an OTP, and upload your National ID." },
              { n: "02", t: "Get verified", d: "Our team reviews your documents, then emails your confirmation and broker code." },
              { n: "03", t: "List & earn", d: "Finish setup in the mobile app, publish properties, and track commissions live." },
            ].map((step) => (
              <div key={step.n} className="surface-card relative p-7">
                <span className="font-display text-4xl" style={{ color: COLORS.accentGold }}>{step.n}</span>
                <h3 className="mt-3 text-xl">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.d}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-12 overflow-hidden rounded-3xl p-10 text-center shadow-xl sm:p-14"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.cardBrown})` }}
          >
            <h2 className="text-3xl text-white sm:text-4xl" style={{ color: "#fff" }}>Ready to grow your brokerage?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Join thousands of verified brokers on Uganda&apos;s most elegant property marketplace.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={BROKER_SIGNUP_URL}
                className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5"
                style={{ color: COLORS.primary }}
              >
                Become a broker today
              </a>
              <Link
                href="/login"
                className="inline-block rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Broker Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
