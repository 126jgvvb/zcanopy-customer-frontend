"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, ChevronDown, UserRound, Briefcase, Building2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { BROKER_LOGIN_URL, BROKER_SIGNUP_URL } from "@/lib/navigation";

const ACCOUNT_LINKS = [
  { label: "Customer Login", href: "/customer", Icon: UserRound },
  { label: "Broker Login", href: BROKER_LOGIN_URL, Icon: Briefcase },
  { label: "Become a Broker", href: BROKER_SIGNUP_URL, Icon: Building2 },
];

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("//");
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="ZCanopy"
              className="h-9 w-9 object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            <span
              className="font-display text-xl tracking-tight"
              style={{ color: "var(--zcanopy-card-brown)" }}
            >
              ZCanopy
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/properties" className="nav-link">
              Properties
            </Link>
            <Link href="/customer" className="nav-link">
              Customer
            </Link>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#how" className="nav-link">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="btn-primary btn-glow hidden px-4 py-2 text-sm sm:inline-flex"
            >
              Browse Properties
            </Link>

            {/* Account: sign in as a customer or a broker */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account"
                title="Account"
                className="flex h-10 items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3 text-[var(--zcanopy-card-brown)] transition-colors duration-200 hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
              >
                <User size={18} />
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--zcanopy-surface)] py-1.5 shadow-[var(--shadow-lift)]"
                >
                  <p className="px-4 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Sign in as
                  </p>
                  {ACCOUNT_LINKS.map(({ label, href, Icon }) => {
                    const itemClass =
                      "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--zcanopy-card-brown)] transition-colors hover:bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_12%,transparent)] hover:text-[var(--zcanopy-primary)]";
                    const content = (
                      <>
                        <Icon size={16} style={{ color: "var(--zcanopy-primary)" }} />
                        {label}
                      </>
                    );

                    return isExternal(href) ? (
                      <a
                        key={label}
                        role="menuitem"
                        href={href}
                        className={itemClass}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        key={label}
                        role="menuitem"
                        href={href}
                        className={itemClass}
                        onClick={() => setMenuOpen(false)}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
