"use client";

import { Check } from "lucide-react";

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none ${
        selected
          ? "border-[var(--zcanopy-primary)] bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_22%,transparent)] text-[var(--zcanopy-primary)]"
          : "border-[var(--border-strong)] bg-[var(--zcanopy-surface)] text-[var(--zcanopy-card-brown)] hover:border-[var(--zcanopy-primary)]/60"
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  );
}