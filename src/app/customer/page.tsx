'use client';

import { useState } from 'react';
import Link from 'next/link';
import { webApi, ApiError, setSession, clearSession } from '@/lib/api';
import { Heart, CalendarCheck, Search, Receipt, FileText, MessageCircle, Bell, User } from 'lucide-react';

export default function CustomerPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await webApi.customer.login({ email, password });
      const session = (result as { session?: { sessionToken?: string; sessionId?: string } }).session;
      const token = (result as { token?: string }).token;
      const sessionId = session?.sessionToken || session?.sessionId || token;
      const customer = (result as { customer?: { firstName?: string; lastName?: string; email?: string } }).customer;

      if (!sessionId) {
        setError('Login failed');
        return;
      }

      setSession(sessionId, result, 'customer');
      if (typeof window !== 'undefined') {
        localStorage.setItem('zcanopy_token', token || sessionId);
      }
      setCustomerName(customer?.firstName || customer?.email || 'Customer');
      setLoggedIn(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    const mockSessionId = 'dev-customer-session-' + Date.now();
    const mockToken = 'dev-customer-token-' + Date.now();
    setSession(mockSessionId, { customer: { firstName: 'Dev', email: 'dev@customer.com' }, session: { sessionId: mockSessionId, sessionToken: mockToken } }, 'customer');
    if (typeof window !== 'undefined') {
      localStorage.setItem('zcanopy_token', mockToken);
    }
    setCustomerName('Dev Customer');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    clearSession();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zcanopy_token');
    }
    setLoggedIn(false);
    setCustomerName('');
    setEmail('');
    setPassword('');
  };

  const features = [
    { name: 'My Favorites', href: '/properties/favorites', description: 'Properties you saved', icon: Heart },
    { name: 'My Bookings', href: '/bookings/retrieve', description: 'View and manage bookings', icon: CalendarCheck },
    { name: 'Find Booking', href: '/bookings/find', description: 'Locate a booking by code', icon: Search },
    { name: 'My Transactions', href: '/customer/transactions', description: 'Payment history', icon: Receipt },
    { name: 'My Invoices', href: '/customer/invoices', description: 'Invoice statements', icon: FileText },
    { name: 'Messages', href: '/customer/messages', description: 'Notifications & messages', icon: MessageCircle },
    { name: 'Notifications', href: '/customer/notifications', description: 'Alerts and updates', icon: Bell },
    { name: 'My Profile', href: '/customer/profile', description: 'Account settings', icon: User },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Customer Portal</h1>
      <p className="mt-2 text-sm text-gray-600">Access your bookings, favorites, transactions, and account settings.</p>

      {!loggedIn ? (
        <div className="mt-8 flex justify-center">
          <div className="mt-8 max-w-md rounded-2xl border border-[var(--zcanopy-border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Customer Login</h2>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Password</label>
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
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">development</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={handleDevBypass}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
              >
                🚀 Dev Bypass (skip login)
              </button>
              <p className="text-center text-sm text-gray-600">
                Not a customer?{' '}
                <Link href="/customer/signup" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
                  Register
                </Link>
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex min-h-[500px] gap-8">
          <aside className="w-64 flex-shrink-0 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-4 shadow-sm">
            <div className="flex items-center gap-3 px-3 py-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white shadow"
                style={{ backgroundColor: 'var(--zcanopy-accent-gold)', color: 'var(--zcanopy-card-brown)' }}
              >
                Z
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{customerName}</p>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--zcanopy-primary)' }}>Customer</p>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.name}
                    href={feature.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-[var(--zcanopy-accent-gold)]/10 hover:text-[var(--zcanopy-primary)]"
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--zcanopy-card-brown)' }} />
                    <span className="font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{feature.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-[var(--zcanopy-border)] pt-3">
              <button
                onClick={handleLogout}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Sign out
              </button>
            </div>
          </aside>

          <div className="flex-1 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-8 shadow-sm">
            <h2 className="text-xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back, {customerName}. Use the sidebar to navigate to your bookings, favorites,
              transactions, and account settings.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[#2a241f]/60">
                <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
                <p className="mt-1 text-xs text-gray-500">Saved Properties</p>
              </div>
              <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[#2a241f]/60">
                <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
                <p className="mt-1 text-xs text-gray-500">Active Bookings</p>
              </div>
              <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[#2a241f]/60">
                <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
                <p className="mt-1 text-xs text-gray-500">Unread Messages</p>
              </div>
              <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[#2a241f]/60">
                <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
                <p className="mt-1 text-xs text-gray-500">Notifications</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}