'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Hourglass, ShieldCheck, Undo2 } from 'lucide-react';
import { webApi, getSessionId } from '@/lib/api';

interface CustomerBookingsContentProps {
  token?: string;
}

interface Booking {
  id: string;
  propertyId?: string;
  propertyTitle: string;
  customerName: string;
  date: string;
  status?: string;
  amount: number;
  location?: string;
  bookingCode?: string;
  transactionCode?: string;
  escrowEnabled?: boolean;
  escrowDays?: number;
  escrowEndsAt?: string;
  escrowAmount?: number;
  fundsReleased?: boolean;
  fundsReversed?: boolean;
}

const PAST_STATUSES = ['released', 'declined', 'reversed'];

/** Default escrow timeframe (in days) suggested on the customer's booking. */
const DEFAULT_ESCROW_DAYS = 1;

function normalizeStatus(status?: string) {
  return (status || 'pending').toLowerCase();
}

function statusBadgeClass(status?: string) {
  const normalized = normalizeStatus(status);
  if (normalized === 'approved') return 'bg-green-100 text-green-800';
  if (normalized === 'reversed') return 'bg-blue-100 text-blue-800';
  if (normalized === 'released' || normalized === 'declined') return 'bg-gray-100 text-gray-700';
  return 'bg-orange-100 text-orange-800';
}

function escrowBadgeClass(booking: Booking) {
  if (booking.fundsReversed || normalizeStatus(booking.status) === 'reversed') {
    return 'border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] text-[var(--zcanopy-muted)]';
  }
  if (booking.fundsReleased) {
    return 'border border-[var(--zcanopy-primary)]/35 bg-[var(--zcanopy-primary)]/10 text-[var(--zcanopy-primary-alt)] dark:border-[var(--zcanopy-accent-gold)]/40 dark:bg-[var(--zcanopy-accent-gold)]/15 dark:text-[var(--zcanopy-accent-gold)]';
  }
  return 'border border-[var(--zcanopy-accent-gold)]/45 bg-[var(--zcanopy-accent-gold)]/15 text-[var(--zcanopy-primary-alt)] dark:border-[var(--zcanopy-accent-gold)]/45 dark:bg-[var(--zcanopy-accent-gold)]/15 dark:text-[var(--zcanopy-accent-gold)]';
}

/** Ticking clock shared by every countdown. Null until mounted so the
 * server-rendered HTML never disagrees with the first client render. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function EscrowCountdown({ endsAt, now }: { endsAt: string; now: number | null }) {
  if (now === null) return null;
  const remaining = new Date(endsAt).getTime() - now;
  if (Number.isNaN(remaining)) return null;

  const expired = remaining <= 0;
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="mt-3 rounded-xl border border-dashed border-[var(--zcanopy-accent-gold)]/50 bg-[var(--zcanopy-accent-gold)]/10 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--zcanopy-primary-alt)] dark:text-[var(--zcanopy-accent-gold)]">
        Escrow countdown — funds return to you at zero
      </p>
      {expired ? (
        <p className="mt-1 text-sm font-semibold text-[var(--zcanopy-card-brown)] dark:text-[var(--zcanopy-accent-gold)]">
          Expired — the held funds are being sent back to your phone number.
        </p>
      ) : (
        <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[var(--zcanopy-card-brown)] dark:text-[var(--zcanopy-accent-gold)]">
          {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
        </p>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  now,
  token,
  onChanged,
}: {
  booking: Booking;
  now: number | null;
  token: string;
  onChanged: () => void;
}) {
  const status = normalizeStatus(booking.status);
  const isPast = PAST_STATUSES.includes(status);
  const fundsReleased = !!booking.fundsReleased;
  const fundsReversed = !!booking.fundsReversed || status === 'reversed';

  // Only escrow-era bookings (created after the escrow rollout) carry these
  // fields; legacy bookings render exactly as before.
  const hasEscrow = !!(
    booking.bookingCode &&
    (booking.escrowEndsAt || (booking.escrowAmount || 0) > 0 || fundsReleased || fundsReversed)
  );
  // A booking that still holds escrow money is releasable even if its status
  // was closed (e.g. the broker re-listed the property): the customer never
  // approved, so the funds have not moved and the customer must be able to
  // release them here.
  const escrowActive = hasEscrow && !fundsReleased && !fundsReversed;
  const countdownOn = !!booking.escrowEnabled && !!booking.escrowEndsAt;

  const [daysValue, setDaysValue] = useState(String(booking.escrowDays || DEFAULT_ESCROW_DAYS));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setDaysValue(String(booking.escrowDays || DEFAULT_ESCROW_DAYS));
  }, [booking.escrowDays]);

  async function updateEscrow(next: { escrowEnabled: boolean; escrowDays?: number }) {
    if (!booking.bookingCode) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await webApi.customer.updateBookingEscrow(token, booking.bookingCode, {
        escrowEnabled: next.escrowEnabled,
        escrowDays: next.escrowDays ?? Math.max(1, Math.min(365, Number(daysValue) || DEFAULT_ESCROW_DAYS)),
      });
      setNotice(res?.message || 'Escrow settings updated');
      onChanged();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to update escrow settings');
    } finally {
      setBusy(false);
    }
  }

  async function releaseFunds() {
    if (!booking.bookingCode) return;
    if (!window.confirm('Release the held funds to the broker? This approves the booking and cannot be undone.')) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await webApi.customer.releaseBookingFunds(token, booking.bookingCode);
      setNotice(res?.message || 'Funds released');
      onChanged();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to release funds');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.propertyTitle}</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{new Date(booking.date).toLocaleDateString()}</p>
          {!isPast && booking.location ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{booking.location}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {Number(booking.amount).toLocaleString()}</p>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(booking.status)}`}>
              {status}
            </span>
          </div>
          {booking.propertyId ? (
            <Link
              href={`/properties/${booking.propertyId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--zcanopy-surface)] px-3 py-2 text-xs font-semibold text-[var(--zcanopy-card-brown)] transition-colors hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
            >
              <Eye size={14} />
              View property
            </Link>
          ) : null}
        </div>
      </div>

      {hasEscrow ? (
        <div className="mt-4 rounded-xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${escrowBadgeClass(booking)}`}>
              {fundsReversed ? <Undo2 size={13} /> : fundsReleased ? <ShieldCheck size={13} /> : <Hourglass size={13} />}
              {fundsReversed ? 'Funds returned to you' : fundsReleased ? 'Funds released to broker' : 'Funds held in escrow'}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--zcanopy-muted)' }}>
              UGX {Number(booking.escrowAmount || booking.amount || 0).toLocaleString()} held
            </span>
          </div>

          {fundsReversed ? (
            <p className="mt-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
              The escrow countdown expired, so the held funds were sent back to your phone number.
            </p>
          ) : fundsReleased ? (
            <p className="mt-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
              You approved this booking, so the held funds were moved to the broker&apos;s withdrawable wallet.
            </p>
          ) : countdownOn && booking.escrowEndsAt ? (
            <EscrowCountdown endsAt={booking.escrowEndsAt} now={now} />
          ) : (
            <p className="mt-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
              Countdown is off — the funds stay held until you release them.
            </p>
          )}

          {escrowActive && booking.bookingCode ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={releaseFunds}
                  disabled={busy}
                  className="rounded-xl bg-[var(--zcanopy-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve &amp; release funds
                </button>
                <button
                  type="button"
                  onClick={() => updateEscrow({ escrowEnabled: !countdownOn })}
                  disabled={busy}
                  className="rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--zcanopy-card-brown)] transition-colors hover:border-[var(--zcanopy-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {countdownOn ? 'Turn countdown off' : 'Turn countdown on'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
                <label htmlFor={`escrow-days-${booking.id}`} className="font-medium">
                  Timeframe (days):
                </label>
                <input
                  id={`escrow-days-${booking.id}`}
                  type="number"
                  min={1}
                  max={365}
                  value={daysValue}
                  onChange={(e) => setDaysValue(e.target.value)}
                  disabled={busy}
                  className="w-20 rounded-lg border border-[var(--zcanopy-border)] bg-white px-2 py-1 text-xs text-[var(--zcanopy-card-brown)] dark:bg-[var(--zcanopy-surface)]"
                />
                <button
                  type="button"
                  onClick={() => updateEscrow({ escrowEnabled: true, escrowDays: Math.max(1, Math.min(365, Number(daysValue) || DEFAULT_ESCROW_DAYS)) })}
                  disabled={busy}
                  className="rounded-lg border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--zcanopy-card-brown)] transition-colors hover:border-[var(--zcanopy-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update timeframe
                </button>
              </div>
            </div>
          ) : null}

          {notice ? (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--zcanopy-primary)' }}>{notice}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

async function fetchBookings(key: [string, string]) {
  const t = key[1];
  return webApi.customer.getBookings(t, 1, 20);
}

export default function CustomerBookingsContent({ token }: CustomerBookingsContentProps) {

    const router = useRouter();
    useEffect(() => {
      // Opened directly as a route there is no token, so the content cannot
      // load. Send the customer into the portal, which resolves the session.
      if (!token) router.replace('/customer?view=bookings');
    }, [token, router]);
  const effectiveToken = token || getSessionId() || '';
  const key = effectiveToken ? ['customer-bookings', effectiveToken] : null;
  const now = useNow();

  const { data, error, isLoading, mutate } = useSWR(key, fetchBookings, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    fallbackData: { bookings: [] as Booking[], total: 0, count: 0 },
  });

  const bookings = data?.bookings || [];
  // A past-status booking that still holds escrow money is not really past:
  // the customer has not released the funds, so keep it in the active list
  // where the release action lives.
  const holdsEscrow = (booking: Booking) =>
    !!booking.bookingCode &&
    (booking.escrowAmount || 0) > 0 &&
    !booking.fundsReleased &&
    !booking.fundsReversed;
  const activeBookings = bookings.filter(
    (booking) => !PAST_STATUSES.includes(normalizeStatus(booking.status)) || holdsEscrow(booking),
  );
  const pastBookings = bookings.filter(
    (booking) =>
      PAST_STATUSES.includes(normalizeStatus(booking.status)) && !holdsEscrow(booking),
  );
  const refresh = () => {
    mutate();
  };

  // Once a live countdown reaches zero the escrow is swept on the server and
  // the funds are returned to the customer. Refetch so the list reflects the
  // new state instead of a stale "refund in progress" label.
  const expiredCountdownRef = useRef(false);
  useEffect(() => {
    const live = bookings.filter(
      (b) =>
        b.escrowEnabled &&
        b.escrowEndsAt &&
        !b.fundsReleased &&
        !b.fundsReversed &&
        new Date(b.escrowEndsAt).getTime() <= Date.now(),
    );
    if (live.length > 0 && !expiredCountdownRef.current) {
      expiredCountdownRef.current = true;
      mutate();
    } else if (live.length === 0) {
      expiredCountdownRef.current = false;
    }
  }, [bookings, mutate]);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Bookings</h2>
      <p className="mt-1 max-w-2xl text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
        Booking payments are held in escrow for the broker until you approve them. If the countdown hits zero before you
        approve, the funds are automatically returned to your phone number.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load bookings'}</p>}
      {!bookings.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No bookings found.</p>
      ) : (
        <div className="mt-6 space-y-8">
          {activeBookings.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Active bookings</h3>
              <div className="mt-3 max-h-[32rem] space-y-4 overflow-y-auto pr-1">
                {activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} now={now} token={effectiveToken} onChanged={refresh} />
                ))}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Past bookings</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{pastBookings.length}</span>
              </div>
              <p className="mt-2 max-w-2xl text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
                Bookings that are no longer active — revoked by the broker after an unsuccessful negotiation, or reversed
                with the funds sent back to you after the escrow countdown expired.
              </p>
              <div className="mt-3 max-h-[32rem] space-y-4 overflow-y-auto pr-1">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} now={now} token={effectiveToken} onChanged={refresh} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
