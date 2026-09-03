import { mockData } from "@/lib/mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

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
  query?: Record<string, string | number | boolean | undefined>;
  fallback?: unknown;
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
  { method = "GET", body, token, query, fallback }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

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

export const webApi = {
  publicProperties: (query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/properties", { query, fallback: mockData.properties() }),

  featuredProperties: (limit = 6) =>
    apiFetch<{ properties: any[]; total: number }>("/web/public/properties/featured", { query: { limit }, fallback: mockData.featuredProperties() }),

  propertyDetails: (id: string) =>
    apiFetch<{ property: any }>(`/web/public/properties/${id}`, { fallback: mockData.propertyDetails(id) }),

  searchProperties: (q: string) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/public/search?q=${encodeURIComponent(q)}`, { fallback: mockData.search(q) }),

  brokerPropertiesByCode: (brokerCode: string, query?: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{ properties: any[]; total: number }>(`/web/customer/broker/${brokerCode}/properties`, { query, fallback: mockData.brokerProperties() }),

  createBooking: (token: string, body: unknown) =>
    apiFetch("/web/customer/bookings", { method: "POST", token, body, fallback: { success: true, booking: { id: "mock-booking-1", status: "pending" } } }),

  brokerLogin: (brokerCode: string, password: string, email?: string) =>
    apiFetch<{ id: string; username: string; email: string; role: string; brokerCode: string; token: string }>(
      "/web/auth/broker/login",
      { method: "POST", body: { brokerCode, password, email, deviceId: "web-dashboard" }, fallback: { id: "brk-mock-1", username: "Demo Broker", email: "broker@example.com", role: "broker", brokerCode, token: "mock-token-broker" } },
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
      { method: "POST", body: payload, fallback: { brokerId: "brk-mock-1", email: payload.email, phoneNumber: payload.phoneNumber, brokerCode: payload.email } },
    ),

  sendBrokerOtp: (email: string, phoneNumber: string) =>
    apiFetch("/broker/otp/send", { method: "POST", body: { email, phoneNumber }, fallback: { success: true, message: "OTP sent (mock)", devCode: "123456" } }),

  verifyBrokerOtp: (email: string, phoneNumber: string, emailCode: string, phoneCode: string) =>
    apiFetch("/broker/otp/verify", {
      method: "POST",
      body: { email, phoneNumber, emailCode, phoneCode },
      fallback: { success: true, message: "Verified (mock)" },
    }),
};
