import { decryptResponse } from "@/lib/crypto";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export const SESSION_STORAGE_KEY = "zcanopy_session_id";
export const SESSION_USER_KEY = "zcanopy_user";
export const SESSION_ROLE_KEY = "zcanopy_role";
export const DEVICE_ID_KEY = "zcanopy_device_id";
export const COOKIE_CONSENT_KEY = "zcanopy_cookie_consent";

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
  const token = window.localStorage.getItem('zcanopy_token');
  if (token) return token;
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
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  }
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
  console.log('[apiFetch] Building URL:', url.toString());
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function getUserFriendlyMessage(message: string, status: number, path: string): string {
    const msg = message.toLowerCase();
    const isAuthPath = path.includes('/confirm-otp') || path.includes('/register') || path.includes('/login') || path.includes('/verify');
    const isOtpPath = path.includes('/confirm-otp') || path.includes('/otp');

    // Handle specific backend error messages
    if (msg.includes('service unavailable') || msg.includes('not found') && status === 404) {
      if (isOtpPath) {
        return 'The OTP is either expired or does not exist. Please request a new one.';
      }
      if (isAuthPath) {
        return 'Unable to process your request at the moment. Please try again in a few moments.';
      }
      return 'Service temporarily unavailable. Please try again shortly.';
    }

    if (msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('token expired')) {
      return 'Your session has expired. Please sign in again.';
    }

    if (msg.includes('forbidden') || msg.includes('access denied')) {
      return 'You do not have permission to perform this action.';
    }

    if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate') || msg.includes('conflict')) {
      if (isAuthPath && path.includes('/register')) {
        return 'An account with this email already exists. Please sign in instead.';
      }
      return 'This information is already in use. Please try a different value.';
    }

    if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
      if (isOtpPath) {
        return 'The OTP is either expired or does not exist. Please request a new one.';
      }
      if (path.includes('/login')) {
        return 'Invalid credentials. Please check your details and try again.';
      }
      return 'Invalid input. Please check your details and try again.';
    }

    if (msg.includes('expired') || msg.includes('not exist')) {
      if (isOtpPath) {
        return 'The OTP is either expired or does not exist. Please request a new one.';
      }
      return 'This session has expired. Please try again.';
    }

    if (status >= 500) {
      return 'Unable to process your request at the moment. Please try again in a few moments.';
    }

    if (status === 0) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }

    // Return original message if no specific mapping
    return message;
  }

function shouldUseFallback(err: unknown): boolean {
  if (!(err instanceof ApiError)) return true;
  return err.status >= 500 || err.status === 0;
}

export type AuthErrorKind = 'credentials' | 'network' | 'server' | 'unknown';

const CREDENTIAL_HINTS = [
  'invalid',
  'incorrect',
  'wrong',
  'unauthorized',
  'not found',
  'does not exist',
  'deactivated',
  'not verified',
  'no such',
];

// apiFetch rewrites every 401 into "Session expired" after clearing the session.
// On a sign-in form that wording is wrong, so it must not reach the user.
const SESSION_EXPIRED = 'session expired';

export function classifyAuthError(err: unknown): AuthErrorKind {
  if (err instanceof ApiError) {
    if (err.status >= 500) return 'server';
    if (err.status === 0) return 'network';
    if (err.status === 401 || err.status === 403) return 'credentials';
    const msg = err.message.toLowerCase();
    if (CREDENTIAL_HINTS.some((hint) => msg.includes(hint))) return 'credentials';
    return 'unknown';
  }
  // fetch rejects with a TypeError when the host is unreachable, DNS fails,
  // the device is offline, or a CORS preflight is blocked.
  if (err instanceof TypeError) return 'network';
  return 'unknown';
}

export function authErrorMessage(err: unknown, subject = 'email or password'): string {
  const kind = classifyAuthError(err);
  if (kind === 'network') {
    return "Unable to reach our servers. Please check your internet connection and try again.";
  }
  if (kind === 'server') {
  //  return 'Our servers are unavailable right now. Please try again in a few moments.';
  return 'Your credentials might be incorrect or the server might be down. Please try again.';  
}
  if (kind === 'credentials') {
    const raw = err instanceof ApiError ? err.message : '';
    if (!raw || raw.toLowerCase().includes(SESSION_EXPIRED)) {
      return `Invalid ${subject}. Please check your details and try again.`;
    }
    return raw;
  }
  return err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.';
}

export async function apiFetch<T = unknown>(
  path: string,
  {
    method = "GET",
    body,
    token,
    sessionId: _sessionId,
    query,
    fallback,
    skipSessionHeader: _skipSessionHeader,
  }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log('[apiFetch] Request:', method, path, 'token?', !!token, 'skipSessionHeader?', _skipSessionHeader);

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    console.log('[apiFetch] Response status:', res.status, 'for', path);

    let data: Record<string, unknown> | string | null = null;
    const text = await res.text();
    console.log('[apiFetch] Raw response text', text);
    if (text) {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        console.log('[apiFetch] Parsed response', parsed);
        data = parsed.encrypted ? await decryptResponse(parsed) : parsed;
        console.log('[apiFetch] Final data after decrypt/parse', data);
      } catch {
        data = text;
        console.log('[apiFetch] Non-JSON response', data);
      }
    }

    if (res.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/customer")) {
        window.location.href = "/customer";
      }
      throw new ApiError("Session expired", 401);
    }

    if (!res.ok) {
      const rawMessage =
        (data && typeof data === "object" && ((data as Record<string, unknown>).message || (data as Record<string, unknown>).error)) ||
        `Request failed with status ${res.status}`;
      const friendlyMessage = getUserFriendlyMessage(rawMessage as string, res.status, path);
      throw new ApiError(friendlyMessage, res.status);
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
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('zcanopy_token') : null;
  if (!token) return null;
  if (token.startsWith('dev-')) {
    return { valid: true, type: token.includes('broker') ? 'broker' : 'customer' };
  }
  try {
    return await apiFetch<{ valid: boolean; type?: string }>("/web/session/validate", {
      method: "POST",
      token,
    });
  } catch {
    return null;
  }
}

export async function ensureAnonymousSession(): Promise<string | null> {
  const existing = getSessionId();
  if (existing) return existing;

  const deviceId = getOrCreateDeviceId();
  console.log('[ensureAnonymousSession] Creating session for device:', deviceId);
  try {
    const res = await fetch(`${API_BASE}/customer/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, ttlSeconds: 60 * 60 * 24 * 7 }),
      cache: "no-store",
    });
    console.log('[ensureAnonymousSession] Response status:', res.status);
    if (!res.ok) return null;
    const raw = await res.json().catch(() => null);
    console.log('[ensureAnonymousSession] Raw response:', raw);
    const data = raw?.encrypted ? await decryptResponse(raw) : raw;
    console.log('[ensureAnonymousSession] Decrypted data:', data);
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

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

async function getUploadPresignedUrl(filename: string, contentType: string, folder = 'properties'): Promise<PresignResponse> {
  const res = await fetch(`${API_BASE}/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType, folder }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get upload URL: ${res.status}`);
  }

  const text = await res.text();
  if (!text) return { uploadUrl: '', key: '', publicUrl: '' };
  try {
    const parsed = JSON.parse(text);
    return parsed.encrypted ? await decryptResponse(parsed) : parsed;
  } catch {
    return { uploadUrl: '', key: '', publicUrl: '' };
  }
}

export async function uploadToSpaces(file: File, folder = 'properties'): Promise<string> {
  try {
    const { uploadUrl, publicUrl } = await getUploadPresignedUrl(file.name, file.type, folder);

    if (!uploadUrl) {
      throw new Error('Missing upload URL from presign response');
    }

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    return publicUrl;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return uploadToSpacesViaProxy(file, folder);
    }
    throw error;
  }
}

async function uploadToSpacesViaProxy(file: File, folder = 'properties'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload/proxy?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy upload failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.publicUrl;
}

export const webApi = {
  publicProperties: (query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/explorer", { query, skipSessionHeader: true }),

  publicPropertiesPaginated: (page: number, limit: number = 12, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number; page: number; limit: number; hasMore: boolean }>(
      "/web/public/explorer",
      { query: { page, limit, ...query }, skipSessionHeader: true },
    ),

  searchPropertiesPaginated: (q: string, page: number, limit: number = 12, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `/web/public/search`,
      { query: { q, page, limit, ...query }, skipSessionHeader: true },
    ),

  featuredProperties: (limit = 6) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/properties/featured", { query: { limit }, skipSessionHeader: true }),

  propertyDetails: async (id: string, brokerCode?: string) => {
    try {
      const data = await apiFetch<{ property: any }>(`/web/public/property-info?id=${encodeURIComponent(id)}${brokerCode ? `&brokerCode=${encodeURIComponent(brokerCode)}` : ''}`, { skipSessionHeader: true });
      const prop = (data as any)?.property || (data as any) || null;
      if (prop) return prop;
    } catch {
      // ignore and fall back
    }

    const fallbackData = await apiFetch<{ properties: any[]; total: number }>(`/web/public/explorer?id=${encodeURIComponent(id)}`, { skipSessionHeader: true });
    const properties = (fallbackData as any)?.properties || [];
    return properties.find((item: any) => String(item.id) === String(id)) || null;
  },

  searchProperties: (q: string, queryParams?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/public/search?q=${encodeURIComponent(q)}`, { skipSessionHeader: true }),

  recordSearch: (token: string | null, body: { query?: string; location?: string; radius?: number; propertyType?: string; filters?: any; resultPropertyIds?: string[]; resultCount?: number; minPrice?: number; maxPrice?: number; subCounty?: string; district?: string }) =>
    apiFetch<{ success: boolean }>("/web/customer/search/record", { method: "POST", token, body }),

  getCustomerSearches: (token: string, page = 1, limit = 10) =>
    apiFetch<{ searches: any[]; total: number }>(`/web/customer/searches?page=${page}&limit=${limit}`, { token }),

  toggleFavorite: (token: string, body: { propertyId: string; propertyTitle: string; propertyLocation?: string; brokerCode?: string; imageUrl?: string; price?: number }) =>
    apiFetch<{ favorited: boolean }>("/web/customer/favorites/toggle", { method: "POST", token, body }),

  getCustomerFavorites: (token: string, page = 1, limit = 10) =>
    apiFetch<{ favorites: any[]; total: number }>(`/web/customer/favorites?page=${page}&limit=${limit}`, { token }),

  addComment: (token: string, body: { propertyId: string; customerName: string; customerPhone: string; customerEmail?: string; comment: string; rating?: number }) =>
    apiFetch<{ success: boolean; commentId?: string }>("/web/customer/comments", { method: "POST", token, body }),

  getPropertyComments: (propertyId: string, page = 1, limit = 10) =>
    apiFetch<{ comments: any[]; total: number; averageRating: number }>(`/web/customer/properties/${propertyId}/comments?page=${page}&limit=${limit}`, { skipSessionHeader: true }),

  brokerPropertiesByCode: (brokerCode: string, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/customer/broker/${brokerCode}/properties`, { query }),

  // Unfiltered metadata for the property filter dropdowns. Note the gRPC Broker
  // message exposes `brokerBrandName`, not `brandName`.
  getBrokers: (query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ brokers: Array<{ id: string; brokerCode: string; brokerBrandName?: string; brandName?: string; username: string }>; total?: number }>("/web/public/brokers", { query, skipSessionHeader: true }),

  getLocations: () =>
    apiFetch<{ locations: Array<{ propertyId: string; title: string; location: string; postgisSpatialField: string | null; brokerCode: string; propertyType?: string }> }>("/web/public/locations", { skipSessionHeader: true }),

  createBooking: (token: string, body: unknown) =>
    apiFetch("/web/customer/bookings", { method: "POST", token, body }),

  brokerLogin: (brokerCode: string, password: string, email?: string) =>
    apiFetch<{ id: string; username: string; email: string; role: string; brokerCode: string; sessionId?: string; sessionToken?: string; token?: string }>(
      "/web/auth/broker/login",
      {
        method: "POST",
        body: { brokerCode, password, email, deviceId: "web-dashboard" },
        skipSessionHeader: true,
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
      { method: "POST", body: payload, skipSessionHeader: true },
    ),

  sendBrokerOtp: (email: string, phoneNumber: string) =>
    apiFetch("/broker/otp/send", { method: "POST", body: { email, phoneNumber }, skipSessionHeader: true }),

  verifyBrokerOtp: (email: string, phoneNumber: string, emailCode: string, phoneCode: string) =>
    apiFetch("/broker/otp/verify", {
      method: "POST",
      body: { email, phoneNumber, emailCode, phoneCode },
      skipSessionHeader: true,
    }),

customer: {
    register: (body: { email: string; password: string; firstName?: string; lastName?: string; phoneNumber?: string }) =>
      apiFetch<{ success: boolean; message: string; customerId?: string }>("/web/customer/register", { method: "POST", body, skipSessionHeader: true }),

    login: (body: { email: string; password: string }) =>
      apiFetch<{ success: boolean; message: string; customer?: any; session?: any }>("/web/customer/login", { method: "POST", body, skipSessionHeader: true }),

    loginGoogle: (body: { googleId: string; email?: string; firstName?: string; lastName?: string }) =>
      apiFetch<{ success: boolean; message: string; customer?: any; session?: any }>("/web/customer/login/google", { method: "POST", body, skipSessionHeader: true }),

    sendForgotPasswordOtp: (body: { email: string }) =>
      apiFetch<{ success: boolean; message: string }>("/customer/forgot-password/otp/send", { method: "POST", body, skipSessionHeader: true }),

    verifyForgotPasswordOtp: (body: { email: string; otp: string }) =>
      apiFetch<{ success: boolean; message: string; valid: boolean }>("/customer/forgot-password/otp/verify", { method: "POST", body, skipSessionHeader: true }),

    resetPassword: (body: { email: string; password: string }) =>
      apiFetch<{ success: boolean; message: string }>("/customer/forgot-password/reset", { method: "POST", body, skipSessionHeader: true }),

    confirmOtp: (body: { email: string; otpCode: string }) =>
      apiFetch<{ success: boolean; message: string; session?: any }>("/web/customer/confirm-otp", { method: "POST", body, skipSessionHeader: true }),

    updatePhone: (token: string, phoneNumber: string) =>
      apiFetch<{ success: boolean; message: string }>("/web/customer/profile/phone", { method: "PUT", token, body: { phoneNumber } }),

    getProfile: (token: string) =>
      apiFetch<any>("/web/customer/profile", { token }),

    getWallet: (token: string) =>
      apiFetch<{ balance?: number; currency?: string; walletId?: string }>("/web/customer/wallet", { token }),

    logout: (token: string) =>
      apiFetch<{ success: boolean }>("/web/customer/logout", { method: "POST", token }),

    unsubscribe: (token: string) =>
      apiFetch<{ success: boolean; message: string }>("/web/customer/unsubscribe", { method: "POST", token }),

    videoTours: (query?: Record<string, string | number | boolean | undefined>) =>
      apiFetch<{ properties: any[]; total: number; videoCount: number }>("/web/customer/video-tours", { query, skipSessionHeader: true }),

    allProperties: (query?: Record<string, string | number | boolean | undefined>) =>
      apiFetch<{ properties: any[]; total: number }>("/web/customer/all-properties", { query, skipSessionHeader: true }),

    explorer: (query?: Record<string, string | number | boolean | undefined>) =>
      apiFetch<{ properties: any[]; total: number; videoCount: number }>("/web/public/explorer", { query, skipSessionHeader: true }),

    getPropertyDetails: (propertyId: string) =>
      apiFetch<any>(`/web/customer/properties?propertyId=${encodeURIComponent(propertyId)}`, { skipSessionHeader: true }),

    getSimilarProperties: (propertyId: string) =>
      apiFetch<{ properties: any[]; total: number }>(`/web/customer/properties/similar?propertyId=${encodeURIComponent(propertyId)}`, { skipSessionHeader: true }),

    getTransactions: (token: string, page = 1, limit = 10) =>
      apiFetch<{ transactions: any[]; total: number }>(`/web/customer/transactions?page=${page}&limit=${limit}`, { token }),

    getBookings: (token: string, page = 1, limit = 10) =>
      apiFetch<{ bookings: any[]; total: number; count?: number }>(`/web/customer/bookings?page=${page}&limit=${limit}`, { token }),

    getInvoices: (token: string, page = 1, limit = 10) =>
      apiFetch<{ invoices: any[]; total: number }>(`/web/customer/invoices?page=${page}&limit=${limit}`, { token }),

    getMessages: (token: string, page = 1, limit = 10) =>
      apiFetch<{ messages: any[]; total: number }>(`/web/customer/messages?page=${page}&limit=${limit}`, { token }),

    getNotifications: (token: string, page = 1, limit = 20) =>
      apiFetch<{ notifications: any[]; total: number; unreadCount: number }>(`/web/customer/notifications?page=${page}&limit=${limit}`, { token }),

    initiateTransaction: (token: string, body: { phoneNumber: string; email: string; customerName?: string; propertyId?: string; reason?: string; amount?: number }) =>
      apiFetch<{ success: boolean; message: string; transactionCode?: string }>("/web/customer/transactions/initiate", { method: "POST", token, body }),

    recordSearch: (token: string, body: { query?: string; location?: string; radius?: number; propertyType?: string; minPrice?: number; maxPrice?: number; subCounty?: string; district?: string; hadResults?: boolean; resultPropertyIds?: string[]; resultCount?: number }) =>
      apiFetch<{ success: boolean }>("/web/customer/search/record", { method: "POST", token, body }),

    getSearches: (token: string, page = 1, limit = 10) =>
      apiFetch<{ searches: any[]; total: number }>(`/web/customer/searches?page=${page}&limit=${limit}`, { token }),

    // Admin wallet withdrawal OTP
    sendAdminWithdrawalOtp: (token: string, body: { email: string; amount: number; walletType?: string }) =>
      apiFetch<{ success: boolean; message: string; expiresIn: number }>("/web/admin/wallet/send-otp", { method: "POST", token, body }),

    verifyAdminWithdrawalOtp: (token: string, body: { email: string; otp: string }) =>
      apiFetch<{ success: boolean; message: string; valid: boolean }>("/web/admin/wallet/verify-otp", { method: "POST", token, body }),

    adminWithdraw: (token: string, body: { amount: number; phoneNumber: string; provider: 'MTN' | 'AIRTEL'; payeeName?: string; payeeEmail?: string; externalId?: string; payerNote?: string; payeeNote?: string; currency?: string }) =>
      apiFetch<{ success: boolean; message: string; transactionId?: string; referenceNumber?: string; status?: string; netAmount?: number }>("/web/admin/wallet/withdraw", { method: "POST", token, body }),
  },
};
