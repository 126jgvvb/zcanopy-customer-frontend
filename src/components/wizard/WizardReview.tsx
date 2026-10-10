"use client";

import { CreditCard, MapPin, Building2 } from "lucide-react";
import { noLimitBand, priceBands, type GuidedDraft, type GuidedStepId } from "@/data/wizardOptions";

interface WizardReviewProps {
  draft: GuidedDraft;
  onEdit: (step: GuidedStepId) => void;
}

function formatUGX(n: number) {
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `UGX ${n.toLocaleString()}`;
  }
}

function budgetLabel(draft: GuidedDraft): string {
  const band = [noLimitBand, ...priceBands].find(
    (b) => b.minPrice === draft.minPrice && b.maxPrice === draft.maxPrice,
  );
  if (band) return band.label;
  if (draft.minPrice != null && draft.maxPrice != null) return `${formatUGX(draft.minPrice)} – ${formatUGX(draft.maxPrice)}`;
  if (draft.minPrice != null) return `From ${formatUGX(draft.minPrice)}`;
  if (draft.maxPrice != null) return `Under ${formatUGX(draft.maxPrice)}`;
  return "No limit";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function WizardReview({ draft, onEdit }: WizardReviewProps) {
  const rows: { step: GuidedStepId; label: string; value: string; Icon: typeof MapPin }[] = [
    {
      step: "location",
      label: "Where",
      value: draft.location || "Anywhere",
      Icon: MapPin,
    },
    {
      step: "type",
      label: "Property type",
      value: draft.propertyType ? capitalize(draft.propertyType) : "Any place",
      Icon: Building2,
    },
    {
      step: "budget",
      label: "Budget",
      value: budgetLabel(draft),
      Icon: CreditCard,
    },
  ];

  return (
    <dl className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)]">
      {rows.map((r) => (
        <div key={r.step} className="flex items-center gap-4 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_18%,transparent)] text-[var(--zcanopy-primary)]">
            <r.Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <dt className="w-24 shrink-0 text-sm text-[var(--zcanopy-muted)]">{r.label}</dt>
          <dd className="min-w-0 flex-1 font-medium text-[var(--zcanopy-card-brown)]">{r.value}</dd>
          <button
            type="button"
            onClick={() => onEdit(r.step)}
            className="rounded-full px-3 py-1 text-sm font-medium text-[var(--zcanopy-primary)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--zcanopy-accent-gold)_15%,transparent)]"
            aria-label={`Edit ${r.label}`}
          >
            Edit
          </button>
        </div>
      ))}
    </dl>
  );
}