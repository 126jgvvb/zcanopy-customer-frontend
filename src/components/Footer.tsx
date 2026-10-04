"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { BROKER_LOGIN_URL } from "@/lib/navigation";

type IconProps = { size?: number };

function InstagramIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}


const CONTACT = {
  phone: "+256741882818",
  email: "support@zcanopy.com",
  location: "Kampala, Uganda",
};

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/#how" },
  { label: "How to make payments", href: "/payments" },
  { label: "Help", href: "/help" },
  { label: "Contact", href: "/#brokers" },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Privacy Policy", href: "/terms#privacy" },
  { label: "Terms of Agreement", href: "/terms" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedinIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="text-white/70"
      style={{ background: COLORS.scaffoldDark }}
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="ZCanopy" className="h-9 w-9 object-contain" />
              <span className="font-display text-xl tracking-tight" style={{ color: "#f6d98e" }}>
                ZCanopy
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Uganda&apos;s elegant property marketplace connecting verified brokers with clients.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin size={14} style={{ color: COLORS.accentGold }} />
                {CONTACT.location}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} style={{ color: COLORS.accentGold }} />
                <a href={`tel:${CONTACT.phone}`} className="transition-colors hover:text-white">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} style={{ color: COLORS.accentGold }} />
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Nav */}
          <nav className="lg:col-span-5">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="lg:col-span-3 lg:justify-self-end">
            <ul className="flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/50 hover:text-white"
                  >
                    <Icon size={16} />
                  </a>                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/brokers/signup"
                className="inline-block rounded-xl bg-white px-5 py-2.5 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{ color: COLORS.primary }}
              >
                Become a Broker
              </Link>
              <a
                href={BROKER_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl border border-white/25 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Broker Login
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>© {year} ZCanopy. All rights reserved.</p>
          <div className="flex gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
