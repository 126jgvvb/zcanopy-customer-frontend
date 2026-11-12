import type { Metadata } from "next";

/**
 * Central SEO configuration.
 *
 * `NEXT_PUBLIC_SITE_URL` should point at the deployed storefront (it is used
 * for canonical URLs, Open Graph tags and the sitemap). It defaults to the
 * production domain so the build never fails, but it is worth setting
 * explicitly in the deployment environment.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://zcanopy.com"
).replace(/\/$/, "");

export const SITE_NAME = "ZCanopy";

export const DEFAULT_DESCRIPTION =
  "Browse verified properties from trusted brokers across Uganda and book a viewing directly.";

export const SITE_KEYWORDS = [
  "property for rent Uganda",
  "houses for sale Kampala",
  "verified property listings Uganda",
  "book property viewing",
  "ZCanopy",
];

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Path of the page, e.g. "/properties". Used for the canonical URL. */
  path: string;
  /** Absolute or root-relative image URL for social cards. */
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  /** Set for pages that should not be indexed (customer area, auth). */
  noIndex?: boolean;
}

/**
 * Builds a consistent Metadata object: canonical URL, Open Graph and Twitter
 * card tags, all derived from one place so pages cannot drift apart.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  type = "website",
  keywords = SITE_KEYWORDS,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
