"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { SESSION_ROLE_KEY } from "@/lib/api";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setRole(window.localStorage.getItem(SESSION_ROLE_KEY));
    }
  }, []);

  return (
    <>
      <header className="site-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="ZCanopy"
              className="h-9 w-9 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="font-display text-xl tracking-tight" style={{ color: "var(--zcanopy-card-brown)" }}>
              ZCanopy
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/properties" className="nav-link">Properties</Link>
            <Link href="/customer" className="nav-link">Customer</Link>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <a href="https://zcanopy-broker-web-dashbaord.vercel.app" className="nav-link">For brokers</a>
            <a href="https://zcanopy-broker-web-dashbaord.vercel.app" className="nav-link">Broker Login</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/properties" className="btn-primary btn-glow hidden px-4 py-2 text-sm sm:inline-flex">
              Browse Properties
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
