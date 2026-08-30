import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ZCanopy - Browse & Book Properties",
  description: "Browse verified properties from trusted brokers across Uganda and book directly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-[var(--zcanopy-surface)]/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white shadow"
                style={{ backgroundColor: "#D1A054", color: "#5D4037" }}
              >
                Z
              </span>
              <span className="text-lg font-bold tracking-tight" style={{ color: "#5D4037" }}>
                ZCanopy
              </span>
            </div>
            <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
              <a href="#properties" className="hover:text-[var(--zcanopy-primary)]">Properties</a>
              <a href="#features" className="hover:text-[var(--zcanopy-primary)]">Features</a>
              <a href="#how" className="hover:text-[var(--zcanopy-primary)]">How it works</a>
              <a href={BROKER_SIGNUP_URL} className="hover:text-[var(--zcanopy-primary)]">For brokers</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/properties"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 sm:inline-block"
                style={{ backgroundColor: "#A9710E" }}
              >
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
