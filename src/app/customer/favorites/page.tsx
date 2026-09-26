'use client';

import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { webApi, getSessionId, ensureAnonymousSession } from '@/lib/api';
import { mockData } from '@/lib/mockData';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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

interface CustomerFavoritesContentProps {
  token: string;
}

export default function CustomerFavoritesContent({ token }: CustomerFavoritesContentProps) {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        let sessionId = token || getSessionId();
        if (!sessionId) {
          sessionId = await ensureAnonymousSession();
        }
        if (!sessionId) {
          setError('Unable to access favorites. Please refresh the page.');
          setLoading(false);
          return;
        }
        const res = await webApi.getCustomerFavorites(sessionId);
        const favs = (res as { favorites?: FavoriteProperty[] }).favorites || [];
        setFavorites(favs);
      } catch {
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [token]);

  const handleRemoveFavorite = async (fav: FavoriteProperty) => {
    if (!token) return;
    try {
      await webApi.toggleFavorite(token, {
        propertyId: fav.propertyId,
        propertyTitle: fav.propertyTitle,
        propertyLocation: fav.propertyLocation,
        brokerCode: fav.brokerCode,
        imageUrl: fav.imageUrl,
        price: fav.price,
      });
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } catch {
      alert('Failed to remove favorite');
    }
  };

  const properties = favorites.length > 0
    ? favorites.map((fav) => ({
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
        postgisSpatialField: fav.postgisSpatialField
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
      }))
    : mockData.customerProperties().properties.slice(0, 2).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        propertyType: p.propertyType,
        location: p.location,
        isAvailable: p.isAvailable,
        imageUrl: p.imageUrl,
        videoUrl: p.videoUrl || [],
        brokerBrandName: p.brokerBrandName,
        price: p.price,
        createdAt: p.createdAt,
        postgisSpatialField: p.postgisSpatialField || null,
      }));

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px]">
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Favorites</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
        Properties you have saved for later. Click any property to view its details.
      </p>

      {properties.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-5 shadow-sm">
          <div className="py-12 text-center">
            <p style={{ color: 'var(--zcanopy-muted)' }}>No favorites yet.</p>
          </div>
        </div>
      ) : (
        <div ref={ref} className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, idx) => {
            const fav = favorites[idx];
            return (
              <div
                key={property.id}
                className="transition-all duration-700 ease-out"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <PropertyCard
                  {...property}
                  preFavorited={true}
                  showRemoveButton={true}
                  onRemoveFavorite={fav ? () => handleRemoveFavorite(fav) : undefined}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
