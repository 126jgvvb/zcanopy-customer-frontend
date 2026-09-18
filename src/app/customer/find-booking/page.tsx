'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface BookingResponse {
  booking?: {
    id: string;
    propertyId: string;
    propertyTitle: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    date: string;
    amount: number;
    transactionCode: string;
    bookingCode: string;
    reason?: string;
    status?: string;
    location: string;
  };
}

export default function FindBookingContent() {
  const [transactionCode, setTransactionCode] = useState('');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState<BookingResponse['booking'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState<'code' | 'phone'>('code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      let res: BookingResponse;
      if (method === 'code') {
        res = await apiFetch<BookingResponse>('/web/customer/bookings/retrieve', {
          method: 'POST',
          body: { code: transactionCode, phoneNumber: phone },
          skipSessionHeader: true,
        });
      } else {
        res = await apiFetch<BookingResponse>('/web/customer/bookings/retrieve-by-code', {
          method: 'POST',
          body: { bookingCode: transactionCode, customerPhone: phone },
          skipSessionHeader: true,
        });
      }
      setBooking(res.booking || null);
      if (!res.booking) {
        setError('No booking found for the provided details.');
      }
    } catch {
      setError('Failed to retrieve booking. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Find My Booking</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
        Retrieve your booking using the transaction code or the 6-digit booking code sent to you after payment.
      </p>

      <div className="mt-6 flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-1">
        <button
          type="button"
          onClick={() => setMethod('code')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            method === 'code'
              ? 'bg-[var(--zcanopy-primary)] text-white'
              : 'text-[var(--zcanopy-muted)] hover:text-[var(--zcanopy-card-brown)]'
          }`}
        >
          Transaction Code
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            method === 'phone'
              ? 'bg-[var(--zcanopy-primary)] text-white'
              : 'text-[var(--zcanopy-muted)] hover:text-[var(--zcanopy-card-brown)]'
          }`}
        >
          6-Digit Booking Code
        </button>
      </div>

       <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium" style={{ color: 'var(--zcanopy-muted)' }}>
            {method === 'code' ? 'Transaction Code' : 'Booking Code'}
          </label>
          <input
            type="text"
            value={transactionCode}
            onChange={(e) => setTransactionCode(e.target.value)}
            placeholder={method === 'code' ? 'e.g. CODE123' : 'e.g. 123456'}
            className="mt-1 w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30 dark:bg-[var(--zcanopy-surface)]"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-muted)' }}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0700000000"
            className="mt-1 w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3 text-sm" disabled={loading}>
          {loading ? 'Looking up...' : 'Find Booking'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {booking && (
        <div className="mt-6 space-y-4 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
          <h3 className="text-xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Booking Found</h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Property</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.propertyTitle}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Location</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.location}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Booking Code</span>
              <p className="font-mono text-lg" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.bookingCode}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Transaction Code</span>
              <p className="font-mono text-sm" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.transactionCode}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Customer</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.customerName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Phone</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.customerPhone}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Amount</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {booking.amount.toLocaleString()}</p>
            </div>
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Date</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{new Date(booking.date).toLocaleString()}</p>
            </div>
            {booking.customerEmail && (
              <div>
                <span style={{ color: 'var(--zcanopy-muted)' }}>Email</span>
                <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.customerEmail}</p>
              </div>
            )}
            {booking.reason && (
              <div>
                <span style={{ color: 'var(--zcanopy-muted)' }}>Reason</span>
                <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.reason}</p>
              </div>
            )}
            <div>
              <span style={{ color: 'var(--zcanopy-muted)' }}>Status</span>
              <p className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.status || 'booked'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
