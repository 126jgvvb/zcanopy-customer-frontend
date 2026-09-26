"use client";

import Link from "next/link";
import { MapPin, Calendar, Video, Heart, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { useEffect, useState } from "react";
import { webApi, getSessionId, ensureAnonymousSession } from "@/lib/api";
import AuthPromptModal from "./AuthPromptModal";

function formatUGX(n: number) {
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

interface PropertyCardProps {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  location: string;
  isAvailable: boolean;
  imageUrl?: string[];
  videoUrl?: string[];
  brokerBrandName?: string;
  price?: number;
  createdAt?: string;
  postgisSpatialField?: string | null;
  preFavorited?: boolean;
  showRemoveButton?: boolean;
  onRemoveFavorite?: () => void;
  brokersUniqueCode?: string;
}

export default function PropertyCard({
  id,
  title,
  description,
  propertyType,
  location,
  isAvailable,
  imageUrl,
  videoUrl,
  brokerBrandName,
  price,
  createdAt,
  postgisSpatialField,
  preFavorited = false,
  showRemoveButton = false,
  onRemoveFavorite,
  brokersUniqueCode,
}: PropertyCardProps) {
  const images = imageUrl || [];
  const videos = videoUrl || [];
  const mainImage = images[0] || "https://via.placeholder.com/400x200?text=No+Image";
  const spatial = postgisSpatialField ? (() => { try { return JSON.parse(postgisSpatialField); } catch { return null; } })() : null;
  const lat = spatial?.lat;
  const lng = spatial?.lng;
  const [favorited, setFavorited] = useState(preFavorited);
  const [initializing, setInitializing] = useState(!preFavorited);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
         const token = getSessionId();
        if (!token) {
          setInitializing(false);
          return;
        }

        try {
          const res = await webApi.getCustomerFavorites(token);
        const favList = (res as any)?.favorites || [];
        if (!cancelled) {
          setFavorited(favList.some((f: any) => f.propertyId === id));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasToken = typeof window !== "undefined" && !!window.localStorage.getItem("zcanopy_token");
    if (!hasToken) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      let token = getSessionId();
      if (!token) {
        const newSession = await ensureAnonymousSession();
        token = newSession || null;
      }
      if (!token) {
        window.alert("Unable to start a customer session right now. Please refresh and try again.");
        return;
      }
      const res = await webApi.toggleFavorite(token, {
        propertyId: id,
        propertyTitle: title,
        propertyLocation: location,
        imageUrl: images[0] || "",
        price: price || 0,
      });

      const nextFavorited = Boolean((res as any)?.favorited);
      setFavorited(nextFavorited);
    } catch {
      // ignore
    }
  };

  return (
    <Link href={`/properties/${id}${brokersUniqueCode ? `?brokerCode=${encodeURIComponent(brokersUniqueCode)}` : ''}`} className="group surface-card block overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
        <img src={mainImage} alt={title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80" />
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/80 p-2 text-gray-700 backdrop-blur-sm transition hover:bg-white"
        >
          <Heart
            size={18}
            fill={favorited ? "#ef4444" : "none"}
            color={favorited ? "#ef4444" : "currentColor"}
          />
        </button>
        {showRemoveButton && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoveFavorite?.();
            }}
            className="absolute top-3 right-14 rounded-full bg-red-500/80 p-1.5 text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
            title="Remove from favorites"
          >
            <Trash2 size={14} />
          </button>
        )}
        {videos.length > 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Video size={12} />
            {videos.length}
          </span>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${isAvailable ? "bg-emerald-50/90 text-emerald-800" : "bg-red-50/90 text-red-700"}`}>
          {isAvailable ? "Available" : "Booked"}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">{propertyType}</p>
        <h3 className="mt-1.5 text-xl">{title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {location}
          </span>
          {price !== undefined && (
            <span className="font-display text-xl" style={{ color: COLORS.primary }}>
              {formatUGX(price)}
            </span>
          )}
        </div>

        {brokerBrandName && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Broker:</span> {brokerBrandName}
          </p>
        )}

        {createdAt && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            <span className="font-medium">Uploaded:</span> {new Date(createdAt).toLocaleDateString()}
          </p>
        )}

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img src={img} alt={`${title} ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
            {images.length > 4 && (
              <span className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
                +{images.length - 4}
              </span>
            )}
          </div>
        )}

        {(lat != null && lng != null && lat !== 0 && lng !== 0) ? (
          <div className="mt-3 h-40 w-full overflow-hidden rounded-xl border border-gray-100">
            <iframe
              title={`Map of ${title}`}
              src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center text-xs text-gray-500">
            This property was not lively captured on site,please refer to the location text
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Video size={12} />
              Videos
            </p>
            <div className="space-y-2">
              {videos.slice(0, 2).map((video, idx) => (
                <video
                  key={idx}
                  src={video}
                  className="h-40 w-full rounded-xl object-cover"
                  controls
                  preload="metadata"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </Link>
  );
}
