"use client";

import Link from "next/link";
import { MapPin, Calendar, DollarSign, Video, Image as ImageIcon } from "lucide-react";
import { COLORS } from "@/lib/theme";

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
  postgis_spatial_field?: { lat: number; lng: number } | null;
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
  postgis_spatial_field,
}: PropertyCardProps) {
  const images = imageUrl || [];
  const videos = videoUrl || [];
  const mainImage = images[0] || "https://via.placeholder.com/400x200?text=No+Image";
  const lat = postgis_spatial_field?.lat;
  const lng = postgis_spatial_field?.lng;

  return (
    <Link href={`/properties/${id}`} className="group block rounded-2xl border border-gray-100 bg-[var(--zcanopy-surface)] shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
        <img src={mainImage} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {videos.length > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            <Video size={12} />
            {videos.length}
          </span>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {isAvailable ? "Available" : "Booked"}
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{propertyType}</p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--zcanopy-card-brown)]">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {location}
          </span>
          {price !== undefined && (
            <span className="text-lg font-bold text-[var(--zcanopy-card-brown)]">
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

        {lat !== undefined && lng !== undefined && (
          <div className="mt-3 h-40 w-full overflow-hidden rounded-xl border border-gray-100">
            <iframe
              title={`Map of ${title}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />
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
    </Link>
  );
}
