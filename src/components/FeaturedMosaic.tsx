"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { webApi } from "@/lib/api";

type RawProperty = {
  id?: string | number;
  title?: string;
  location?: string;
  imageUrl?: string[];
};

type Card = {
  /**
   * Unique per grid cell. `id` is the property id and repeats when one
   * property's gallery fills more than one cell, so keys must not use it.
   */
  key: string;
  id: string;
  title: string;
  location: string;
  images: string[];
};

const PLACEHOLDER = "https://picsum.photos/seed/zcanopy/900/700";
const FETCH_LIMIT = 12;
const CELLS = 4;
const FACES_PER_CARD = 4;

type Axis = "v" | "h";

/** Tall card = vertical flip, stacked card = horizontal flip. */
function MosaicCard({
  card,
  axis,
  delay,
  className,
}: {
  card: Card;
  axis: Axis;
  delay: number;
  className?: string;
}) {
  const transform = axis === "v" ? "rotateX" : "rotateY";

  return (
    <Link
      href={`/properties/${card.id}`}
      className={`flip-perspective group relative block overflow-hidden ${className ?? ""}`}
    >
      <div
        className={`flip-stage ${axis === "v" ? "flip-v" : "flip-h"}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {card.images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="flip-face"
            style={{ transform: `${transform}(${i * 180}deg)` }}
          >
            <img
              src={src}
              alt={card.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-display text-lg leading-snug text-white">{card.title}</p>
          {card.location && (
            <p className="mt-0.5 truncate text-sm text-white/70">{card.location}</p>
          )}
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/45 text-white transition-colors group-hover:bg-white group-hover:text-[var(--zcanopy-primary)]"
          style={{ transitionProperty: "background-color, color, border-color" }}
        >
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function PlaceholderCard({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className ?? ""}`}>
      <img src={PLACEHOLDER} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export default function FeaturedMosaic() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    webApi
      .publicProperties({ page: 1, limit: FETCH_LIMIT })
      .then((res) => {
        if (!active) return;
        const props: RawProperty[] = res?.properties ?? [];
        const pool = Array.from(
          new Set(props.flatMap((p) => (p.imageUrl ?? []).filter(Boolean))),
        );

        // One entry per (property, photo) pair, so a property with a gallery can
        // fill more than one grid cell instead of leaving cells empty.
        const entries = props.flatMap((p) =>
          (p.imageUrl ?? []).filter(Boolean).map((lead) => ({ p, lead })),
        );

        if (!entries.length) {
          setCards([]);
          return;
        }

        // Always fill all four cells; cycle entries when there are fewer.
        const cells = Array.from({ length: CELLS }, (_, i) => entries[i % entries.length]);

        setCards(
          cells.map(({ p, lead }, i) => {
            const own = (p.imageUrl ?? []).filter(Boolean);
            const images: string[] = [];
            // Lead photo first, then the rest of this property's gallery, then
            // the wider pool, so every card has enough faces to animate.
            for (const src of [lead, ...own, ...pool]) {
              if (!images.includes(src)) images.push(src);
            }
            // Fewer than four distinct photos in exist: repeat so the prism
            // still has four faces and keeps turning.
            while (images.length < FACES_PER_CARD) images.push(images[i % images.length]);

            return {
              key: `${p.id ?? i}-${lead}`,
              id: String(p.id ?? i),
              title: p.title ?? "Featured property",
              location: p.location ?? "",
              images: images.slice(0, FACES_PER_CARD),
            };
          }),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Left and right columns run the same vertical flip out of phase.
  const layout = useMemo(
    () =>
      [
        { axis: "v" as Axis, delay: 0, className: "col-start-1 row-span-2" },
        { axis: "h" as Axis, delay: 0, className: "col-start-2 row-start-1" },
        { axis: "h" as Axis, delay: -3.5, className: "col-start-2 row-start-2" },
        { axis: "v" as Axis, delay: -7, className: "col-start-3 row-span-2" },
      ].map((slot, i) => ({ ...slot, card: cards[i] })),
    [cards],
  );

  const gridClass =
    "grid h-[440px] grid-cols-3 grid-rows-2 gap-3 sm:h-[520px] sm:gap-4 lg:h-[560px]";

  if (!loaded) {
    return (
      <div className={gridClass}>
        <PlaceholderCard className="col-start-1 row-span-2" />
        <PlaceholderCard className="col-start-2 row-start-1" />
        <PlaceholderCard className="col-start-2 row-start-2" />
        <PlaceholderCard className="col-start-3 row-span-2" />
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className={gridClass}>
        <PlaceholderCard className="col-start-1 row-span-2" />
        <PlaceholderCard className="col-start-2 row-start-1" />
        <PlaceholderCard className="col-start-2 row-start-2" />
        <PlaceholderCard className="col-start-3 row-span-2" />
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {layout.map(({ card, axis, delay, className }, i) =>
        card ? (
          <MosaicCard
            key={card.key}
            card={card}
            axis={axis}
            delay={delay}
            className={className}
          />
        ) : (
          <PlaceholderCard key={`empty-${i}`} className={className} />
        ),
      )}
    </div>
  );
}
