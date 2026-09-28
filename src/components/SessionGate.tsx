'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { validateSession, getSessionId, clearSession, ensureAnonymousSession } from '@/lib/api';

const PUBLIC_PATHS = new Set(['/', '/login', '/customer', '/customer/signup', '/customer/verify', '/brokers/signup', '/brokers/verify', '/brokers/welcome', '/about', '/help', '/terms', '/properties', '/properties/[id]']);

const CUSTOMER_PATHS = new Set([
  '/customer/transactions',
  '/customer/invoices',
  '/customer/messages',
  '/customer/notifications',
  '/customer/profile',
  '/customer/favorites',
  '/customer/bookings',
  '/customer/find-booking',
  '/properties/favorites',
  '/bookings/retrieve',
  '/bookings/find',
]);

interface SessionGateProps {
  children: React.ReactNode;
}

export default function SessionGate({ children }: SessionGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith('/properties') || pathname.startsWith('/api/');
    const isCustomerPath = CUSTOMER_PATHS.has(pathname);

    let cancelled = false;
    (async () => {
      if (!getSessionId()) {
        await ensureAnonymousSession();
        if (cancelled) return;
      }

      if (isPublic) {
        setValid(true);
        setReady(true);
        return;
      }

      // Validate session for customer paths
      if (isCustomerPath) {
        const result = await validateSession();
        if (cancelled) return;
        if (!result || !result.valid || result.type !== 'customer') {
          clearSession();
          setValid(false);
        } else {
          setValid(true);
        }
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
      const isCustomerPath = CUSTOMER_PATHS.has(pathname);
      const redirectTo = isCustomerPath ? '/customer' : '/login';
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
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
