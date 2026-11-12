"use client";

import { useRouter } from "next/navigation";
import PropertyVideoReel from "@/components/PropertyVideoReel";
import type { Property } from "@/app/properties/properties-browser";

/**
 * Client wrapper for the reels feed: the back action needs the router. The
 * listings themselves are rendered on the server and passed in.
 */
export default function ReelsClient({ properties }: { properties: Property[] }) {
  const router = useRouter();
  return <PropertyVideoReel initialProperties={properties} onClose={() => router.back()} />;
}
