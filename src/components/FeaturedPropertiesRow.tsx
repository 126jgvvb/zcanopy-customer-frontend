"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { webApi } from "@/lib/api";

type RawProperty = {
  id?: string | number;
  title?: string;
  location?: string;
  propertyType?: string;
  brokerBrandName?: string;
  price?: number;
  isAvailable?: boolean;
  imageUrl?: string[];
};

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

const PLACEHOLDER = "https://picsum.photos/seed/zcanopy/900/700";
const FETCH_LIMIT = 12;

// Card sizing lives in one place so the track, skeletons and fallbacks match.
const CARD_CLASS = "w-[300px] sm:w-[360px] lg:w-[420px]";
const SETS = 4; // identical copies rendered so the loop can wrap forever
const SPEED_PX_PER_SEC = 80; // auto-scroll speed
const HOLD_INTERVAL = 500; // ms between single-card steps while an arrow is held

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

function toListings(properties: RawProperty[]): Listing[] {
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
      className={`surface-card group block shrink-0 overflow-hidden ${CARD_CLASS}`}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-100">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 85vw, 420px"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white/92 px-4 py-1.5 text-sm font-semibold text-[var(--zcanopy-card-brown)] shadow-sm backdrop-blur-sm">
          {listing.isAvailable ? "Available" : "Booked"}
        </span>
        {listing.propertyType && (
          <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {listing.propertyType}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3
          className="line-clamp-2 font-display text-2xl leading-snug"
          style={{ color: COLORS.cardBrown }}
        >
          {listing.title}
        </h3>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-[15px] text-gray-500">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{listing.location}</span>
          </span>
          {formatUGX(listing.price) && (
            <span className="font-display text-xl" style={{ color: COLORS.primary }}>
              {formatUGX(listing.price)}
            </span>
          )}
        </div>

        {listing.brokerBrandName && (
          <p className="mt-2.5 truncate text-sm text-gray-500">
            <span className="font-medium text-gray-600">Broker:</span> {listing.brokerBrandName}
          </p>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className={`surface-card shrink-0 overflow-hidden ${CARD_CLASS}`}>
      <div className="aspect-[16/11] w-full animate-pulse bg-gray-100" />
      <div className="space-y-3 p-6">
        <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function FeaturedPropertiesRow({
  initialProperties = [],
}: {
  /** Listings rendered on the server - avoids a duplicate fetch on hydration. */
  initialProperties?: RawProperty[];
}) {
  const [listings, setListings] = useState<Listing[]>(() => toListings(initialProperties));
  const [loaded, setLoaded] = useState(() => initialProperties.length > 0);

  const runnerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const setWidthRef = useRef(0);
  const cardStepRef = useRef(0);
  const pausedRef = useRef(false);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialProperties.length > 0) return; // handled by the lazy initializer

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
  }, [initialProperties]);

  // Repeat the base list if it is too short to fill the viewport.
  const cards = useMemo(() => {
    if (!listings.length) return [];
    return listings.length >= 4 ? listings : [...listings, ...listings];
  }, [listings]);

  // Measure a single set so the loop can wrap on an exact content boundary,
  // and the card step (card width + gap) so the arrows advance one card.
  useEffect(() => {
    if (!loaded || !cards.length) return;
    const el = setRef.current;
    if (el) {
      setWidthRef.current = el.offsetWidth;
      const first = el.children[0] as HTMLElement | undefined;
      const gap = parseFloat(getComputedStyle(el).columnGap || "24") || 24;
      cardStepRef.current = first ? first.offsetWidth + gap : el.offsetWidth / cards.length;
      offsetRef.current = 0;
      if (runnerRef.current) runnerRef.current.style.transform = "translate3d(0,0,0)";
    }
  }, [loaded, cards.length]);

  const paint = useCallback(() => {
    const el = runnerRef.current;
    if (el) el.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  }, []);

  // Auto-scroll: advances every frame using elapsed time, so the speed is the
  // same on 60Hz and 120Hz displays. Offsets wrap on whole set boundaries,
  // which is invisible because every set is identical.
  useEffect(() => {
    if (!loaded || !cards.length) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;

      const setWidth = setWidthRef.current;
      if (setWidth > 0) {
        if (!pausedRef.current) {
          offsetRef.current += (SPEED_PX_PER_SEC * dt) / 1000;
          if (offsetRef.current >= setWidth) offsetRef.current -= setWidth;
          if (offsetRef.current < 0) offsetRef.current += setWidth;
        }
        paint();
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loaded, cards.length, paint]);

  /**
   * Advance the marquee by one card. Stepping by whole sets made the arrows
   * invisible — every set is an identical copy, so a whole-set jump looked
   * like nothing happened. Wraps on the set boundary so it stays seamless.
   */
  const jumpSteps = useCallback((direction: 1 | -1) => {
    const setWidth = setWidthRef.current;
    const step = cardStepRef.current || setWidth / Math.max(cards.length, 1);
    if (setWidth <= 0 || step <= 0) return;
    offsetRef.current += direction * step;
    offsetRef.current = ((offsetRef.current % setWidth) + setWidth) % setWidth;
    paint();
  }, [cards.length, paint]);

  const stopHold = useCallback(() => {
    if (holdRef.current !== null) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  const startHold = useCallback(
    (direction: 1 | -1) => {
      jumpSteps(direction);
      stopHold();
      holdRef.current = setInterval(() => jumpSteps(direction), HOLD_INTERVAL);
    },
    [jumpSteps, stopHold],
  );

  useEffect(() => () => stopHold(), [stopHold]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const staticRow = (node: React.ReactNode) => (
    <div className="mt-12 flex gap-6 overflow-hidden px-6">{node}</div>
  );

  if (!loaded) {
    return staticRow(
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </>,
    );
  }

  if (!listings.length) {
    return staticRow(
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`surface-card shrink-0 overflow-hidden ${CARD_CLASS}`}>
            <div className="aspect-[16/11] w-full overflow-hidden bg-gray-100">
              <Image src={PLACEHOLDER} alt="" fill sizes="(max-width: 768px) 85vw, 420px" className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl" style={{ color: COLORS.cardBrown }}>
                Featured property
              </h3>
              <p className="mt-3 flex items-center gap-1.5 text-[15px] text-gray-500">
                <MapPin size={15} />
                Uganda
              </p>
            </div>
          </div>
        ))}
      </>,
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
      <div className="marquee-viewport">
        <div className="marquee-runner" ref={runnerRef}>
          {Array.from({ length: SETS }, (_, s) => (
            <div
              key={s}
              ref={s === 0 ? setRef : undefined}
              aria-hidden={s > 0}
              className="marquee-set"
            >
              {cards.map((l, i) => (
                // `cards` repeats the list when it is too short to fill the
                // viewport, so listing ids repeat within a set. Index keeps the
                // key unique.
                <PropertyCard key={`${s}-${i}`} listing={l} />
              ))}
            </div>
          ))}
        </div>
      </div>

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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            jumpSteps(-1);
          }
        }}
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            jumpSteps(1);
          }
        }}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
