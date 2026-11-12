import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your broker account",
  robots: { index: false, follow: false },
};

export default function BrokerVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
