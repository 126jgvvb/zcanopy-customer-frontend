import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to ZCanopy",
  robots: { index: false, follow: false },
};

export default function BrokerWelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
