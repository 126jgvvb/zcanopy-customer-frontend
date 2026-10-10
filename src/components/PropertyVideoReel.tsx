"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp, Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { webApi, getSessionId } from "@/lib/api";
import type { Property } from "@/app/properties/page";

export default function PropertyVideoReel({ initialProperties = [], onClose }: { initialProperties?: Property[]; onClose?: () => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [index, setIndex] = useState(0);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await webApi.customer.videoTours({ limit: 50 });
        const items = (data as any)?.properties || [];
        const withVideo = items.filter((p: any) => Array.isArray(p.videoUrl) && p.videoUrl.length > 0);
        if (!cancelled) {
          setProperties(withVideo);
          setPlayingMap((prev) => {
            const next: Record<string, boolean> = { ...prev };
            withVideo.forEach((p: any) => {
              if (next[p.id] === undefined) next[p.id] = true;
            });
            return next;
          });
        }
      } catch {
        if (!cancelled) {
          setProperties([]);
        }
      }
    };

    if (initialProperties.length > 0) {
      const withVideo = initialProperties.filter((p) => Array.isArray(p.videoUrl) && p.videoUrl.length > 0);
      setProperties(withVideo);
      setPlayingMap((prev) => {
        const next: Record<string, boolean> = { ...prev };
        withVideo.forEach((p) => {
          if (next[p.id] === undefined) next[p.id] = true;
        });
        return next;
      });
    } else {
      load();
    }
  }, [initialProperties]);

  useEffect(() => {
    const token = getSessionId();
    if (!token) return;
    let cancelled = false;
    const loadFavorites = async () => {
      try {
        const data = await webApi.getCustomerFavorites(token, 1, 200);
        const items = (data as any)?.favorites || [];
        if (!cancelled) {
          setFavorites(new Set(items.map((item: any) => String(item.propertyId || item.id))));
        }
      } catch {
        if (!cancelled) {
          setFavorites(new Set());
        }
      }
    };
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const items = itemRefs.current.filter(Boolean);
      if (!items.length) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closest = 0;
      let closestDistance = Infinity;
      items.forEach((el, idx) => {
        const rect = el!.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = idx;
        }
      });

      setIndex(closest);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const resetIdle = () => {
      setShowControls(true);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", resetIdle);
    resetIdle();

    return () => {
      container.removeEventListener("mousemove", resetIdle);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !itemRefs.current[index]) return;
    itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [index]);

  useEffect(() => {
    const activeId = properties[index]?.id;
    if (!activeId) return;

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === String(activeId)) {
        if (playingMap[id]) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      } else {
        video.pause();
      }
    });
  }, [index, properties, playingMap]);

  const togglePlay = (property: Property) => {
    const id = String(property.id);
    setPlayingMap((prev) => {
      const next = { ...prev };
      const newValue = !prev[id];
      next[id] = newValue;
      return next;
    });
    const video = videoRefs.current[id];
    if (!video) return;
    if (playingMap[id] === false) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = nextMuted;
    });
  };

  const toggleFavorite = async (property: Property) => {
    const token = getSessionId();
    if (!token) {
      window.location.href = "/customer";
      return;
    }
    const id = String(property.id);
    setFavorites((prev) => {
      const next = new Set(prev);
      const willFavorite = !next.has(id);
      next[willFavorite ? "add" : "delete"](id);
      return next;
    });
    try {
      await webApi.toggleFavorite(token, {
        propertyId: id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        brokerCode: property.brokerCode,
        imageUrl: property.imageUrl?.[0],
        price: property.price,
      });
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const preloadAdjacent = (currentIdx: number) => {
    const indices = [currentIdx - 1, currentIdx + 1];
    indices.forEach((idx) => {
      if (idx < 0 || idx >= properties.length) return;
      const property = properties[idx];
      const video = videoRefs.current[String(property.id)];
      if (video && property.videoUrl?.[0]) {
        video.preload = "auto";
        video.load();
      }
    });
  };

  const chrome = `pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-black/45 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div
        ref={containerRef}
        className="h-screen w-full snap-y snap-mandatory overflow-y-auto scroll-smooth"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {properties.map((property, idx) => {
          const id = String(property.id);
          const isPlaying = playingMap[id] !== false;
          const image =
            Array.isArray(property.imageUrl) && property.imageUrl.length
              ? property.imageUrl[0]
              : "https://picsum.photos/seed/zcanopy/1600/700";
          const favorited = favorites.has(id);

          return (
            <div
              key={property.id || `${property.title}-${idx}`}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="relative h-screen w-full snap-start"
            >
              <div className="absolute inset-0">
                {property.imageUrl?.[0] ? (
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full scale-110 object-cover opacity-45 blur-2xl"
                  />
                ) : null}
              </div>

              <video
                ref={(el) => {
                  videoRefs.current[id] = el;
                  if (el) {
                    if (isPlaying) {
                      el.play().catch(() => {});
                    }
                    el.muted = muted;
                    if (idx === index) {
                      preloadAdjacent(idx);
                    }
                  }
                }}
                src={property.videoUrl?.[0]}
                className="absolute left-1/2 top-1/2 h-full max-h-screen w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{ maxWidth: "100%" }}
                controls={false}
                playsInline
                muted={muted}
                loop
                preload={idx === index ? "auto" : "metadata"}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

              <div className="relative flex h-full flex-col justify-between p-4 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Back to properties"
                      onClick={onClose}
                      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/45"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted ? "Unmute" : "Mute"}
                      className={chrome}
                    >
                      {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      {muted ? "Unmute" : "Mute"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(property)}
                      aria-label={favorited ? "Remove favorite" : "Add favorite"}
                      className={`${chrome} ${favorited ? "border-[var(--zcanopy-accent-gold)]/50 text-[var(--zcanopy-accent-gold)]" : ""}`}
                    >
                      <Heart className="h-3.5 w-3.5" fill={favorited ? "currentColor" : "none"} />
                      {favorited ? "Saved" : "Save"}
                    </button>
                    <a
                      href={`/properties/${property.id}`}
                      className={`${chrome}`}
                    >
                      View property
                    </a>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => togglePlay(property)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={`reel-play pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-opacity duration-300 hover:bg-black/50 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />}
                  </button>
                </div>

                <div className="max-w-lg pr-24 sm:pr-28">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--zcanopy-accent-gold)]">
                    {property.propertyType || "Tour"}
                    {property.location ? ` · ${property.location}` : ""}
                  </p>
                  <h3 className="font-display mt-2 text-3xl leading-tight text-white sm:text-5xl">
                    {property.title}
                  </h3>
                  {property.price !== undefined && (
                    <p className="font-display mt-3 text-2xl text-[var(--zcanopy-accent-gold)]">
                      {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(property.price)}
                    </p>
                  )}
                  {property.description && (
                    <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-white/75">
                      {property.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 sm:bottom-8 sm:right-8">
                <button
                  type="button"
                  aria-label="Previous property"
                  onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={idx === 0}
                  className="pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:border-[var(--zcanopy-accent-gold)] hover:bg-black/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100"
                >
                  <ChevronUp className="h-6 w-6" strokeWidth={2} />
                </button>
                <span className="font-display text-sm text-white/90">
                  {String(idx + 1).padStart(2, "0")}
                  <span className="mx-1 text-white/40">/</span>
                  {String(properties.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label="Next property"
                  onClick={() => setIndex((prev) => Math.min(prev + 1, properties.length - 1))}
                  disabled={idx === properties.length - 1}
                  className="pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:border-[var(--zcanopy-accent-gold)] hover:bg-black/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100"
                >
                  <ChevronDown className="h-6 w-6" strokeWidth={2} />
                </button>
              </div>
            </div>
          );
        })}

        {!properties.length && (
          <div className="reel-empty flex h-screen w-full flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="font-display text-3xl text-white">No video tours yet</p>
            <p className="max-w-sm text-sm text-white/60">
              Listings with video will appear here as a full-screen reel.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--zcanopy-primary)]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to grid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
