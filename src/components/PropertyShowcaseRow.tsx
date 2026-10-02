"use client";

import Link from "next/link";
import { MapPin, Building2, CheckCircle2, Store, ArrowUpRight } from "lucide-react";
import { COLORS } from "@/lib/theme";

export interface ShowcaseProperty {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  imageUrl?: string[];
  brokerBrandName?: string;
  price?: number;
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/zcanopy/1600/700";

function formatUGX(n?: number): string | null {
  if (n === undefined || n === null || Number.isNaN(n)) return null;
  try {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

/** Within 30 days of upload counts as a new listing. */
function isNewListing(createdAt?: string): boolean {
  if (!createdAt) return false;
  const ts = Date.parse(createdAt);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < 30 * 24 * 60 * 60 * 1000;
}

export default function PropertyShowcaseRow({ property }: { property: ShowcaseProperty }) {
  const image =
    Array.isArray(property.imageUrl) && property.imageUrl.length
      ? property.imageUrl[0]
      : FALLBACK_IMAGE;

  const price = formatUGX(property.price);
  const badge = isNewListing(property.createdAt)
    ? "New Listing"
    : property.isAvailable
      ? "Available"
      : "Booked";

  // Real fields only — the listing payload carries no bed/bath/size data.
  const chips = [
    property.propertyType ? { icon: Building2, label: property.propertyType } : null,
    {
      icon: CheckCircle2,
      label: property.isAvailable ? "Available" : "Booked",
    },
    property.brokerBrandName ? { icon: Store, label: property.brokerBrandName } : null,
  ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string }>;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group relative block overflow-hidden shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Blurred backdrop fills the letterbox left by object-contain, so the row
          still reads as full-bleed without cropping the photo. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
      />
      <img
        src={image}
        alt={property.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

      <div className="relative flex min-h-[340px] flex-col justify-between p-6 sm:min-h-[400px] sm:p-8">
        {/* Top: location + badge */}
        <div className="flex items-start justify-between gap-4">
          {property.location && (
            <span className="flex items-center gap-1.5 text-sm text-white/85">
              <MapPin size={14} className="shrink-0" />
              {property.location}
            </span>
          )}
          <span className="shrink-0 rounded-sm bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-sm">
            {badge}
          </span>
        </div>

        {/* Middle: title, description, chips */}
        <div className="max-w-xl">
          <h3 className="font-sans text-3xl font-bold uppercase leading-none tracking-tight text-white sm:text-4xl">
            {property.title}
          </h3>
          {property.description && (
            <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-white/80">
              {property.description}
            </p>
          )}

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 rounded-sm bg-white/92 px-2.5 py-1.5 text-xs font-medium text-gray-700"
                >
                  <Icon size={13} />
                  <span className="max-w-[10rem] truncate">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom: price + CTA */}
        <div className="flex items-end justify-between gap-4">
          {price && (
            <p className="font-display text-2xl italic text-white sm:text-3xl">from {price}</p>
          )}
          <span
            className="group/btn inline-flex shrink-0 items-center gap-2 rounded-sm bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{ color: COLORS.primary }}
          >
            View Property
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
