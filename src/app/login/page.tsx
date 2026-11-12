import type { Metadata } from "next";
import LoginForm from "./login-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Broker Sign In",
  description:
    "Sign in to your ZCanopy broker account to manage your listings, bookings and payouts.",
  path: "/login",
  noIndex: true,
});

export default function Page() {
  return <LoginForm />;
}
