'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { webApi, ApiError } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/customer/signup');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await webApi.customer.confirmOtp({
        email: email.trim(),
        otpCode: otp.trim(),
      });
      if (result.success) {
        const session = (result as { session?: { sessionToken?: string; sessionId?: string } }).session;
        const sessionToken = session?.sessionToken; // JWT for Authorization header
        if (sessionToken && typeof window !== 'undefined') {
          window.localStorage.setItem('zcanopy_token', sessionToken);
        }
        router.push('/customer');
      } else {
        // Backend returned success: false with a specific message
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('expired') || msg.includes('invalid') || msg.includes('not exist')) {
          setError('The OTP is either expired or does not exist. Please request a new one.');
        } else {
          setError(result.message || 'OTP verification failed');
        }
      }
    } catch (err) {
      // Network error or 5xx - show user-friendly message
      if (err instanceof ApiError) {
        const msg = err.message.toLowerCase();
        if (msg.includes('expired') || msg.includes('invalid') || msg.includes('not exist')) {
          setError('The OTP is either expired or does not exist. Please request a new one.');
        } else if (err.status === 401 || err.status === 403) {
          setError('Session expired. Please sign up again.');
        } else if (err.status >= 500) {
          setError('Unable to verify OTP at the moment. Please try again in a few moments.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unable to verify OTP. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/web/customer/confirm-otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage('OTP resent to your email');
    } catch {
      setError('Unable to resend OTP. Please try again in a few moments.');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(209,160,84,0.22),transparent_55%)]" />
        <div className="relative w-full max-w-sm rounded-3xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-[var(--zcanopy-shadow)]">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="ZCanopy"
                className="site-logo h-8 w-8 object-contain"
              />
            </Link>
            <h1 className="mt-4 text-3xl" style={{ color: 'var(--zcanopy-card-brown)' }}>
              Verify your email
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
                maxLength={6}
                placeholder="123456"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--zcanopy-primary)' }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--zcanopy-primary)' }}
            >
              Resend OTP
            </button>
          </div>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
            Already verified?{' '}
            <Link href="/customer" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
