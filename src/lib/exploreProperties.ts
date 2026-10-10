import { webApi } from "@/lib/api";

export interface ExploreProperty {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  imageUrl?: string[];
  videoUrl?: string[];
  brokerBrandName?: string;
  brokerCode?: string;
  brokerPhone?: string;
  price?: number;
  bookingFee?: number;
  postgisSpatialField?: string | null;
  subCounty?: string;
  district?: string;
}

export type ExploreQuery = Record<string, string | number | boolean | undefined>;

/**
 * Shared feed for the explore (/properties) and reels (/reels) pages. Uses the
 * same endpoints as the explore page: the primary explorer first, falling back
 * to the paginated public explorer so both pages show the same listings.
 */
export async function fetchExploreProperties(
  page = 1,
  limit = 12,
  query: ExploreQuery = {},
): Promise<{ properties: ExploreProperty[]; total: number }> {
  try {
    const res: { properties?: ExploreProperty[]; total?: number } = await webApi.customer.explorer({
      page,
      limit,
      ...query,
    });
    return { properties: res?.properties || [], total: res?.total || 0 };
  } catch {
    try {
      const fallback: { properties?: ExploreProperty[]; total?: number } = await webApi.publicPropertiesPaginated(
        page,
        limit,
        query,
      );
      return { properties: fallback?.properties || [], total: fallback?.total || 0 };
    } catch {
      return { properties: [], total: 0 };
    }
  }
}