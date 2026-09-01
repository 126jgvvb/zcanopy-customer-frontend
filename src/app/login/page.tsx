'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { webApi, ApiError } from '@/lib/api';
import { COLORS } from '@/lib/theme';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [brokerCode, setBrokerCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await webApi.brokerLogin(brokerCode, password);

      const token = (result as { token?: string }).token;
      if (!token) {
        setError('Login failed');
        return;
      }

      localStorage.setItem('zcanopy_token', token);
      localStorage.setItem('zcanopy_role', 'broker');
      localStorage.setItem('zcanopy_user', JSON.stringify(result));

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
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
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white shadow"
                style={{ backgroundColor: COLORS.accentGold, color: COLORS.cardBrown }}
              >
                Z
              </span>
            </Link>
            <p className="mt-5 text-sm font-medium uppercase tracking-wide" style={{ color: COLORS.primary }}>
              Broker console
            </p>
            <h1 className="mt-1 text-4xl" style={{ color: COLORS.cardBrown }}>
              Welcome back
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#6f6258" }}>
              Sign in to manage your listings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.cardBrown }}>
                Broker Code / Email
              </label>
              <input
                type="text"
                value={brokerCode}
                onChange={(e) => setBrokerCode(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
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
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white/70 px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: "#6f6258" }}>
            Not a broker?{' '}
            <Link href="/brokers/signup" className="font-semibold underline-offset-4 hover:underline" style={{ color: COLORS.primary }}>
              Register
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
