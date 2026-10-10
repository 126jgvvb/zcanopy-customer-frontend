"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { WizardStep } from "./WizardStep";
import { webApi } from "@/lib/api";
import { emptyGuidedDraft, guidedSteps, type GuidedDraft, type GuidedStepId } from "@/data/wizardOptions";

const SPARKLES: { top: number; left: number; dx: number; dy: number; s: number; c: string; d: number }[] = [
  { top: 6, left: 16, dx: -30, dy: -26, s: 4, c: "#d38a12", d: 0 },
  { top: 10, left: 30, dx: 26, dy: -30, s: 3, c: "#e9b84a", d: 0.05 },
  { top: 3, left: 40, dx: 4, dy: -34, s: 5, c: "#c9a227", d: 0.1 },
  { top: 12, left: 52, dx: 30, dy: -18, s: 3, c: "#f0c95c", d: 0.15 },
  { top: 8, left: 26, dx: -40, dy: 0, s: 3, c: "#c9a227", d: 0.2 },
  { top: 16, left: 34, dx: 0, dy: 26, s: 4, c: "#d38a12", d: 0.25 },
  { top: 5, left: 46, dx: 36, dy: 12, s: 3, c: "#e9b84a", d: 0.3 },
  { top: 14, left: 44, dx: 16, dy: -31, s: 4, c: "#f0c95c", d: 0.35 },
];

interface SearchWizardProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchWizard({ open, onClose }: SearchWizardProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<GuidedDraft>(emptyGuidedDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const countTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setDraft(emptyGuidedDraft);
    setStepIndex(0);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = (await webApi.getLocations()) as {
          locations?: Array<{ location?: string; propertyType?: string }>;
        };
        if (cancelled) return;
        const seenLoc = new Set<string>();
        const seenType = new Set<string>();
        const locs: string[] = [];
        const typs: string[] = [];
        for (const row of res?.locations || []) {
          if (row.location && !seenLoc.has(row.location)) {
            seenLoc.add(row.location);
            locs.push(row.location);
          }
          if (row.propertyType && !seenType.has(row.propertyType)) {
            seenType.add(row.propertyType);
            typs.push(row.propertyType);
          }
        }
        setLocations(locs.sort((a, b) => a.localeCompare(b)));
        setTypes(typs.sort((a, b) => a.localeCompare(b)));
      } catch {
        /* options unavailable */
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const step = guidedSteps[stepIndex];
  const isLast = stepIndex === guidedSteps.length - 1;

  const go = (i: number) => {
    setStepIndex(Math.max(0, Math.min(i, guidedSteps.length - 1)));
  };
  const update = (patch: Partial<GuidedDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const pickAndAdvance = (patch: Partial<GuidedDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, guidedSteps.length - 1)), 180);
  };
  const editStep = (id: GuidedStepId) => go(guidedSteps.findIndex((s) => s.id === id));

  useEffect(() => {
    if (!open) return;
    if (countTimer.current) clearTimeout(countTimer.current);
    countTimer.current = setTimeout(async () => {
      setCountLoading(true);
      try {
        const res = (await webApi.customer.explorer({
          page: 1,
          limit: 1,
          location: draft.location || undefined,
          propertyType: draft.propertyType || undefined,
          minPrice: draft.minPrice ?? undefined,
          maxPrice: draft.maxPrice ?? undefined,
        })) as { total?: number };
        setMatchCount(res?.total ?? 0);
      } catch {
        setMatchCount(null);
      } finally {
        setCountLoading(false);
      }
    }, 350);
    return () => {
      if (countTimer.current) clearTimeout(countTimer.current);
    };
  }, [open, draft]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("guided", "1");
    if (draft.location) params.set("location", draft.location);
    if (draft.propertyType) params.set("propertyType", draft.propertyType);
    if (draft.minPrice != null) params.set("minPrice", String(draft.minPrice));
    if (draft.maxPrice != null) params.set("maxPrice", String(draft.maxPrice));
    const qs = params.toString();
    return qs === "guided=1" ? "" : `?${qs}`;
  }, [draft]);

  const finish = () => {
    router.push(`/properties${queryParams}`);
    onClose();
  };

  const canFinish = optionsLoading
    ? false
    : matchCount === null
      ? true
      : matchCount > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-[#1c1912]/50 backdrop-blur-[2px]"
        style={{ animation: "wizardFade 0.2s ease-out" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-search-title"
        className="fixed inset-x-0 bottom-0 z-[70] flex flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--zcanopy-surface)] shadow-[var(--shadow-lift)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[86vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        style={{ animation: "wizardPop 0.26s cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div className="flex items-center gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-8">
          <ol className="flex flex-1 items-center gap-1.5" aria-label="Progress">
            {guidedSteps.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => i < stepIndex && go(i)}
                  disabled={i >= stepIndex}
                  aria-label={`${s.short}${i === stepIndex ? " (current)" : ""}`}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={`block h-1.5 w-full rounded-full transition-colors duration-200 ${
                    i <= stepIndex
                      ? "bg-[var(--zcanopy-primary)]"
                      : "bg-[var(--border-strong)]"
                  } ${i < stepIndex ? "cursor-pointer" : "cursor-default"}`}
                />
              </li>
            ))}
          </ol>
          <span className="whitespace-nowrap text-sm font-medium text-[var(--zcanopy-muted)]">
            {step.short}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guided search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--zcanopy-card-brown)] transition-colors duration-150 hover:bg-[var(--border)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-8 sm:px-8">
          <h2 id="guided-search-title" className="font-display text-3xl leading-tight text-[var(--zcanopy-card-brown)] sm:text-4xl">
            {step.title}
          </h2>
          <p className="mt-2 text-[var(--zcanopy-muted)]">{step.helper}</p>
          <div className="mt-8" style={{ animation: "wizardStepFade 0.24s ease-out" }} key={step.id}>
            {optionsLoading && stepIndex < 2 ? (
              <p className="py-8 text-center text-sm text-[var(--zcanopy-muted)]">
                Loading options…
              </p>
            ) : (
              <WizardStep
                stepId={step.id}
                draft={draft}
                locations={locations}
                types={types}
                update={update}
                pickAndAdvance={pickAndAdvance}
                onEdit={editStep}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] bg-[var(--zcanopy-surface)] px-5 py-4 sm:px-8">
          <p className="mr-auto flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${countLoading ? "animate-pulse" : ""} ${
                matchCount === null || matchCount > 0 ? "bg-[var(--zcanopy-primary)]" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            {matchCount === null ? (
              <span className="text-[var(--zcanopy-muted)]">
                {countLoading ? "Counting properties…" : "Search properties"}
              </span>
            ) : matchCount > 0 ? (
              <span
                key={matchCount}
                className="relative inline-flex items-center gap-2"
                style={{ animation: "wizardCountPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {SPARKLES.map((s, i) => (
                    <span
                      key={i}
                      className="absolute rounded-full"
                      style={
                        {
                          top: `${s.top}px`,
                          left: `${s.left}px`,
                          width: `${s.s}px`,
                          height: `${s.s}px`,
                          background: s.c,
                          boxShadow: `0 0 6px ${s.c}`,
                          "--sx": `${s.dx}px`,
                          "--sy": `${s.dy}px`,
                          animation: `starBurst 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) ${s.d}s forwards`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
                <strong className="font-semibold text-[var(--zcanopy-card-brown)]">{matchCount} properties</strong>{" "}
                <span className="text-[var(--zcanopy-muted)]">match so far</span>
              </span>
            ) : (
              <span className="text-red-600">No exact matches — try loosening this step</span>
            )}
          </p>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => go(stepIndex - 1)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--zcanopy-card-brown)] transition-colors duration-150 hover:bg-[var(--border)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          )}
          {isLast ? (
            <button
              type="button"
              onClick={finish}
              disabled={!canFinish}
              className="rounded-full bg-gradient-to-b from-[#bc8120] to-[var(--zcanopy-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Show my properties
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(stepIndex + 1)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--zcanopy-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--zcanopy-primary-alt)]"
            >
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}