"use client";

import { useEffect, useState } from "react";
import { webApi } from "@/lib/api";

const EMPTY: ReadonlySet<string> = new Set<string>();
const BOOKINGS_LIMIT = 100;

// Property cards render many at a time, so the lookup is shared at module scope
// and deduped: concurrent callers all await the same in-flight request.
let inflight: Promise<ReadonlySet<string>> | null = null;

function loadBookedPropertyIds(): Promise<ReadonlySet<string>> {
  if (inflight) return inflight;

  inflight = (async () => {
    // Only a real customer JWT is accepted by this endpoint. An anonymous
    // session id would earn a 401, and apiFetch answers that by clearing the
    // session and redirecting, so never issue the request without a token.
    const token = window.localStorage.getItem("zcanopy_token");
    if (!token) return EMPTY;

    try {
      const res = await webApi.customer.getBookings(token, 1, BOOKINGS_LIMIT);
      const bookings = res?.bookings ?? [];
      return new Set(
        bookings
          .map((b: { propertyId?: string }) => String(b?.propertyId ?? ""))
          .filter(Boolean),
      );
    } catch {
      // Fail closed: a location lookup that cannot be confirmed stays hidden.
      return EMPTY;
    }
  })();

  return inflight;
}

export function invalidateBookedPropertyIds() {
  inflight = null;
}

export function useBookedPropertyIds(): { ids: ReadonlySet<string>; ready: boolean } {
  const [ids, setIds] = useState<ReadonlySet<string>>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadBookedPropertyIds().then((result) => {
      if (!active) return;
      setIds(result);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ids, ready };
}