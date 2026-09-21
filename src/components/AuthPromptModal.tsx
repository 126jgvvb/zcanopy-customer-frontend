"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthPromptModal({ open, onClose }: AuthPromptModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        ref={panelRef}
        className="w-full max-w-sm rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow-md)]"
      >
        <h3 className="text-lg font-semibold text-[var(--zcanopy-card-brown)]">Sign in to save favorites</h3>
        <p className="mt-2 text-sm text-[var(--zcanopy-muted)]">
          Create an account or sign in to save properties to your favorites and access them later.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/customer/signup"
            className="flex items-center justify-center rounded-xl bg-[var(--zcanopy-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            onClick={onClose}
          >
            Create Account
          </Link>
          <Link
            href="/customer"
            className="flex items-center justify-center rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            onClick={onClose}
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
