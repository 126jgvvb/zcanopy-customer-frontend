'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { validateSession, getSessionId, clearSession, ensureAnonymousSession } from '@/lib/api';

const PUBLIC_PATHS = new Set(['/', '/login', '/brokers/signup', '/brokers/verify', '/brokers/welcome', '/about', '/help', '/terms']);

interface SessionGateProps {
  children: React.ReactNode;
}

export default function SessionGate({ children }: SessionGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    const isPublic =
      PUBLIC_PATHS.has(pathname) ||
      pathname.startsWith('/properties') ||
      pathname.startsWith('/api/');

    let cancelled = false;
    (async () => {
      // Always ensure an anonymous session exists on first visit so traffic
      // analytics, browsing, and booking all share the same sessionId.
      if (!getSessionId()) {
        await ensureAnonymousSession();
        if (cancelled) return;
      }

      if (isPublic) {
        setValid(true);
        setReady(true);
        return;
      }

      const result = await validateSession();
      if (cancelled) return;
      if (!result || !result.valid) {
        clearSession();
        setValid(false);
      } else {
        setValid(true);
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  useEffect(() => {
    if (ready && valid === false) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [ready, valid, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  if (valid === false) {
    return null;
  }

  return <>{children}</>;
}
