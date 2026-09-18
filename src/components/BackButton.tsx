'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--zcanopy-accent-gold)]/10 hover:text-[var(--zcanopy-primary)]"
      style={{ color: 'var(--zcanopy-card-brown)' }}
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  );
}
