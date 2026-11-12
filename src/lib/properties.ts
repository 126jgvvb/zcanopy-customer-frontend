import { serverFetch } from "@/lib/serverApi";
import type { Property } from "@/app/properties/properties-browser";

/**
 * Fetches a single listing for server rendering (metadata, JSON-LD and the
 * initial paint of the property page).
 *
 * Mirrors the browser client (src/lib/api.ts -> propertyDetails): the
 * property-info endpoint first, then the public explorer as a fallback.
 */
export async function fetchPropertyForPage(id: string): Promise<Property | null> {
  if (!id) return null;

  const info = await serverFetch<{ property?: Property }>(
    "/web/public/property-info",
    { query: { id }, revalidate: 300, tags: [`property:${id}`] },
  );
  if (info?.property) return info.property;

  const fallback = await serverFetch<{ properties?: Property[] }>(
    "/web/public/explorer",
    { query: { id }, revalidate: 300, tags: ["listings"] },
  );

  return (fallback?.properties || []).find(
    (property) => String(property.id) === String(id),
  ) || null;
}

/** Shortens a description for meta tags without cutting mid-word. */
export function toMetaDescription(text: string | undefined, maxLength = 160): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}
