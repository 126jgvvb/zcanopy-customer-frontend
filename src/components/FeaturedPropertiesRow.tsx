"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { webApi } from "@/lib/api";

type Listing = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  brokerBrandName: string;
  price?: number;
  isAvailable: boolean;
  image: string;
};

const PLACEHOLDER = "https://picsum.photos/seed/zcanopy/800/600";
const FETCH_LIMIT = 12;
const CARD_WIDTH = 344; // 320px card + 24px gap
const BASE_SPEED = 0.035; // px per ms
const CLICK_STEP = CARD_WIDTH * 2;
const HOLD_INTERVAL = 55;

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

function toListings(properties: any[]): Listing[] {
  const seen = new Set<string>();
  const out: Listing[] = [];

  for (const p of properties) {
    const id = String(p?.id ?? out.length);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      title: p?.title ?? "Featured property",
      location: p?.location ?? "",
      propertyType: p?.propertyType ?? "",
      brokerBrandName: p?.brokerBrandName ?? "",
      price: typeof p?.price === "number" ? p.price : undefined,
      isAvailable: p?.isAvailable !== false,
      image: Array.isArray(p?.imageUrl) && p.imageUrl.length ? p.imageUrl[0] : PLACEHOLDER,
    });
  }

  return out;
}

function PropertyCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/properties/${listing.id}`}
      className="surface-card group block w-[280px] shrink-0 overflow-hidden sm:w-[320px]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white/92 px-3.5 py-1.5 text-xs font-semibold text-[var(--zcanopy-card-brown)] shadow-sm backdrop-blur-sm">
          {listing.isAvailable ? "Available" : "Booked"}
        </span>
        {listing.propertyType && (
          <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {listing.propertyType}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3
          className="line-clamp-2 font-display text-xl leading-snug"
          style={{ color: COLORS.cardBrown }}
        >
          {listing.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{listing.location}</span>
          </span>
          {formatUGX(listing.price) && (
            <span className="font-display text-lg" style={{ color: COLORS.primary }}>
              {formatUGX(listing.price)}
            </span>
          )}
        </div>

        {listing.brokerBrandName && (
          <p className="mt-2 truncate text-sm text-gray-500">
            <span className="font-medium text-gray-600">Broker:</span> {listing.brokerBrandName}
          </p>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="surface-card w-[280px] shrink-0 overflow-hidden sm:w-[320px]">
      <div className="aspect-[4/3] w-full animate-pulse bg-gray-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function FeaturedPropertiesRow() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    webApi
      .publicProperties({ page: 1, limit: FETCH_LIMIT })
      .then((res) => {
        if (!active) return;
        const mapped = toListings(res?.properties ?? []);
        if (mapped.length) {
          setListings(mapped);
          return;
        }
        return webApi
          .featuredProperties(6)
          .then((fallback) => {
            if (active) setListings(toListings(fallback?.properties ?? []));
          })
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Repeat the set a few times so there is always somewhere to scroll to.
  const cards = useMemo(() => {
    if (!listings.length) return [];
    return [...listings, ...listings, ...listings];
  }, [listings]);

  // Auto-scroll loop.
  useEffect(() => {
    if (!loaded || !cards.length) return;
    let frame = 0;

    const tick = () => {
      const el = trackRef.current;
      if (el) {
        if (!pausedRef.current) offsetRef.current += BASE_SPEED;

        const max = el.scrollWidth - el.clientWidth;
        // Wrap once we run past the end; content is identical, so it is seamless.
        if (offsetRef.current >= max) offsetRef.current = 0;
        if (offsetRef.current < 0) offsetRef.current = max;

        el.scrollLeft = offsetRef.current;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loaded, cards.length]);

  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    const next = offsetRef.current + direction * CLICK_STEP;
    offsetRef.current = next > max ? 0 : next < 0 ? max : next;
    el.scrollLeft = offsetRef.current;
  }, []);

  const stopHold = useCallback(() => {
    if (holdRef.current !== null) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  const startHold = useCallback(
    (direction: 1 | -1) => {
      scrollBy(direction);
      stopHold();
      holdRef.current = setInterval(() => scrollBy(direction), HOLD_INTERVAL);
    },
    [scrollBy, stopHold],
  );

  useEffect(() => stopHold, [stopHold]);

  const pause = () => {
    const el = trackRef.current;
    if (el) offsetRef.current = el.scrollLeft;
    pausedRef.current = true;
  };

  const resume = () => {
    const el = trackRef.current;
    if (el) offsetRef.current = el.scrollLeft;
    pausedRef.current = false;
  };

  const controls =
    loaded && listings.length > 0 ? (
      <>
        <button
          type="button"
          aria-label="Scroll properties left"
          title="Scroll left"
          className="marquee-arrow marquee-arrow-prev"
          onPointerDown={(e) => {
            e.preventDefault();
            startHold(-1);
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Scroll properties right"
          title="Scroll right"
          className="marquee-arrow marquee-arrow-next"
          onPointerDown={(e) => {
            e.preventDefault();
            startHold(1);
          }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <ArrowRight size={18} />
        </button>
      </>
    ) : null;

  if (!loaded) {
    return (
      <div className="mt-12 flex gap-6 overflow-hidden px-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="mt-12 flex gap-6 overflow-hidden px-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-card w-[280px] shrink-0 overflow-hidden sm:w-[320px]">
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
              <img src={PLACEHOLDER} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl" style={{ color: COLORS.cardBrown }}>
                Featured property
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin size={14} />
                Uganda
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="marquee mt-12"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="marquee-track" ref={trackRef}>
        {cards.map((l, i) => (
          <PropertyCard key={`${l.id}-${i}`} listing={l} />
        ))}
      </div>
      {controls}
    </div>
  );
}
