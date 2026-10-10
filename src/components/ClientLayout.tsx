"use client";

import Header from "./Header";
import { usePathname } from "next/navigation";
import { SearchWizardProvider } from "@/contexts/searchWizard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/reels";

  return (
    <SearchWizardProvider>
      {!hideHeader && <Header />}
      {children}
    </SearchWizardProvider>
  );
}