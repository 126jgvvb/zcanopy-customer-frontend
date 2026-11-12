import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import SessionGate from "@/components/SessionGate";
import CookieBanner from "@/components/CookieBanner";
import { BROKER_SIGNUP_URL } from "@/lib/navigation";
import { SESSION_ROLE_KEY } from "@/lib/api";
import ClientLayout from "@/components/ClientLayout";
import { DEFAULT_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZCanopy - Browse & Book Verified Properties in Uganda",
    template: "%s | ZCanopy",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_UG",
    url: SITE_URL,
    title: "ZCanopy - Browse & Book Verified Properties in Uganda",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZCanopy - Browse & Book Verified Properties in Uganda",
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    // Small PNGs instead of the 1.8 MB source SVG - these are preloaded on
    // every page.
    icon: [{ url: "/logo-96.png", type: "image/png", sizes: "96x96" }],
    shortcut: "/logo-96.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          <SessionGate>
            {children}
          </SessionGate>
          <CookieBanner />
        </ClientLayout>
      </body>
    </html>
  );
}
