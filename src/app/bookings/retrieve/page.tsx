"use client";

import { useState } from "react";
import { webApi, getSessionId } from "@/lib/api";

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

export default function RetrieveBookingPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<BookingResponse["booking"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const res = await webApi<BookingResponse>("/web/customer/bookings/retrieve-by-code", {
        method: "POST",
        body: { bookingCode, customerPhone: phone },
        skipSessionHeader: true,
      });
      setBooking(res.booking || null);
      if (!res.booking) {
        setError("No booking found for that code and phone number.");
      }
    } catch (err) {
      setError("Failed to retrieve booking. Please check your code and phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 md:px-6">
      <div>
        <h2 className="text-3xl">Retrieve Your Booking</h2>
        <p className="mt-2 text-gray-500">
          Enter the 6-digit booking code and the phone number used during booking to look up your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Booking Code</label>
          <input
            type="text"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="123456"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--zcanopy-surface)] px-4 py-3 text-sm outline-none"
            maxLength={6}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0700000000"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--zcanopy-surface)] px-4 py-3 text-sm outline-none"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3 text-sm" disabled={loading}>
          {loading ? "Looking up..." : "Find Booking"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {booking && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--shadow-soft)]">
          <h3 className="text-xl">Booking Found</h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <span className="text-gray-500">Property</span>
              <p className="font-medium">{booking.propertyTitle}</p>
            </div>
            <div>
              <span className="text-gray-500">Location</span>
              <p className="font-medium">{booking.location}</p>
            </div>
            <div>
              <span className="text-gray-500">Booking Code</span>
              <p className="font-mono text-lg">{booking.bookingCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Transaction Code</span>
              <p className="font-mono text-sm">{booking.transactionCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Customer</span>
              <p className="font-medium">{booking.customerName}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">{booking.customerPhone}</p>
            </div>
            <div>
              <span className="text-gray-500">Amount</span>
              <p className="font-medium">UGX {booking.amount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Date</span>
              <p className="font-medium">{new Date(booking.date).toLocaleString()}</p>
            </div>
            {booking.customerEmail && (
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
            )}
            {booking.reason && (
              <div>
                <span className="text-gray-500">Reason</span>
                <p className="font-medium">{booking.reason}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Status</span>
              <p className="font-medium">{booking.status || "booked"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
