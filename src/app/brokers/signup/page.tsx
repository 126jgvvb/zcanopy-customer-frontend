import type { Metadata } from "next";
import BrokerSignupForm from "./broker-signup-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "List Your Property as a Broker",
  description:
    "Join ZCanopy as a verified broker: upload your listings with photos and video, and reach buyers across Uganda.",
  path: "/brokers/signup",
});

export default function Page() {
  return <BrokerSignupForm />;
}
