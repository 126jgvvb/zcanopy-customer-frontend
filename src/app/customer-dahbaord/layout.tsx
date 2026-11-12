import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
