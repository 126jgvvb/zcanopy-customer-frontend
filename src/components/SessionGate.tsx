'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { validateSession, getSessionId, clearSession, ensureAnonymousSession } from '@/lib/api';

const PUBLIC_PATHS = new Set(['/', '/login', '/customer', '/customer/signup', '/customer/verify', '/brokers/signup', '/brokers/verify', '/brokers/welcome', '/about', '/help', '/terms', '/payments', '/properties', '/properties/[id]', '/reels']);

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

    console.log('[SessionGate] pathname:', pathname, 'isPublic:', isPublic, 'isCustomerPath:', isCustomerPath, 'hasSessionId:', !!getSessionId());

    let cancelled = false;
    (async () => {
      // For public paths, set valid immediately regardless of session
      if (isPublic) {
        console.log('[SessionGate] Public path, setting valid=true immediately');
        setValid(true);
        setReady(true);
        return;
      }

      // Only try to get session for non-public paths
      if (!getSessionId()) {
        console.log('[SessionGate] No session ID, calling ensureAnonymousSession...');
        try {
          await ensureAnonymousSession();
        } catch (e) {
          console.log('[SessionGate] ensureAnonymousSession failed:', e);
        }
        if (cancelled) return;
        console.log('[SessionGate] ensureAnonymousSession done, sessionId:', getSessionId());
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
      // Only redirect for actual customer-only paths, not public pages like /properties
      if (isCustomerPath) {
        const redirectTo = '/customer';
        console.log('[SessionGate] Redirecting to customer login from:', pathname);
        router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
      } else {
        console.log('[SessionGate] Not redirecting for public path:', pathname);
      }
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
