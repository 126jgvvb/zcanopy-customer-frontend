"use client";

import { COLORS } from "@/lib/theme";
import ZLoadingIndicator from "@/components/ZLoadingIndicator";

export function OnboardingShell({
  children,
  step,
  totalSteps,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-8 shadow-[var(--shadow-lift)] sm:p-10">
        <BrandMark />

        {typeof step === "number" && typeof totalSteps === "number" ? (
          <StepDots step={step} total={totalSteps} />
        ) : null}

        <div className="mb-6 mt-6 text-center">
          <h1 className="text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}

export function BrandMark() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg"
        style={{ backgroundColor: COLORS.accentGold, color: COLORS.cardBrown }}
      >
        Z
      </span>
        <span className="font-display text-2xl tracking-tight" style={{ color: COLORS.cardBrown }}>
        ZCanopy
      </span>
    </div>
  );
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i === step - 1 ? 28 : 10,
            backgroundColor: i < step ? COLORS.primary : "#e5e5e5",
          }}
        />
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  loading,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none"
    >
      {loading ? <ZLoadingIndicator size={20} color="#ffffff" strokeWidth={3} /> : children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-3 py-2.5 outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
    />
  );
}
