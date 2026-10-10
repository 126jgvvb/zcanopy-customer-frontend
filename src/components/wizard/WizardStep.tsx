"use client";

import { Compass } from "lucide-react";
import { OptionCard } from "./OptionCard";
import { Chip } from "../Chip";
import { WizardReview } from "./WizardReview";
import { noLimitBand, priceBands, type GuidedDraft, type GuidedStepId } from "@/data/wizardOptions";

interface WizardStepProps {
  stepId: GuidedStepId;
  draft: GuidedDraft;
  locations: string[];
  types: string[];
  update: (patch: Partial<GuidedDraft>) => void;
  pickAndAdvance: (patch: Partial<GuidedDraft>) => void;
  onEdit: (step: GuidedStepId) => void;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function WizardStep({ stepId, draft, locations, types, update, pickAndAdvance, onEdit }: WizardStepProps) {
  if (stepId === "location") {
    return (
      <div className="space-y-5">
        <OptionCard
          label="Open to anywhere"
          description="Show properties across all locations"
          icon={Compass}
          selected={draft.location === ""}
          onClick={() => pickAndAdvance({ location: "" })}
        />
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <Chip
              key={loc}
              label={loc}
              selected={draft.location === loc}
              onClick={() => (draft.location === loc ? update({ location: "" }) : pickAndAdvance({ location: loc }))}
            />
          ))}
        </div>
      </div>
    );
  }

  if (stepId === "type") {
    return (
      <div className="flex flex-wrap gap-2">
        <Chip
          label="Any property"
          selected={draft.propertyType === ""}
          onClick={() => (draft.propertyType === "" ? update({ propertyType: "" }) : pickAndAdvance({ propertyType: "" }))}
        />
        {types.map((t) => (
          <Chip
            key={t}
            label={capitalize(t)}
            selected={draft.propertyType === t}
            onClick={() => (draft.propertyType === t ? update({ propertyType: "" }) : pickAndAdvance({ propertyType: t }))}
          />
        ))}
      </div>
    );
  }

  if (stepId === "budget") {
    const bands = [noLimitBand, ...priceBands];
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-4">
          <p className="text-sm font-medium text-[var(--zcanopy-card-brown)]">Or type your own range</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--zcanopy-muted)]">Minimum (UGX)</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.minPrice ?? ""}
                onChange={(e) => update({ minPrice: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="e.g. 1000000"
                className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--zcanopy-muted)]">Maximum (UGX)</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.maxPrice ?? ""}
                onChange={(e) => update({ maxPrice: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="e.g. 10000000"
                className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-4 py-2.5 shadow-sm"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {bands.map((band) => {
            const selected = draft.minPrice === band.minPrice && draft.maxPrice === band.maxPrice;
            return (
              <OptionCard
                key={band.label}
                label={band.label}
                selected={selected}
                onClick={() => {
                  if (selected) {
                    update({ minPrice: null, maxPrice: null });
                  } else {
                    pickAndAdvance({ minPrice: band.minPrice, maxPrice: band.maxPrice });
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (stepId === "review") {
    return <WizardReview draft={draft} onEdit={onEdit} />;
  }

  return null;
}