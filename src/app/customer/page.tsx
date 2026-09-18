'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { webApi, ApiError, setSession, clearSession } from '@/lib/api';
import { mockData } from '@/lib/mockData';
import { Heart, CalendarCheck, Search, Receipt, FileText, MessageCircle, Bell, User } from 'lucide-react';
import CustomerTransactionsContent from './transactions/page';
import CustomerInvoicesContent from './invoices/page';
import CustomerMessagesContent from './messages/page';
import CustomerNotificationsContent from './notifications/page';
import CustomerProfileContent from './profile/page';
import CustomerFavoritesContent from './favorites/page';
import CustomerBookingsContent from './bookings/page';
import FindBookingContent from './find-booking/page';

type ActiveView = 'dashboard' | 'favorites' | 'bookings' | 'find-booking' | 'transactions' | 'invoices' | 'messages' | 'notifications' | 'profile';

export default function CustomerPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('zcanopy_token');
    if (savedToken) {
      setToken(savedToken);
      const name = localStorage.getItem('zcanopy_customer_name');
      if (name) setCustomerName(name);
      setLoggedIn(true);
    }
  }, []);

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
      const name = customer?.firstName || customer?.email || 'Customer';
      setCustomerName(name);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zcanopy_customer_name', name);
      }
      setToken(token || sessionId);
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
      localStorage.setItem('zcanopy_customer_name', 'Dev Customer');
    }
    setCustomerName('Dev Customer');
    setToken(mockToken);
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
    setToken(null);
    setActiveView('dashboard');
  };

  const sidebarLinks: { name: string; icon: any; view: ActiveView; external?: boolean; href?: string }[] = [
    { name: 'My Favorites', icon: Heart, view: 'favorites' },
    { name: 'My Bookings', icon: CalendarCheck, view: 'bookings' },
    { name: 'Find Booking', icon: Search, view: 'find-booking' },
    { name: 'My Transactions', icon: Receipt, view: 'transactions' },
    { name: 'My Invoices', icon: FileText, view: 'invoices' },
    { name: 'Messages', icon: MessageCircle, view: 'messages' },
    { name: 'Notifications', icon: Bell, view: 'notifications' },
    { name: 'My Profile', icon: User, view: 'profile' },
  ];

  function renderContent() {
    if (!token) return null;

    switch (activeView) {
      case 'transactions':
        return <CustomerTransactionsContent token={token} />;
      case 'invoices':
        return <CustomerInvoicesContent token={token} />;
      case 'messages':
        return <CustomerMessagesContent token={token} />;
      case 'notifications':
        return <CustomerNotificationsContent token={token} />;
      case 'profile':
        return <CustomerProfileContent token={token} customerName={customerName} onProfileUpdate={() => {}} />;
      case 'favorites':
        return <CustomerFavoritesContent token={token} />;
      case 'bookings':
        return <CustomerBookingsContent token={token} />;
      case 'find-booking':
        return <FindBookingContent />;
      default:
        {
          const mockStats = mockData.bookings().bookings;
          const mockFavCount = mockData.customerProperties().properties.length;
          const mockBookingCount = mockStats.length;
          return (
            <div className="min-h-[500px]">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Dashboard</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
                Welcome back, {customerName || 'Customer'}. Use the sidebar to navigate to your bookings, favorites,
                transactions, and account settings.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[var(--zcanopy-surface)]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>{mockFavCount}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Saved Properties</p>
                </div>
                <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[var(--zcanopy-surface)]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>{mockBookingCount}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Active Bookings</p>
                </div>
                <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[var(--zcanopy-surface)]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>2</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Unread Messages</p>
                </div>
                <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[var(--zcanopy-surface)]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>3</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Notifications</p>
                </div>
              </div>
            </div>
          );
        }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-[var(--zcanopy-surface)] p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Customer Portal</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>Access your bookings, favorites, transactions, and account settings.</p>
        </div>
      </div>

       {!loggedIn ? (
        <div className="flex-1 bg-[var(--zcanopy-background)] px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mt-8 flex justify-center">
              <div className="mt-8 max-w-lg rounded-2xl border border-[var(--zcanopy-border)] bg-white p-8 shadow-sm dark:bg-[var(--zcanopy-surface)]">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Customer Login</h2>
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-muted)' }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30 dark:bg-[var(--zcanopy-surface)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-muted)' }}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30 dark:bg-[var(--zcanopy-surface)]"
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
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--zcanopy-border)' }} />
                    <span className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>development</span>
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--zcanopy-border)' }} />
                  </div>
                  <button
                    type="button"
                    onClick={handleDevBypass}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium transition hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
                    style={{ color: 'var(--zcanopy-muted)', borderColor: 'var(--zcanopy-border)' }}
                  >
                    Dev Bypass (skip login)
                  </button>
                  <p className="text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
                    Not a customer?{' '}
                    <Link href="/customer/signup" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
                      Register
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-[var(--zcanopy-background)] px-6 py-12">
          <div className="mx-auto flex min-h-[600px] max-w-6xl gap-8">
            <aside className="w-64 flex-shrink-0 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-4 shadow-sm">
              <div className="flex items-center gap-3 px-3 py-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white shadow"
                  style={{ backgroundColor: 'var(--zcanopy-accent-gold)', color: 'var(--zcanopy-card-brown)' }}
                >
                  Z
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{customerName || 'Customer'}</p>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--zcanopy-primary)' }}>Customer</p>
                </div>
              </div>

              <nav className="mt-4 flex flex-col gap-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeView === link.view;
                  return (
                    <button
                      key={link.name}
                      onClick={() => setActiveView(link.view)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? 'bg-[var(--zcanopy-accent-gold)]/10 text-[var(--zcanopy-primary)]'
                          : 'hover:bg-[var(--zcanopy-accent-gold)]/10 hover:text-[var(--zcanopy-primary)] text-[var(--zcanopy-card-brown)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" style={{ color: 'var(--zcanopy-card-brown)' }} />
                      <span className="font-medium">{link.name}</span>
                    </button>
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
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
