"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar, X } from "lucide-react";

const EXIT_MS = 340;

export default function BookingResumeToast({
  open,
  onClose,
  onRestart,
  duration = 7000,
}: {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  duration?: number;
}) {
  const [leaving, setLeaving] = useState(false);
  const onCloseRef = useRef(onClose);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitingRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const beginExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setLeaving(true);
    exitTimerRef.current = setTimeout(() => onCloseRef.current(), EXIT_MS);
  }, []);

  useEffect(() => {
    if (!open) {
      exitingRef.current = false;
      setLeaving(false);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      return;
    }

    exitingRef.current = false;
    setLeaving(false);
    const dismissTimer = setTimeout(beginExit, duration);

    return () => {
      clearTimeout(dismissTimer);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [open, duration, beginExit]);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`booking-resume-toast pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] shadow-[0_24px_70px_-24px_rgba(45,32,24,0.55)] ${
          leaving ? "is-leaving" : ""
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-[var(--zcanopy-primary)]/10">
          <div className="booking-resume-toast__sweep h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[var(--zcanopy-accent-gold)] to-transparent" />
        </div>

        <div className="flex items-start gap-3.5 p-4 pr-11 sm:p-5 sm:pr-12">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--zcanopy-accent-gold)] to-[var(--zcanopy-primary)] text-white shadow-[0_10px_24px_-8px_rgba(169,113,14,0.7)]">
            <span className="booking-resume-toast__halo absolute inset-0 rounded-full border border-[var(--zcanopy-accent-gold)]" />
            <Calendar size={21} strokeWidth={2.2} />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--zcanopy-primary)]">
              You&apos;re signed in
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-[var(--zcanopy-card-brown)] sm:text-[15px]">
              You can now restart your booking process.
            </p>
            <p className="mt-1 text-xs text-gray-500">Pick up right where you left off.</p>
            <button
              type="button"
              onClick={() => {
                onRestart();
                beginExit();
              }}
              className="btn-primary mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs"
            >
              Restart booking
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={beginExit}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-[var(--zcanopy-card-brown)]"
        >
          <X size={16} />
        </button>

        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--zcanopy-primary)]/10">
          <div
            className="booking-resume-toast__progress h-full bg-gradient-to-r from-[var(--zcanopy-accent-gold)] to-[var(--zcanopy-primary)]"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
