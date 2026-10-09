import useSWR from "swr";
import { webApi, getSessionId } from "@/lib/api";

export type CustomerSummary = {
  notifications: number;
  bookings: number;
  transactions: number;
};

function makeKey(token: string | null | undefined) {
  return token ? ["customer-summary", token] : null;
}

async function fetchSummary(key: [string, string]): Promise<CustomerSummary> {
  const token = key[1];
  const [notifRes, bookingRes, txnRes] = await Promise.all([
    webApi.customer.getNotifications(token, 1, 20),
    webApi.customer.getBookings(token, 1, 10),
    webApi.customer.getTransactions(token, 1, 10),
  ]);
  return {
    notifications: notifRes.unreadCount || 0,
    bookings: bookingRes.count ?? bookingRes.total ?? 0,
    transactions: txnRes.total || 0,
  };
}

/**
 * Cached customer summary used by the sidebar badges. SWR keeps the counts
 * in a shared cache keyed by the session token, so navigating between tabs
 * never refetches unless the token changes or the cache expires.
 */
export function useCustomerSummary(token: string | null | undefined) {
  const key = makeKey(token);
  const { data, error, isLoading, mutate } = useSWR(key, fetchSummary, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    fallbackData: { notifications: 0, bookings: 0, transactions: 0 } as CustomerSummary,
  });

  return {
    summary: data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useSessionToken() {
  if (typeof window === "undefined") return null;
  return getSessionId();
}