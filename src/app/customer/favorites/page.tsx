'use client';

  import useSWR from 'swr';
  import PropertyCard from '@/components/PropertyCard';
  import { webApi } from '@/lib/api';
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

  async function fetchFavorites(key: [string, string]) {
    const t = key[1];
    const res = await webApi.getCustomerFavorites(t);
    return { favorites: (res as { favorites?: FavoriteProperty[] }).favorites || [] };
  }

  export default function CustomerFavoritesContent({ token }: CustomerFavoritesContentProps) {
    const key = token ? ['customer-favorites', token] : null;

    const { data, error, isLoading, mutate } = useSWR(key, fetchFavorites, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: { favorites: [] as FavoriteProperty[] },
    });

    const favorites = data?.favorites || [];
    const { ref, visible } = useScrollReveal();

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
        await mutate();
      } catch {
        alert('Failed to remove favorite');
      }
    };

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
      postgisSpatialField: fav.postgisSpatialField,
    }));

    if (isLoading && !favorites.length) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[500px]">
          <p className="mt-4 text-sm text-red-600">Failed to load favorites</p>
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
