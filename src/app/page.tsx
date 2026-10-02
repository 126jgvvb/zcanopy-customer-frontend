import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { BROKER_SIGNUP_URL } from "@/lib/navigation";
import HeroShowcase from "@/components/HeroShowcase";
import FeaturedPropertiesRow from "@/components/FeaturedPropertiesRow";
import FeaturedMosaic from "@/components/FeaturedMosaic";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Home as HomeIcon,
  Handshake,
  BarChart3,
  Shield,
  MessageSquare,
  Zap,
} from "lucide-react";

const VALUE_PROPS = [
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
];

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

const STEPS = [
  { n: "01", t: "Browse listings", d: "Search and filter properties by location, type, and price." },
  { n: "02", t: "Book a viewing", d: "Select a property and submit a booking request with your details." },
  { n: "03", t: "Connect with broker", d: "A verified broker will reach out to confirm and complete the process." },
];

const BROKER_STEPS = [
  {
    icon: UserPlus,
    n: "01",
    t: "Create your account",
    d: "Sign up, confirm email & phone with an OTP, and upload your National ID.",
  },
  {
    icon: ShieldCheck,
    n: "02",
    t: "Get verified",
    d: "Our team reviews your documents, then emails your confirmation and broker code.",
  },
  {
    icon: TrendingUp,
    n: "03",
    t: "List & earn",
    d: "Finish setup in the mobile app, publish properties, and track commissions live.",
  },
];

const STATS = [
  { value: "12k+", label: "Active listings" },
  { value: "3k+", label: "Verified brokers" },
  { value: "UGX 22M+", label: "Paid out in commissions" },
  { value: "99.9%", label: "Platform uptime" },
];

function CircleArrow({
  href,
  label,
  className = "",
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-current transition-colors hover:bg-white/10 ${className}`}
    >
      <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function Home() {
  return (
    <main className="tight-cards min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ---------------------------------------------------------------- Hero */}
      <HeroShowcase>
        <div className="max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
            Real estate, reimagined
          </span>

          <h1
            className="mt-6 text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.5rem]"
            style={{ color: "#f6d98e", textShadow: "0 2px 14px rgba(0,0,0,0.4)" }}
          >
            Find your next property in Uganda with ease.
          </h1>

          {/* Decorative flourish */}
          <svg
            className="mt-4 h-5 w-32 text-[var(--zcanopy-accent-gold)] opacity-80"
            viewBox="0 0 130 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 14c14-9 28-9 42-3s26 6 40-1 30-8 44 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            Browse verified properties from trusted brokers, view details, and book directly — all in
            one place.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-4 text-white">
              <CircleArrow href="/properties" label="Browse Properties" className="border-white/50" />
              <Link
                href="/properties"
                className="font-display text-xl tracking-tight transition-opacity hover:opacity-80"
              >
                Browse Properties
              </Link>
            </div>

            <Link
              href="/login"
              className="rounded-xl border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Broker Login
            </Link>
          </div>
        </div>

        {/* Trust cluster */}
        <div className="mt-14 flex items-center gap-4 lg:absolute lg:bottom-16 lg:left-0 lg:mt-0">
          <div className="flex -space-x-3">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white/25"
                style={{ background: `linear-gradient(135deg, ${COLORS.accentGold}, ${COLORS.primary})` }}
              >
                <img src="/logo.svg" alt="" className="h-5 w-5 object-contain opacity-90" />
              </span>
            ))}
          </div>
          <p className="text-sm leading-tight text-white/70">
            Trusted by
            <span className="mt-0.5 block font-display text-lg" style={{ color: "#f6d98e" }}>
              3k+ Verified brokers
            </span>
          </p>
        </div>
      </HeroShowcase>

      {/* ------------------------------------------------------- Value props */}
      <section className="border-b border-[var(--border)] bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="flex items-start gap-4 py-9 lg:px-7 lg:first:pl-0 lg:last:pr-0">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${COLORS.accentGold}22`, color: COLORS.primary }}
                >
                  <v.icon size={19} />
                </span>
                <div>
                  <h3 className="font-sans text-[15px] font-semibold" style={{ color: COLORS.cardBrown }}>
                    {v.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Featured properties */}
      <section id="properties" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* Flip mosaic */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              Featured Properties
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl">Featured properties</h2>
            <Link
              href="/properties"
              className="mt-7 inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--zcanopy-card-brown)] transition-colors hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
            >
              View all properties <ArrowRight size={14} />
            </Link>
          </div>

          <div className="lg:col-span-9">
            <FeaturedMosaic />
          </div>
        </div>

        {/* Latest properties */}
        <div className="mt-20 border-t border-[var(--border)] pt-20 lg:mt-28 lg:pt-24">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Latest Properties
                </span>
                <h2 className="mt-4 max-w-sm text-4xl sm:text-5xl">
                  Explore available homes, apartments, and land across Uganda.
                </h2>
              </div>
              <CircleArrow
                href="/properties"
                label="View all properties"
                className="text-[var(--zcanopy-card-brown)]"
              />
            </div>

            <div className="max-w-sm lg:pt-8">
              <p className="text-sm leading-relaxed text-gray-600">
                Browse verified properties from trusted brokers, view details, and book directly —
                all in one place.
              </p>
              <Link
                href="/properties"
                className="mt-4 inline-flex items-center gap-1.5 font-sans text-sm font-semibold transition-colors hover:text-[var(--zcanopy-primary)]"
                style={{ color: COLORS.primary }}
              >
                View all properties <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <FeaturedPropertiesRow />
        </div>
      </section>

      {/* ---------------------------------------- Stats — straddles the seam */}
      {/* Negative margins pull the band up over the bottom of #properties and
          down over the top of #how, so it sits on the border between them.
          z-30 keeps it above both; the sticky header is z-40 so it stays put. */}
      <section
        aria-label="Platform statistics"
        className="relative z-30 -my-14 px-5 sm:-my-16 sm:px-8 lg:-my-24"
      >
        <dl className="mx-auto grid max-w-[1500px] grid-cols-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--zcanopy-surface)] shadow-[var(--shadow-lift)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-9 text-center lg:px-6 lg:py-11 ${
                i % 2 === 1 ? "border-l border-[var(--border)]" : ""
              } ${i > 1 ? "border-t border-[var(--border)] lg:border-t-0" : ""} ${
                i === 2 ? "lg:border-l lg:border-[var(--border)]" : ""
              }`}
            >
              <dt className="font-display text-4xl sm:text-5xl" style={{ color: COLORS.primary }}>
                {s.value}
              </dt>
              <dd className="mt-2 text-sm text-gray-500">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------- How it works block */}
      <section id="how" className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-14">
            {/* Media — sharp corners, no play control */}
            <div className="min-w-0 lg:col-span-7">
              <div className="group relative overflow-hidden shadow-[var(--shadow-lift)]">
                <video
                  className="h-[340px] w-full object-cover sm:h-[460px] lg:h-full lg:min-h-[480px]"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source
                    src="https://zcanopy-properties-media.fra1.cdn.digitaloceanspaces.com/Color%20Blended%20Page%20Background%20(1).mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Discover homes across Uganda — tours, bookings, and verified brokers, all in one
                place.
              </p>
            </div>

            {/* Copy */}
            <div className="relative z-10 min-w-0 lg:col-span-5 lg:self-start">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                How it works
              </span>
              <h2 className="mt-4 text-[1.75rem] leading-[1.12] sm:text-3xl">
                From browsing to booking in three simple steps.
              </h2>

              <div className="mt-7 space-y-5">
                {STEPS.map((step, idx) => (
                  <div key={step.n} className={`flex gap-3.5 slide-up slide-up-${(idx % 6) + 1}`}>
                    <span
                      className="font-display text-[1.375rem] leading-none"
                      style={{ color: COLORS.accentGold }}
                    >
                      {step.n}
                    </span>
                    <div className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                      <h3 className="text-[15px]" style={{ color: COLORS.cardBrown }}>
                        {step.t}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-600">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/properties"
                className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: COLORS.primary,
                  boxShadow: "0 8px 18px rgba(169,113,14,0.28)",
                }}
              >
                Browse Properties <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Features */}
      <section id="features" className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Heading block */}
            <div className="lg:col-span-3">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: COLORS.primary }}
              >
                Our process
              </span>
              <h2 className="mt-5 max-w-xs text-4xl sm:text-5xl">Everything brokers need</h2>
              <p className="mt-4 max-w-sm text-gray-600">
                A complete toolkit to list, connect, and earn — built for clarity and trust.
              </p>
              <Link
                href={BROKER_SIGNUP_URL}
                className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold transition-colors hover:text-[var(--zcanopy-primary)]"
                style={{ color: COLORS.primary }}
              >
                Become a broker today <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Numbered rail */}
            <div className="grid grid-cols-2 gap-x-7 gap-y-11 sm:grid-cols-3 lg:col-span-9 xl:grid-cols-6">
              {FEATURES.map((f, idx) => (
                <div key={f.title} className={`relative slide-up slide-up-${(idx % 6) + 1}`}>
                  <span
                    className="font-display text-[1.75rem] leading-none"
                    style={{ color: COLORS.accentGold }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Rail: the rule runs across the row, the icon sits on it */}
                  <div className="relative mt-4 border-t border-[var(--border-strong)]">
                    <span
                      className="absolute -top-[1.15rem] left-0 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--zcanopy-surface)]"
                      style={{ color: COLORS.primary }}
                    >
                      <f.icon size={17} strokeWidth={1.6} />
                    </span>
                  </div>

                  <h3 className="mt-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-gray-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- For brokers / CTA */}
      <section id="brokers" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl sm:text-5xl">List your properties with ZCanopy</h2>
          <p className="mt-3 text-gray-600">
            From sign-up to your first payout in three simple steps.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BROKER_STEPS.map((step, idx) => (
            <div
              key={step.n}
              className={`step-card px-8 py-11 slide-up slide-up-${(idx % 6) + 1}`}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${COLORS.accentGold}1f`, color: COLORS.primary }}
              >
                <step.icon size={21} strokeWidth={1.6} />
              </span>

              <p
                className="mt-6 font-display text-2xl leading-none"
                style={{ color: COLORS.accentGold }}
              >
                {step.n}
              </p>
              <h3 className="mt-3 text-lg" style={{ color: COLORS.cardBrown }}>
                {step.t}
              </h3>
              <p className="mt-2.5 max-w-[16rem] text-sm leading-relaxed text-gray-500">
                {step.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=70"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Ready to grow your brokerage?
            </span>
            <h2 className="mt-4 max-w-2xl text-4xl text-white sm:text-5xl" style={{ color: "#fff" }}>
              Join thousands of verified brokers on Uganda&apos;s most elegant property marketplace.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
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

          <div className="lg:col-span-4 lg:justify-self-end">
            <Link
              href="/properties"
              className="tight-card flex w-40 flex-col items-center gap-3 bg-black/25 p-8 text-center backdrop-blur-sm transition-colors hover:bg-black/35"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white"
                style={{ color: COLORS.primary }}
              >
                <ArrowRight size={20} />
              </span>
              <span className="font-sans text-sm font-semibold text-white">Find your property</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollReveal />
    </main>
  );
}
