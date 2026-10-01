"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { webApi } from "@/lib/api";

const HERO_VIDEO =
  "https://zcanopy-properties-media.fra1.cdn.digitaloceanspaces.com/19722974-uhd_3840_2160_25fps.mp4";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=70";
const SLIDE_MS = 6000;

type Slide = {
  id: string;
  title: string;
  location: string;
  image: string;
};

function toSlides(properties: any[]): Slide[] {
  return properties
    .filter((p) => Array.isArray(p?.imageUrl) && p.imageUrl.length)
    .slice(0, 4)
    .map((p, i) => ({
      id: String(p.id ?? i),
      title: p.title ?? "",
      location: p.location ?? "",
      image: p.imageUrl[0],
    }));
}

export default function HeroShowcase({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    webApi
      .featuredProperties(4)
      .then((res) => {
        if (!active) return;
        const mapped = toSlides(res?.properties ?? []);
        if (mapped.length) setSlides(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const startedAt = Date.now();
    setProgress(0);
    const tick = setInterval(() => {
      const pct = ((Date.now() - startedAt) / SLIDE_MS) * 100;
      if (pct >= 100) {
        setIndex((i) => (i + 1) % slides.length);
        return;
      }
      setProgress(pct);
    }, 60);
    return () => clearInterval(tick);
  }, [index, slides.length]);

  const go = (i: number) => {
    if (!slides.length) return;
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  return (
    <section className="relative isolate min-h-[640px] overflow-hidden lg:min-h-[760px]">
      {/* Base video layer */}
      <div className="absolute inset-0 -z-20">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </div>

      {/* Featured-property slide layers */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-out"
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}

      {/* Legibility scrims */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/35" />

      <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col justify-end px-6 pb-14 pt-32 lg:min-h-[760px] lg:pb-16">
        {children}

        {slides.length > 1 && (
          <div className="mt-12 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${s.title || "listing " + (i + 1)}`}
                  className={`font-display text-sm tracking-wider transition-colors ${
                    i === index ? "text-white" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="h-px w-28 bg-white/25 sm:w-40">
              <div
                className="h-px transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%`, background: COLORS.accentGold }}
              />
            </div>

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous featured listing"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white/80 transition-colors hover:border-white hover:bg-white/10"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next featured listing"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white/80 transition-colors hover:border-white hover:bg-white/10"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
