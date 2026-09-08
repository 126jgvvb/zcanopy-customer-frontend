"use client";

import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { webApi, getSessionId, ensureAnonymousSession } from "@/lib/api";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface FavoriteProperty {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  brokerCode: string;
  imageUrl: string;
  price: number;
  createdAt: string;
  description: string;
  propertyType: string;
  isAvailable: boolean;
  videoUrl: string[];
  brokerBrandName: string;
  postgisSpatialField: string | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError("");
      try {
        let sessionId = getSessionId();
        if (!sessionId) {
          sessionId = await ensureAnonymousSession();
        }
        if (!sessionId) {
          setError("Unable to access favorites. Please refresh the page.");
          setLoading(false);
          return;
        }
        const res = await webApi.getCustomerFavorites(sessionId);
        const favs = (res as { favorites?: FavoriteProperty[] }).favorites || [];
        setFavorites(favs);
      } catch {
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const properties = favorites.map((fav) => ({
    id: fav.propertyId,
    title: fav.propertyTitle,
    description: fav.description,
    propertyType: fav.propertyType,
    location: fav.propertyLocation,
    isAvailable: fav.isAvailable,
    imageUrl: fav.imageUrl ? [fav.imageUrl] : [],
    videoUrl: fav.videoUrl || [],
    brokerBrandName: fav.brokerBrandName || undefined,
    price: fav.price,
    createdAt: fav.createdAt,
    postgis_spatial_field: fav.postgisSpatialField
      ? (() => {
          try {
            const parsed = JSON.parse(fav.postgisSpatialField);
            return parsed && typeof parsed === "object" && "lat" in parsed && "lng" in parsed
              ? { lat: Number(parsed.lat), lng: Number(parsed.lng) }
              : null;
          } catch {
            return null;
          }
        })()
      : null,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <h2 className="text-3xl">My Favorites</h2>
        <p className="mt-2 text-gray-500">Properties you have saved for later.</p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="py-12 text-center">
            <p className="text-gray-500">No favorites yet.</p>
          </div>
        </div>
      ) : (
        <div ref={ref} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, idx) => (
            <div
              key={property.id}
              className={`transition-all duration-700 ease-out ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}