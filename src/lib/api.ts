import { mockData } from "@/lib/mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

const SESSION_STORAGE_KEY = "zcanopy_session_id";
const SESSION_USER_KEY = "zcanopy_user";
const SESSION_ROLE_KEY = "zcanopy_role";
const DEVICE_ID_KEY = "zcanopy_device_id";
const COOKIE_CONSENT_KEY = "zcanopy_cookie_consent";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "ssr-device";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as Crypto).randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof window === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(nameEQ)) {
      return c.substring(nameEQ.length);
    }
  }
  return null;
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const cookieSession = getCookie(SESSION_STORAGE_KEY);
  if (cookieSession) return cookieSession;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setSession(sessionId: string, user?: unknown, role?: string) {
  if (typeof window === "undefined") return;
  setCookie(SESSION_STORAGE_KEY, sessionId, 30);
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  if (user !== undefined) {
    window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  }
  if (role) {
    window.localStorage.setItem(SESSION_ROLE_KEY, role);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  setCookie(SESSION_STORAGE_KEY, "", -1);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_USER_KEY);
  window.localStorage.removeItem(SESSION_ROLE_KEY);
}

export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  return getCookie(COOKIE_CONSENT_KEY) === "true";
}

export function setCookieConsent() {
  setCookie(COOKIE_CONSENT_KEY, "true", 365);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  sessionId?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
  fallback?: unknown;
  skipSessionHeader?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
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

function shouldUseFallback(err: unknown): boolean {
  if (!(err instanceof ApiError)) return true;
  return err.status >= 500 || err.status === 0;
}

export async function apiFetch<T = unknown>(
  path: string,
  {
    method = "GET",
    body,
    token,
    sessionId,
    query,
    fallback,
    skipSessionHeader = false,
  }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resolvedSessionId = sessionId ?? getSessionId();
  if (!skipSessionHeader && resolvedSessionId) {
    headers["x-session-id"] = resolvedSessionId;
  }

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    let data: Record<string, unknown> | string | null = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = text;
      }
    }

    if (res.status === 401 && !skipSessionHeader) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired", 401);
    }

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && ((data as Record<string, unknown>).message || (data as Record<string, unknown>).error)) ||
        `Request failed with status ${res.status}`;
      throw new ApiError(message as string, res.status);
    }

    return data as T;
  } catch (err) {
    if (fallback !== undefined && shouldUseFallback(err)) {
      if (typeof console !== "undefined") {
        console.warn(
          `[api] Server request to "${path}" failed (${err instanceof ApiError ? err.status : "network error"}). Falling back to mock data.`,
        );
      }
      return fallback as T;
    }
    throw err;
  }
}

export async function validateSession(): Promise<{ valid: boolean; type?: string; [k: string]: unknown } | null> {
  const sessionId = getSessionId();
  if (!sessionId) return null;
  try {
    return await apiFetch<{ valid: boolean; type?: string }>("/web/session/validate", {
      method: "POST",
      sessionId,
      skipSessionHeader: true,
    });
  } catch {
    return null;
  }
}

export async function ensureAnonymousSession(): Promise<string | null> {
  const existing = getSessionId();
  if (existing) return existing;

  const deviceId = getOrCreateDeviceId();
  try {
    const res = await fetch(`${API_BASE}/customer/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, ttlSeconds: 60 * 60 * 24 * 7 }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const sessionId =
      data?.sessionId ||
      data?.sessionToken ||
      data?.token ||
      null;
    if (sessionId && typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      window.localStorage.setItem(SESSION_ROLE_KEY, "customer");
      setCookie(SESSION_STORAGE_KEY, sessionId, 30);
    }
    return sessionId;
  } catch {
    return null;
  }
}

export const webApi = {
  publicProperties: (query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/properties", { query, fallback: mockData.properties(), skipSessionHeader: true }),

  publicPropertiesPaginated: (page: number, limit: number = 12, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number; page: number; limit: number; hasMore: boolean }>(
      "/web/public/properties",
      { query: { page, limit, ...query }, fallback: { properties: mockData.properties().properties, total: 0, page, limit, hasMore: false }, skipSessionHeader: true },
    ),

  searchPropertiesPaginated: (q: string, page: number, limit: number = 12) =>
    apiFetch<{ properties: any[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `/web/public/search`,
      { query: { q, page, limit }, fallback: { properties: mockData.search(q).properties, total: 0, page, limit, hasMore: false }, skipSessionHeader: true },
    ),

  featuredProperties: (limit = 6) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/properties/featured", { query: { limit }, fallback: mockData.featuredProperties(), skipSessionHeader: true }),

  propertyDetails: (id: string) =>
    apiFetch<{ property: any }>(`/web/public/properties/${id}`, { fallback: mockData.propertyDetails(id), skipSessionHeader: true }),

  searchProperties: (q: string) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/public/search?q=${encodeURIComponent(q)}`, { fallback: mockData.search(q), skipSessionHeader: true }),

  recordSearch: (body: { sessionToken?: string; query?: string; location?: string; radius?: number; propertyType?: string; filters?: any; resultPropertyIds?: string[]; resultCount?: number; minPrice?: number; maxPrice?: number; subCounty?: string; district?: string }) =>
    apiFetch<{ success: boolean }>("/web/customer/search/record", { method: "POST", body, fallback: { success: true } }),

  getCustomerSearches: (sessionToken: string, page = 1, limit = 10) =>
    apiFetch<{ searches: any[]; total: number }>(`/web/customer/searches?page=${page}&limit=${limit}`, { sessionId: sessionToken, fallback: { searches: [], total: 0 } }),

  toggleFavorite: (body: { sessionToken: string; propertyId: string; propertyTitle: string; propertyLocation?: string; brokerCode?: string; imageUrl?: string; price?: number }) =>
    apiFetch<{ favorited: boolean }>("/web/customer/favorites/toggle", { method: "POST", body, fallback: { favorited: false } }),

  getCustomerFavorites: (sessionToken: string, page = 1, limit = 10) =>
    apiFetch<{ favorites: any[]; total: number }>(`/web/customer/favorites?page=${page}&limit=${limit}`, { sessionId: sessionToken, fallback: { favorites: [], total: 0 } }),

  addComment: (body: { sessionToken: string; propertyId: string; customerName: string; customerPhone: string; customerEmail?: string; comment: string; rating?: number }) =>
    apiFetch<{ success: boolean; commentId?: string }>("/web/customer/comments", { method: "POST", body, fallback: { success: false } }),

  getPropertyComments: (propertyId: string, page = 1, limit = 10) =>
    apiFetch<{ comments: any[]; total: number; averageRating: number }>(`/web/customer/properties/${propertyId}/comments?page=${page}&limit=${limit}`, { fallback: { comments: [], total: 0, averageRating: 0 } }),

  brokerPropertiesByCode: (brokerCode: string, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/customer/broker/${brokerCode}/properties`, { query, fallback: mockData.brokerProperties(), skipSessionHeader: true }),

  createBooking: (token: string, body: unknown) =>
    apiFetch("/web/customer/bookings", { method: "POST", token, body, fallback: { success: true, booking: { id: "mock-booking-1", status: "pending" } } }),

  brokerLogin: (brokerCode: string, password: string, email?: string) =>
    apiFetch<{ id: string; username: string; email: string; role: string; brokerCode: string; sessionId?: string; sessionToken?: string; token?: string }>(
      "/web/auth/broker/login",
      {
        method: "POST",
        body: { brokerCode, password, email, deviceId: "web-dashboard" },
        skipSessionHeader: true,
        fallback: { id: "brk-mock-1", username: "Demo Broker", email: "broker@example.com", role: "broker", brokerCode, sessionId: "mock-session-id", token: "mock-token-broker" },
      },
    ),

  registerBroker: (payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    idFrontUrl?: string;
    idBackUrl?: string;
  }) =>
    apiFetch<{ brokerId: string; email: string; phoneNumber: string; brokerCode: string }>(
      "/broker/register",
      { method: "POST", body: payload, skipSessionHeader: true, fallback: { brokerId: "brk-mock-1", email: payload.email, phoneNumber: payload.phoneNumber, brokerCode: payload.email } },
    ),

  sendBrokerOtp: (email: string, phoneNumber: string) =>
    apiFetch("/broker/otp/send", { method: "POST", body: { email, phoneNumber }, skipSessionHeader: true, fallback: { success: true, message: "OTP sent (mock)", devCode: "123456" } }),

  verifyBrokerOtp: (email: string, phoneNumber: string, emailCode: string, phoneCode: string) =>
    apiFetch("/broker/otp/verify", {
      method: "POST",
      body: { email, phoneNumber, emailCode, phoneCode },
      skipSessionHeader: true,
      fallback: { success: true, message: "Verified (mock)" },
    }),
};
