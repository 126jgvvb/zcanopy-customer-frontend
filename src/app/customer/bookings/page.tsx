'use client';

  import useSWR from 'swr';
  import { webApi, getSessionId } from '@/lib/api';

  interface CustomerBookingsContentProps {
    token?: string;
  }

  interface Booking {
    id: string;
    propertyTitle: string;
    customerName: string;
    date: string;
    status?: string;
    amount: number;
    location?: string;
  }

  function normalizeStatus(status?: string) {
    return (status || 'pending').toLowerCase();
  }

  function statusBadgeClass(status?: string) {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') return 'bg-green-100 text-green-800';
    if (normalized === 'released') return 'bg-gray-100 text-gray-700';
    return 'bg-orange-100 text-orange-800';
  }

  function BookingCard({ booking }: { booking: Booking }) {
    return (
      <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.propertyTitle}</p>
            <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{new Date(booking.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {Number(booking.amount).toLocaleString()}</p>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(booking.status)}`}>
              {normalizeStatus(booking.status)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  async function fetchBookings(key: [string, string]) {
    const t = key[1];
    return webApi.customer.getBookings(t, 1, 20);
  }

  export default function CustomerBookingsContent({ token }: CustomerBookingsContentProps) {
    const effectiveToken = token || getSessionId() || '';
    const key = effectiveToken ? ['customer-bookings', effectiveToken] : null;

    const { data, error, isLoading } = useSWR(key, fetchBookings, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: { bookings: [] as Booking[], total: 0, count: 0 },
    });

    const bookings = data?.bookings || [];
    const activeBookings = bookings.filter((booking) => normalizeStatus(booking.status) !== 'released');
    const releasedBookings = bookings.filter((booking) => normalizeStatus(booking.status) === 'released');

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
        {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load bookings'}</p>}
        {!bookings.length ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No bookings found.</p>
        ) : (
          <div className="mt-6 space-y-8">
            {activeBookings.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Active bookings</h3>
                <div className="mt-3 space-y-4">
                  {activeBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {releasedBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Released bookings</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{releasedBookings.length}</span>
                </div>
                <p className="mt-2 max-w-2xl text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
                  These items were once booked but were revoked by the broker after an unsuccessful property negotiation.
                </p>
                <div className="mt-3 space-y-4">
                  {releasedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }
