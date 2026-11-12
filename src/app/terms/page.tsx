import type { Metadata } from "next";
import TermsContent from "./terms-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern the use of ZCanopy by customers and brokers, including listings, viewings, payments and refunds.",
  path: "/terms",
});

export default function Page() {
  return <TermsContent />;
}
