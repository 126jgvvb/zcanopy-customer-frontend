import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { BROKER_SIGNUP_URL } from "@/lib/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZCanopy - Browse & Book Properties",
  description: "Browse verified properties from trusted brokers across Uganda and book directly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <header className="site-header sticky top-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-semibold shadow-sm"
                style={{ backgroundColor: "var(--zcanopy-accent-gold)", color: "var(--zcanopy-card-brown)" }}
              >
                Z
              </span>
              <span className="font-display text-xl tracking-tight" style={{ color: "var(--zcanopy-card-brown)" }}>
                ZCanopy
              </span>
            </Link>
            <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
              <a href="#properties" className="nav-link">Properties</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how" className="nav-link">How it works</a>
              <a href={BROKER_SIGNUP_URL} className="nav-link">For brokers</a>
              <Link href="/login" className="nav-link">Broker Login</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/properties" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">
                Browse Properties
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
