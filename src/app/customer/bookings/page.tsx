'use client';

import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

interface CustomerBookingsContentProps {
  token: string;
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

export default function CustomerBookingsContent({ token }: CustomerBookingsContentProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings(token);
  }, [token]);

  const loadBookings = async (token: string) => {
    try {
      const result = await webApi.customer.getBookings(token, 1, 20);
      setBookings(result.bookings || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  const displayBookings = bookings.length > 0 ? bookings : mockData.bookings().bookings;

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Bookings</h2>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!displayBookings.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No bookings found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.propertyTitle}</p>
                  <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {Number(booking.amount).toLocaleString()}</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    booking.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {booking.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
