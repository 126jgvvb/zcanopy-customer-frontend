'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { webApi, ApiError, setSession } from '@/lib/api';
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
      const sessionId =
        (result as { sessionId?: string }).sessionId ||
        (result as { sessionToken?: string }).sessionToken ||
        token;

      if (!sessionId) {
        setError('Login failed');
        return;
      }

      setSession(sessionId, result, 'broker');
      localStorage.setItem('zcanopy_token', token || '');

      router.push('/customer');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    const mockSessionId = 'dev-broker-session-' + Date.now();
    const mockToken = 'dev-broker-token-' + Date.now();
    setSession(mockSessionId, { id: 'dev-broker', username: 'Dev Broker', email: 'dev@broker.com', brokerCode: 'DEV-001', role: 'broker', session: { sessionId: mockSessionId, sessionToken: mockToken } }, 'broker');
    localStorage.setItem('zcanopy_token', mockToken);
    router.push('/customer');
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(209,160,84,0.22),transparent_55%)]" />
        <div className="relative w-full max-w-md rounded-3xl border border-[var(--zcanopy-border)] bg-white p-9 shadow-[var(--zcanopy-shadow)]">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="ZCanopy"
                className="h-10 w-10 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </Link>
    <h1 className="mt-5 text-4xl" style={{ color: 'var(--zcanopy-card-brown)' }}>
      Welcome back
    </h1>
    <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
      Sign in to manage your listings.
    </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>
                  Broker Code / Email
              </label>
              <input
                type="text"
                value={brokerCode}
                onChange={(e) => setBrokerCode(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
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
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--zcanopy-primary)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">development</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleDevBypass}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
          >
            🚀 Dev Bypass (skip login)
          </button>

          <p className="mt-7 text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
            Not a broker?{' '}
            <Link href="/brokers/signup" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}