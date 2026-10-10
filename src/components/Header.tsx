"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, PlayCircle, Heart, Sparkles, User, ChevronDown, UserRound, Briefcase } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useSearchWizard } from "@/contexts/searchWizard";
import { BROKER_LOGIN_URL } from "@/lib/navigation";

const navLinks = [
  { href: "/properties", label: "Explore", icon: Compass },
  { href: "/reels", label: "Reels", icon: PlayCircle },
  { href: "/properties/favorites", label: "Saved", icon: Heart },
];

const ACCOUNT_LINKS = [
  { label: "Customer Login", href: "/customer", Icon: UserRound },
  { label: "Broker Login", href: BROKER_LOGIN_URL, Icon: Briefcase },
];

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("//");
}

export default function Header() {
  const pathname = usePathname();
  const { openWizard } = useSearchWizard();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/properties") return pathname === "/properties";
    if (href === "/properties/favorites") return pathname.startsWith("/properties/favorites");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="ZCanopy home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)]">
          <img src="/logo.svg" alt="ZCanopy" className="site-logo h-9 w-9 object-contain" />
          <span className="font-display hidden text-xl tracking-tight text-[var(--zcanopy-card-brown)] sm:inline">
            ZCanopy
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)] ${
                  active
                    ? "bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_20%,transparent)] text-[var(--zcanopy-primary)]"
                    : "text-[var(--zcanopy-muted)] hover:text-[var(--zcanopy-card-brown)]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openWizard}
          className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-[#bc8120] to-[var(--zcanopy-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:brightness-105 md:inline-flex"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="hidden lg:inline">Guided search</span>
          <span className="lg:hidden">Search</span>
        </button>

        {/* Account dropdown */}
        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-label="Sign in"
            title="Sign in"
            className="flex h-10 items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3 text-[var(--zcanopy-card-brown)] transition-colors duration-200 hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
          >
            <User size={18} />
            <ChevronDown
              size={14}
              className={`hidden transition-transform duration-200 sm:block ${accountOpen ? "rotate-180" : ""}`}
            />
          </button>

          {accountOpen && (
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
                    onClick={() => setAccountOpen(false)}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={label}
                    role="menuitem"
                    href={href}
                    className={itemClass}
                    onClick={() => setAccountOpen(false)}
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
    </header>
  );
}