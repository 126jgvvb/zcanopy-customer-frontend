import type { Metadata } from "next";
import RefundPolicyContent from "./refund-policy-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Refund Policy",
  description:
    "How booking fees are held in escrow and when they are released to the broker or refunded to the customer.",
  path: "/refund-policy",
});

export default function Page() {
  return <RefundPolicyContent />;
}
