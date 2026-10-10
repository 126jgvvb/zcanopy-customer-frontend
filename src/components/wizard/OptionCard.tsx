"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}

export function OptionCard({ label, description, icon: Icon, selected, multi = false, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex h-full w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)] ${
        selected
          ? "border-[var(--zcanopy-primary)] bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_15%,transparent)]"
          : "border-[var(--border)] bg-[var(--zcanopy-surface)] hover:border-[var(--zcanopy-primary)]/50"
      }`}
    >
      {Icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            selected ? "bg-[var(--zcanopy-primary)] text-white" : "bg-[var(--zcanopy-surface)] text-[var(--zcanopy-card-brown)]"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1 pr-6">
        <span className="block font-semibold text-[var(--zcanopy-card-brown)]">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-[var(--zcanopy-muted)]">{description}</span>}
      </span>
      <span
        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center border ${
          multi ? "rounded-md" : "rounded-full"
        } ${
          selected
            ? "border-[var(--zcanopy-primary)] bg-[var(--zcanopy-primary)] text-white"
            : "border-[var(--border-strong)] bg-[var(--zcanopy-surface)]"
        }`}
        aria-hidden="true"
      >
        {selected && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
    </button>
  );
}