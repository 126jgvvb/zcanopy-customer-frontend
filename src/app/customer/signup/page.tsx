'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { webApi, ApiError } from '@/lib/api';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const valid =
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.trim().length >= 9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await webApi.customer.register({
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim(),
      });
      if (result.success) {
        router.push(`/customer/verify?email=${encodeURIComponent(email.trim())}`);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const redirectUri = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/auth/google?redirect_uri=${redirectUri}`;
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
                className="h-8 w-8 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </Link>
            <h1 className="mt-4 text-3xl" style={{ color: 'var(--zcanopy-card-brown)' }}>
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
              Sign up to browse properties and book viewings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                placeholder="+256 7XX XXX XXX"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-3 py-2.5 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--zcanopy-primary)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--zcanopy-border)]" />
              </div>
              <div className="relative bg-white px-4 text-sm text-gray-500">Or continue with</div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>
          </div>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
            Already have an account?{' '}
            <Link href="/customer" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

