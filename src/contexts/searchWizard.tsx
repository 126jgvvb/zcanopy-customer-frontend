"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import SearchWizard from "@/components/wizard/SearchWizard";

interface SearchWizardContextValue {
  open: boolean;
  openWizard: () => void;
  closeWizard: () => void;
}

const SearchWizardContext = createContext<SearchWizardContextValue | null>(null);

export function SearchWizardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openWizard = useCallback(() => setOpen(true), []);
  const closeWizard = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const value = useMemo(
    () => ({ open, openWizard, closeWizard }),
    [open, openWizard, closeWizard],
  );

  return (
    <SearchWizardContext.Provider value={value}>
      {children}
      {open && <SearchWizard open onClose={closeWizard} />}
    </SearchWizardContext.Provider>
  );
}

export function useSearchWizard(): SearchWizardContextValue {
  const ctx = useContext(SearchWizardContext);
  if (!ctx) throw new Error("useSearchWizard must be used inside SearchWizardProvider");
  return ctx;
}