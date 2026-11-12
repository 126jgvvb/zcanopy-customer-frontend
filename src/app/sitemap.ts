import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/seo";

/** Static, always-public pages. */
const STATIC_PATHS = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/properties", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/reels", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/help", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/brokers/signup", priority: 0.6, changeFrequency: "monthly" as const },
];

type ExplorerResponse = {
  properties?: Array<{ id?: string; updatedAt?: string; createdAt?: string }>;
};

/**
 * Sitemap for the storefront: the static pages plus every published
 * property, so search engines can discover listings directly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const listings = await serverFetch<ExplorerResponse>(
    "/web/public/explorer",
    { query: { page: 1, limit: 500 }, revalidate: 3600, tags: ["listings"] },
  );

  const propertyEntries: MetadataRoute.Sitemap = (listings?.properties || [])
    .filter((property) => property?.id)
    .map((property) => ({
      url: `${SITE_URL}/properties/${property.id}`,
      lastModified: property.updatedAt
        ? new Date(property.updatedAt)
        : property.createdAt
          ? new Date(property.createdAt)
          : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...propertyEntries];
}
