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
  const isNew = isNewListing(property.createdAt);
  const badge = isNew ? "New Listing" : property.isAvailable ? "Available" : "Booked";

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
      className="showcase-row group relative block overflow-hidden"
    >
      {/* Blurred backdrop fills the letterbox left by object-contain. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
      />
      <img
        src={image}
        alt={property.title}
        loading="lazy"
        className="showcase-photo absolute inset-0 h-full w-full object-contain"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

      <div className="relative flex min-h-[340px] flex-col justify-between p-6 sm:min-h-[420px] sm:p-10">
        <div className="flex items-start justify-between gap-4">
          {property.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
              <MapPin size={14} className="shrink-0" />
              {property.location}
            </span>
          )}
          <span
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md ${
              isNew
                ? "bg-[var(--zcanopy-accent-gold)] text-[#2a221c]"
                : property.isAvailable
                  ? "bg-white/90 text-emerald-800"
                  : "bg-red-50/90 text-red-700"
            }`}
          >
            {badge}
          </span>
        </div>

        <div className="max-w-2xl">
          {property.propertyType && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--zcanopy-accent-gold)]">
              {property.propertyType}
            </p>
          )}
          <h3 className="font-display mt-2 text-4xl leading-[1.05] text-[#d1a054] sm:text-5xl">
            {property.title}
          </h3>
          <span className="mt-4 block h-px w-16 bg-[var(--zcanopy-accent-gold)]" />
          {property.description && (
            <p className="mt-4 line-clamp-2 max-w-md text-sm leading-relaxed text-white/80">
              {property.description}
            </p>
          )}

          {chips.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-2">
              {chips.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md"
                >
                  <Icon size={13} />
                  <span className="max-w-[10rem] truncate">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          {price && (
            <p className="font-display text-2xl text-white sm:text-3xl">
              <span className="mr-2 text-sm font-sans font-medium uppercase tracking-[0.16em] text-white/55">
                from
              </span>
              {price}
            </p>
          )}
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5"
            style={{ color: COLORS.primary }}
          >
            View Property
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
