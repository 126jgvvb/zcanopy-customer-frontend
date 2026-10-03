"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_DELAY = 4000;

/**
 * Sends the customer to their dashboard's "My Bookings" tab a few seconds
 * after a successful booking, giving them time to read the confirmation and
 * broker contact details first.
 *
 * The pending timer is held in a ref so closing the modal, navigating away or
 * unmounting cancels the navigation instead of firing on the next page.
 */
export function useBookingRedirect(delay = DEFAULT_DELAY) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToBookings = useCallback(() => {
    cancel();
    router.push("/customer?view=bookings");
  }, [cancel, router]);

  const schedule = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      router.push("/customer?view=bookings");
    }, delay);
  }, [cancel, delay, router]);

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel, goToBookings };
}