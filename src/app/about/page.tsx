import type { Metadata } from "next";
import AboutContent from "./about-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About ZCanopy",
  description:
    "ZCanopy connects buyers with verified brokers across Uganda. Learn how we vet listings, protect both sides of a viewing and make booking a property simple.",
  path: "/about",
});

export default function Page() {
  return <AboutContent />;
}
