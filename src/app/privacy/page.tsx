import type { Metadata } from "next";
import PrivacyContent from "./privacy-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How ZCanopy collects, uses, shares, retains and protects personal data on the mobile app and website, and how to request access or account deletion.",
  path: "/privacy",
});

export default function Page() {
  return <PrivacyContent />;
}
