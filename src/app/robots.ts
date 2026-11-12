import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Only the public pages are crawlable. The customer area, broker auth and
 * the API routes are excluded so they never end up in a search index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/customer/",
          "/customer-dahbaord",
          "/login",
          "/payments",
          "/bookings/",
          "/properties/favorites",
          "/brokers/verify",
          "/brokers/welcome",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
