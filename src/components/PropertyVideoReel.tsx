"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
  Pause,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { webApi, getSessionId } from "@/lib/api";
import { fetchExploreProperties } from "@/lib/exploreProperties";
import type { Property } from "@/app/properties/page";

function formatUGX(n: number) {
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

export default function PropertyVideoReel({ initialProperties = [], onClose }: { initialProperties?: Property[]; onClose?: () => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [index, setIndex] = useState(0);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [videoIndexMap, setVideoIndexMap] = useState<Record<string, number>>({});
  const [timeMap, setTimeMap] = useState<Record<string, { current: number; duration: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const prevIndexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const items = (await fetchExploreProperties(1, 50)).properties;
        const withVideo = items.filter((p) => Array.isArray(p.videoUrl) && p.videoUrl.length > 0);
        if (!cancelled) {
          setProperties(withVideo);
          setPlayingMap((prev) => {
            const next: Record<string, boolean> = { ...prev };
            withVideo.forEach((p) => {
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
        const data = await webApi.getCustomerFavorites(token, 1, 200, { skipAuthRedirect: true });
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

    if (prevIndexRef.current !== index) {
      prevIndexRef.current = index;
      setVideoIndexMap((prev) => ({ ...prev, [String(activeId)]: 0 }));
      setTimeMap((prev) => {
        const next = { ...prev };
        delete next[String(activeId)];
        return next;
      });
    }

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
  }, [index, properties, playingMap, videoIndexMap]);

  const handleTimeUpdate = (property: Property) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const id = String(property.id);
    setTimeMap((prev) => ({
      ...prev,
      [id]: { current: video.currentTime || 0, duration: video.duration || 0 },
    }));
  };

  const handleEnded = (property: Property) => {
    const id = String(property.id);
    const videos = property.videoUrl || [];
    if (videos.length <= 1) return;
    setVideoIndexMap((prev) => {
      const cur = prev[id] ?? 0;
      return { ...prev, [id]: (cur + 1) % videos.length };
    });
    setTimeMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const togglePlay = (property: Property) => {
    const id = String(property.id);
    const nextValue = !playingMap[id];
    setPlayingMap((prev) => ({ ...prev, [id]: nextValue }));
    const video = videoRefs.current[id];
    if (!video) return;
    if (nextValue) {
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

  const shareProperty = async (property: Property) => {
    const url = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text: property.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(String(property.id));
        window.setTimeout(() => setCopiedId(null), 1800);
      } catch {
        /* clipboard unavailable */
      }
    }
  };

  const toggleFavorite = async (property: Property) => {
    const token = getSessionId();
    if (!token) {
      window.location.href = "/customer";
      return;
    }
    const id = String(property.id);
    const prev = favorites.has(id);
    setFavorites((prevSet) => {
      const next = new Set(prevSet);
      if (prev) next.delete(id);
      else next.add(id);
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
      setFavorites((prevSet) => {
        const next = new Set(prevSet);
        if (prev) next.add(id);
        else next.delete(id);
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

  const step = (dir: 1 | -1) => {
    const root = containerRef.current;
    if (root) root.scrollBy({ top: dir * root.clientHeight, behavior: "smooth" });
  };

  const railButton =
    "flex h-11 w-11 items-center justify-center rounded-full bg-ink/60 backdrop-blur transition-transform duration-150 ease-out active:scale-90";

  return (
    <main className="relative overflow-hidden bg-ink" style={{ height: "100dvh" }}>
      <h1 className="sr-only">Property reels</h1>

      <div ref={containerRef} className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-none">
        {properties.map((property, idx) => {
          const id = String(property.id);
          const isPlaying = playingMap[id] !== false;
          const favorited = favorites.has(id);
          const image =
            Array.isArray(property.imageUrl) && property.imageUrl.length ? property.imageUrl[0] : null;
          const price = property.price !== undefined ? formatUGX(property.price) : null;
          const videos = property.videoUrl || [];
          const currentVideoIndex = Math.min(videoIndexMap[id] ?? 0, Math.max(videos.length - 1, 0));

          return (
            <section
              key={property.id || `${property.title}-${idx}`}
              data-id={id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              className="relative flex h-full items-center justify-center"
            >
              <div className="relative h-full w-full overflow-hidden bg-black sm:aspect-[9/16] sm:w-auto sm:rounded-3xl">
                {image && (
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                  />
                )}

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
                  src={videos[currentVideoIndex]}
                  className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                  controls={false}
                  playsInline
                  muted={muted}
                  loop={videos.length <= 1}
                  onTimeUpdate={handleTimeUpdate(property)}
                  onEnded={() => handleEnded(property)}
                  preload={idx === index ? "auto" : "metadata"}
                  onClick={() => togglePlay(property)}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />

                <div className="pointer-events-none absolute inset-x-0 top-0 flex gap-1 p-3" aria-hidden="true">
                  {videos.map((_video, vi) => {
                    const done = vi < currentVideoIndex;
                    const active = vi === currentVideoIndex;
                    const { current, duration } = timeMap[id] ?? { current: 0, duration: 0 };
                    const pct = done ? 100 : active && duration > 0 ? (current / duration) * 100 : 0;
                    return (
                      <div
                        key={vi}
                        className={`h-1 flex-1 overflow-hidden rounded-full ${done ? "bg-white/80" : "bg-white/25"}`}
                      >
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${pct}%`, transition: done ? "none" : "width 0.12s linear" }}
                        />
                      </div>
                    );
                  })}
                </div>

                <span className="pointer-events-none absolute left-3 top-6 rounded-full bg-ink/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {property.propertyType || "Video tour"}
                </span>

                <button
                  type="button"
                  onClick={() => togglePlay(property)}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-ink/45 text-white backdrop-blur-md transition hover:bg-ink/60"
                >
                  {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />}
                </button>

                <div className="absolute bottom-40 right-3 flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-1 text-xs font-medium text-white">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(property)}
                      aria-pressed={favorited}
                      aria-label={favorited ? "Remove from saved" : "Save home"}
                      className={railButton}
                    >
                      <Heart
                        className="h-5 w-5"
                        fill={favorited ? "currentColor" : "none"}
                        style={favorited ? { color: "var(--zcanopy-accent-gold)" } : undefined}
                      />
                    </button>
                    {favorited ? "Saved" : "Save"}
                  </div>
                  <div className="flex flex-col items-center gap-1 text-xs font-medium text-white">
                    <button type="button" onClick={() => shareProperty(property)} aria-label="Share home" className={railButton}>
                      {copiedId === id ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                    </button>
                    {copiedId === id ? "Copied" : "Share"}
                  </div>
                  <div className="flex flex-col items-center gap-1 text-xs font-medium text-white">
                    <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={railButton}>
                      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    {muted ? "Sound" : "Muted"}
                  </div>
                  <a
                    href={`/properties/${property.id}`}
                    aria-label="View details"
                    className="flex flex-col items-center gap-1 text-xs font-medium text-white"
                  >
                    <span className={railButton}>
                      <Info className="h-5 w-5" />
                    </span>
                    Details
                  </a>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/70 p-4 backdrop-blur-sm">
                  <div className="flex items-baseline gap-2">
                    {price && <p className="text-2xl font-semibold text-white">{price}</p>}
                    <span className="text-xs font-medium text-white/70">{property.isAvailable ? "Available" : "Booked"}</span>
                  </div>
                  <h2 className="font-display mt-1 text-lg text-white">{property.title}</h2>
                  <p className="mt-0.5 text-sm text-white/75">
                    {property.propertyType} · {property.location}
                  </p>
                  {property.description && (
                    <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-white/75">
                      {property.description}
                    </p>
                  )}
                  <a
                    href={`/properties/${property.id}`}
                    className="pointer-events-auto relative mt-3 flex w-full items-center justify-center rounded-full bg-gold py-2.5 text-sm font-semibold text-gold-ink transition-colors duration-150 hover:bg-[#D8B23A] lg:hidden"
                  >
                    View property
                  </a>
                </div>
              </div>
            </section>
          );
        })}

        {!properties.length && (
          <div className="reel-empty flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="font-display text-3xl text-white">No video tours yet</p>
            <p className="max-w-sm text-sm text-white/60">
              Listings with video will appear here as a full-screen reel.
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--zcanopy-primary)]"
              >
                Back to grid
              </button>
            )}
          </div>
        )}
      </div>

      {properties.length > 1 && (
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={index <= 0}
            aria-label="Previous home"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium tabular-nums text-white/60">
            {index + 1}/{properties.length}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={index >= properties.length - 1}
            aria-label="Next home"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}
    </main>
  );
}