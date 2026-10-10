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
  preFavorited = false,
  showRemoveButton = false,
  onRemoveFavorite,
  brokersUniqueCode,
}: PropertyCardProps) {
  const images = imageUrl || [];
  const videos = videoUrl || [];
  const mainImage = images[0] || "https://via.placeholder.com/400x200?text=No+Image";
  const [favorited, setFavorited] = useState(preFavorited);
  const [initializing, setInitializing] = useState(!preFavorited);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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

    // Optimistic update - immediately toggle UI with animation
    const previousFavorited = favorited;
    setFavorited(!favorited);
    setIsToggling(true);

    try {
      let token = getSessionId();
      if (!token) {
        const newSession = await ensureAnonymousSession();
        token = newSession || null;
      }
      if (!token) {
        window.alert("Unable to start a customer session right now. Please refresh and try again.");
        setFavorited(previousFavorited);
        setIsToggling(false);
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
      // Revert on error
      setFavorited(previousFavorited);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link href={`/properties/${id}${brokersUniqueCode ? `?brokerCode=${encodeURIComponent(brokersUniqueCode)}` : ''}`} className="group surface-card block overflow-hidden">
      <div className="property-media aspect-video w-full overflow-hidden bg-gray-100 relative">
        <img src={mainImage} alt={title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 rounded-full bg-white/80 p-2 text-gray-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
          disabled={isToggling}
        >
          <Heart
            size={18}
            fill={favorited ? "#ef4444" : "none"}
            color={favorited ? "#ef4444" : "currentColor"}
            className={isToggling ? "animate-bounce" : ""}
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
        <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${isAvailable ? "bg-emerald-50/90 text-emerald-800" : "bg-red-50/90 text-red-700"}`}>
          {isAvailable ? "Available" : "Booked"}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--zcanopy-primary)]">{propertyType}</p>
        <h3 className="mt-1.5 text-xl">{title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{description}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          {price !== undefined && (
            <span className="font-display shrink-0 text-xl leading-none" style={{ color: COLORS.primary }}>
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

        </div>
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
    </Link>
  );
}
