import { decryptResponse } from "@/lib/crypto";

/**
 * Server-side access to the ZCanopy API gateway.
 *
 * The browser client (src/lib/api.ts) always talks to the gateway with
 * `cache: "no-store"` because the responses are personalised. For the pages
 * that are rendered on the server we want the opposite: a shared, cached
 * fetch so the HTML can be prerendered (SSG/ISR) and served fast.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export interface ServerFetchOptions {
  query?: Record<string, string | number | boolean | undefined>;
  /** Seconds to cache the response for. 0 disables caching. */
  revalidate?: number;
  /** Cache tags, so the route can be revalidated on demand. */
  tags?: string[];
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
}

function buildUrl(path: string, query?: ServerFetchOptions["query"]): string {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Fetches public data from the gateway on the server.
 *
 * Returns `null` instead of throwing when the gateway is unreachable or
 * answers with an error: a page should still render (just without the
 * server-side data) rather than 500.
 */
export async function serverFetch<T = unknown>(
  path: string,
  { query, revalidate = 60, tags, timeoutMs = 8000 }: ServerFetchOptions = {},
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(buildUrl(path, query), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      ...(revalidate > 0
        ? { next: { revalidate, ...(tags ? { tags } : {}) } }
        : { cache: "no-store" as const }),
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    const parsed = JSON.parse(text) as Record<string, unknown>;
    const data = parsed.encrypted ? await decryptResponse(parsed) : parsed;
    return data as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
