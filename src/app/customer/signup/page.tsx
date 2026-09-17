'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { webApi, ApiError } from '@/lib/api';
import { COLORS } from '@/lib/theme';

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
        router.push('/customer?registered=1');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(209,160,84,0.22),transparent_55%)]" />
        <div className="relative w-full max-w-md rounded-3xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-9 shadow-[var(--zcanopy-shadow)]">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="ZCanopy"
                className="h-10 w-10 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </Link>
            <h1 className="mt-5 text-4xl" style={{ color: COLORS.cardBrown }}>
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#6f6258" }}>
              Sign up to browse properties and book viewings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                placeholder="+256 7XX XXX XXX"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: "#6f6258" }}>
            Already have an account?{' '}
            <Link href="/customer" className="font-semibold underline-offset-4 hover:underline" style={{ color: COLORS.primary }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
