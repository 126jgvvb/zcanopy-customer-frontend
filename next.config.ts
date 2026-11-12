import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Property photos and videos live in DigitalOcean Spaces and are served
    // through its CDN edge (see src/lib/mediaUrl.ts).
    remotePatterns: [
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "**.cdn.digitaloceanspaces.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    formats: ["image/avif", "image/webp"],
    // The listings are the heaviest pages: keep the optimiser cache short
    // enough that new photos show up quickly.
    minimumCacheTTL: 3600,
  },
};

export default nextConfig;
