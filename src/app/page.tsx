import Link from "next/link";
import { COLORS } from "@/lib/theme";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-[var(--zcanopy-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white shadow"
              style={{ backgroundColor: COLORS.accentGold, color: COLORS.cardBrown }}
            >
              Z
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ color: COLORS.cardBrown }}>
              ZCanopy
            </span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
            <a href="#properties" className="hover:text-[var(--zcanopy-primary)]">Properties</a>
            <a href="#how" className="hover:text-[var(--zcanopy-primary)]">How it works</a>
          </nav>
          <div>
            <Link
              href="/properties"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </header>

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
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: `${COLORS.accentGold}22`, color: COLORS.primary }}
            >
              Real estate, reimagined
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: COLORS.cardBrown }}>
              Find your next home in Uganda.
            </h1>
            <p className="mt-5 max-w-lg text-base text-gray-600">
              Browse verified properties from trusted brokers, view details, and book directly — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.primary }}
              >
                Browse Properties
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div
              className="overflow-hidden rounded-3xl bg-[var(--zcanopy-surface)] p-3 shadow-2xl"
              style={{ border: `1px solid ${COLORS.accentGold}55` }}
            >
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
              <div className="h-[360px] items-center justify-center text-sm text-gray-400 flex">
                Start browsing to see listings
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="properties" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold" style={{ color: COLORS.cardBrown }}>Latest Properties</h2>
          <p className="mt-3 text-gray-600">Explore available homes, apartments, and land across Uganda.</p>
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/properties"
            className="inline-block rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
          >
            View all properties
          </Link>
        </div>
      </section>

      <section id="how" className="bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold" style={{ color: COLORS.cardBrown }}>How it works</h2>
            <p className="mt-3 text-gray-600">From browsing to booking in three simple steps.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Browse listings", d: "Search and filter properties by location, type, and price." },
              { n: "02", t: "Book a viewing", d: "Select a property and submit a booking request with your details." },
              { n: "03", t: "Connect with broker", d: "A verified broker will reach out to confirm and complete the process." },
            ].map((step) => (
              <div key={step.n} className="relative rounded-2xl border border-gray-100 bg-[var(--background)] p-6">
                <span className="text-4xl font-bold" style={{ color: `${COLORS.accentGold}` }}>{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold" style={{ color: COLORS.cardBrown }}>{step.t}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200/60 bg-[var(--zcanopy-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ZCanopy. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
