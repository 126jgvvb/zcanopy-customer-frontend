"use client";

import { useEffect, useRef, useState } from "react";
import { webApi, getSessionId } from "@/lib/api";
import type { Property } from "@/app/properties/page";

export default function PropertyVideoReel({ initialProperties = [], onClose }: { initialProperties?: Property[]; onClose?: () => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [index, setIndex] = useState(0);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

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
          return (
            <div
              key={property.id || `${property.title}-${idx}`}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="relative h-screen w-full snap-start"
            >
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
                className="absolute inset-0 h-full w-full object-cover"
                controls={false}
                playsInline
                muted={muted}
                loop
                preload={idx === index ? "auto" : "metadata"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs uppercase tracking-wider text-white/75">{property.location || "Property"}</p>
                <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{property.title}</h3>
                {property.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{property.description}</p>
                )}
                {property.price !== undefined && (
                  <p className="mt-2 text-lg font-semibold">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(property.price)}
                  </p>
                )}
              </div>

              <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 sm:bottom-8 sm:right-8">
                <button
                  type="button"
                  onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={idx === 0}
                  className="pointer-events-auto rounded-full bg-white/10 p-3 backdrop-blur-md hover:bg-white/20 disabled:opacity-40"
                >
                  ↑
                </button>
                <span className="text-xs font-semibold text-white/90">
                  {remainingUp > 0 && <span className="mr-1 text-white/70">↑{remainingUp}</span>}
                  {idx + 1} / {properties.length}
                  {remainingDown > 0 && <span className="ml-1 text-white/70">↓{remainingDown}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setIndex((prev) => Math.min(prev + 1, properties.length - 1))}
                  disabled={idx === properties.length - 1}
                  className="pointer-events-auto rounded-full bg-white/10 p-3 backdrop-blur-md hover:bg-white/20 disabled:opacity-40"
                >
                  ↓
                </button>
              </div>

              <div className="absolute left-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePlay(property)}
                  className="pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20"
                >
                  {muted ? "Unmute" : "Mute"}
                </button>
              </div>

              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(property)}
                  className={`pointer-events-auto rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-md hover:bg-white/20 ${favorites.has(id) ? "bg-white/20 text-white" : "bg-white/10 text-white"}`}
                >
                  {favorites.has(id) ? "Favorited" : "Favorite"}
                </button>
                <a
                  href={`/properties/${property.id}`}
                  className="pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20"
                >
                  View property
                </a>
              </div>

              <div className="absolute left-4 top-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20"
                >
                  ← Back to properties
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
