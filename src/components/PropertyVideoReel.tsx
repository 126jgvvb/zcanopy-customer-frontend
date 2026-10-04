"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
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

  const activeProperty = properties[index];
  const remainingUp = index;
  const remainingDown = properties.length - index - 1;

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

              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Back to properties"
                      onClick={onClose}
                      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-opacity duration-300 hover:bg-white/20 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      {muted ? "Unmute" : "Mute"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(property)}
                      className={`pointer-events-auto rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md transition-opacity duration-300 hover:bg-white/20 ${favorites.has(id) ? "bg-white/20 text-white" : "bg-white/10 text-white"} ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      {favorites.has(id) ? "Favorited" : "Favorite"}
                    </button>
                    <a
                      href={`/properties/${property.id}`}
                      className={`pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-opacity duration-300 hover:bg-white/20 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      View property
                    </a>
                  </div>
                </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => togglePlay(property)}
                  className={`pointer-events-auto rounded-full bg-white/10 p-5 backdrop-blur-md transition-opacity duration-300 hover:bg-white/20 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  )}
                </button>
              </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/75">{property.location || "Property"}</p>
                  <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{property.title}</h3>
                  {property.description && (
                    <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/80">
                      {property.description}
                    </p>
                  )}
                  {property.price !== undefined && (
                    <p className="mt-2 text-lg font-semibold">
                      {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(property.price)}
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
                  className="pointer-events-auto inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/40 p-0 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-black/40"
                >
                  <ChevronUp className="h-7 w-7" strokeWidth={2.25} />
                </button>
                <span className="text-xs font-semibold text-white/90">
                  {remainingUp > 0 && <span className="mr-1 text-white/70">↑{remainingUp}</span>}
                  {idx + 1} / {properties.length}
                  {remainingDown > 0 && <span className="ml-1 text-white/70">↓{remainingDown}</span>}
                </span>
                <button
                  type="button"
                  aria-label="Next property"
                  onClick={() => setIndex((prev) => Math.min(prev + 1, properties.length - 1))}
                  disabled={idx === properties.length - 1}
                  className="pointer-events-auto inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/40 p-0 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/60 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-black/40"
                >
                  <ChevronDown className="h-7 w-7" strokeWidth={2.25} />
                </button>
              </div>
            </div>
          );
        })}

        {!properties.length && (
          <div className="flex h-screen w-full items-center justify-center text-white">
            No video properties available.
          </div>
        )}
      </div>
    </div>
  );
}
