import type { Metadata } from "next";

/**
 * The customer area is behind a session: it must never be indexed, and the
 * robots.txt disallow is backed up by a noindex on the page itself.
 */
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false, nocache: true },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
