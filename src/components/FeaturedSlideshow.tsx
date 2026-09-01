"use client";

import { useEffect, useState } from "react";
import { webApi } from "@/lib/api";

type Slide = {
  title: string;
  tagline: string;
  broker: string;
  location: string;
  price: string;
  image: string;
};

const TAGLINES: Record<string, string> = {
  apartment: "Live where you love",
  villa: "Space to breathe",
  mansion: "Live like royalty",
  commercial: "Grow your business",
  land: "Build your legacy",
};

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `UGX ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (value >= 1_000) return `UGX ${Math.round(value / 1_000)}K`;
  return `UGX ${value}`;
}

type Property = {
  title?: string;
  tagline?: string;
  brokerBrandName?: string;
  location?: string;
  price?: number | string;
  imageUrl?: string[];
  propertyType?: string;
};

function toSlides(properties: Property[]): Slide[] {
  return properties.slice(0, 4).map((p) => ({
    title: p.title ?? "Featured property",
    tagline: TAGLINES[p.propertyType ?? ""] ?? "Find your next home",
    broker: p.brokerBrandName ?? "ZCanopy",
    location: p.location ?? "",
    price: typeof p.price === "number" ? formatPrice(p.price) : String(p.price ?? ""),
    image: Array.isArray(p.imageUrl) && p.imageUrl.length ? p.imageUrl[0] : "https://picsum.photos/seed/zcanopy/800/600",
  }));
}

export default function FeaturedSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    webApi
      .featuredProperties(4)
      .then((res) => {
        if (!active) return;
        const mapped = toSlides(res.properties ?? []);
        setSlides(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl bg-[var(--zcanopy-surface)] text-sm text-gray-400">
        Loading featured listings…
      </div>
    );
  }

  const go = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl">
      {slides.map((s, i) => (
        <div
          key={s.title}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.25) 100%), url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === index ? 1 : 0,
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          <div className="flex h-full flex-col justify-between p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                {s.broker}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                {s.location}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                {s.tagline}
              </p>
              <h3 className="mt-1 text-2xl font-bold leading-tight drop-shadow">
                {s.title}
              </h3>
              <p className="mt-2 text-lg font-bold text-white drop-shadow">{s.price}</p>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous listing"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next listing"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${s.title}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
