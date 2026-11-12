import ReelsClient from "./reels-client";
import { serverFetch } from "@/lib/serverApi";
import { buildMetadata } from "@/lib/seo";
import type { Property } from "@/app/properties/properties-browser";

export const revalidate = 120;

export const metadata = buildMetadata({
  title: "Property Reels - Watch Verified Listings",
  description:
    "Watch video walkthroughs of verified properties for rent and sale across Uganda, straight from the brokers who listed them.",
  path: "/reels",
});

/**
 * The reels feed is rendered on the server so the first listings are in the
 * HTML; the player itself is client-side.
 */
export default async function ReelsPage() {
  const data = await serverFetch<{ properties?: Property[] }>(
    "/web/public/explorer",
    { query: { page: 1, limit: 50 }, revalidate: 120, tags: ["listings"] },
  );

  const properties = (data?.properties || []).filter(
    (property) => Array.isArray(property.videoUrl) && property.videoUrl.length > 0,
  );

  return <ReelsClient properties={properties} />;
}
