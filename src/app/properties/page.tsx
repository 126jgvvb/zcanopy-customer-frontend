import PropertiesBrowser, { type Property } from "./properties-browser";
import { serverFetch } from "@/lib/serverApi";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Properties for Rent in Uganda - Browse Verified Listings",
  description:
    "Explore verified properties for rent and sale in Kampala and across Uganda. Filter by location, property type, price and broker, then book a viewing directly.",
  path: "/properties",
});

type ExplorerResponse = {
  properties?: Property[];
  total?: number;
};

/**
 * The listing page is rendered on the server (SSG with ISR) so the first page
 * of properties is present in the HTML that search engines and social bots
 * receive. The browser takes over from there for filtering and infinite
 * scroll.
 */
export default async function PropertiesPage() {
  const data = await serverFetch<ExplorerResponse>("/web/public/explorer", {
    query: { page: 1, limit: 12 },
    revalidate: 60,
    tags: ["listings"],
  });

  const properties = data?.properties ?? [];
  const total = data?.total ?? properties.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Properties for rent and sale in Uganda",
    numberOfItems: total,
    itemListElement: properties.slice(0, 12).map((property, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/properties/${property.id}`,
      name: property.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertiesBrowser initialProperties={properties} initialTotal={total} />
    </>
  );
}
