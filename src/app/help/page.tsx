import type { Metadata } from "next";
import HelpContent from "./help-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Help Centre",
  description:
    "Answers to common questions about finding a property, booking a viewing, paying the booking fee and your booking refund.",
  path: "/help",
});

export default function Page() {
  return <HelpContent />;
}
