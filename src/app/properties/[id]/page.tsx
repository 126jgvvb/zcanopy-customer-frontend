import type { Metadata } from "next";
import PropertyDetailClient from "./property-detail";
import { fetchPropertyForPage, toMetaDescription } from "@/lib/properties";
import { serverFetch } from "@/lib/serverApi";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import type { Property } from "@/app/properties/properties-browser";

/** Listings are re-rendered at most every 5 minutes. */
export const revalidate = 300;

/**
 * Prerenders the most recent listings at build time. Any other listing is
 * rendered on demand and then cached (ISR).
 */
export async function generateStaticParams() {
  const data = await serverFetch<{ properties?: Property[] }>(
    "/web/public/explorer",
    { query: { page: 1, limit: 50 }, revalidate: 3600, tags: ["listings"] },
  );

  return (data?.properties || [])
    .filter((property) => property?.id)
    .slice(0, 50)
    .map((property) => ({ id: String(property.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchPropertyForPage(id);

  if (!property) {
    return buildMetadata({
      title: "Property not found",
      description: "This property is no longer available on ZCanopy.",
      path: `/properties/${id}`,
      noIndex: true,
    });
  }

  const location = property.location ? ` in ${property.location}` : "";
  const description =
    toMetaDescription(property.description) ||
    `${property.propertyType || "Property"}${location} on ZCanopy. Verified listing with photos and video from a trusted broker.`;

  return buildMetadata({
    title: `${property.title}${location}`,
    description,
    path: `/properties/${property.id}`,
    image: property.imageUrl?.[0],
    type: "article",
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await fetchPropertyForPage(id);

  const jsonLd = property
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: toMetaDescription(property.description, 300),
        url: `${SITE_URL}/properties/${property.id}`,
        image: property.imageUrl?.slice(0, 4) ?? [],
        datePosted: property.createdAt,
        offers: {
          "@type": "Offer",
          price: property.price ?? undefined,
          priceCurrency: "UGX",
          availability:
            property.isAvailable === false
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          url: `${SITE_URL}/properties/${property.id}`,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: property.location,
          addressRegion: property.district,
          addressCountry: "UG",
        },
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: `${SITE_URL}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property?.title ?? "Property",
        item: `${SITE_URL}/properties/${id}`,
      },
    ],
  };

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PropertyDetailClient initialProperty={property} />
    </>
  );
}
