import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import SessionGate from "@/components/SessionGate";
import CookieBanner from "@/components/CookieBanner";
import { BROKER_SIGNUP_URL } from "@/lib/navigation";
import { SESSION_ROLE_KEY } from "@/lib/api";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ZCanopy - Browse & Book Properties",
  description: "Browse verified properties from trusted brokers across Uganda and book directly.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
