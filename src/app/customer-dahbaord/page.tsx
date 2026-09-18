'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  FileText,
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Receipt,
  Search,
  ShieldCheck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { clearSession, getSessionId, webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

type Booking = {
  id: string;
  propertyTitle: string;
  date: string;
  status?: string;
  amount?: number;
  location?: string;
};

type Transaction = {
  id: string;
  reasonForPayment?: string;
  amount?: number;
  paymentStatus?: string;
  referenceNumber?: string;
  createdAt?: string;
};

type Message = {
  id: string;
  subject?: string;
  body?: string;
  createdAt?: string;
};

type Notification = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
};

type Favorite = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  imageUrl?: string;
  price?: number;
  isAvailable?: boolean;
};

type Profile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isVerified?: boolean;
};

type Wallet = {
  balance?: number;
  currency?: string;
};

type ActivityItem = {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  read?: boolean;
  kind: 'message' | 'notification';
};

const navItems = [
  { href: '/customer-dahbaord', label: 'Overview', icon: LayoutGrid },
  { href: '/customer/favorites', label: 'My Favorites', icon: Heart },
  { href: '/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
  { href: '/bookings/find', label: 'Find Booking', icon: Search },
  { href: '/customer/transactions', label: 'My Transactions', icon: Receipt },
  { href: '/customer/invoices', label: 'My Invoices', icon: FileText },
  { href: '/customer/messages', label: 'Messages', icon: MessageCircle },
  { href: '/customer/notifications', label: 'Notifications', icon: Bell },
  { href: '/customer/profile', label: 'My Profile', icon: User },
];

function formatCurrency(value?: number, currency = 'UGX') {
  return `${currency} ${Number(value || 0).toLocaleString('en-US')}`;
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDisplayName(profile?: Profile, fallback = 'Customer') {
  const first = profile?.firstName?.trim();
  const last = profile?.lastName?.trim();
  return first || last ? [first, last].filter(Boolean).join(' ') : profile?.email?.split('@')[0] || fallback;
}

function statusClass(status?: string) {
  const normalized = (status || 'pending').toLowerCase();
  if (normalized === 'approved' || normalized === 'completed' || normalized === 'paid') {
    return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
  }
  if (normalized === 'cancelled' || normalized === 'failed' || normalized === 'unpaid') {
    return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
  }
  return 'bg-[var(--zcanopy-accent-gold)]/15 text-[var(--zcanopy-primary)]';
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('Customer');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [wallet, setWallet] = useState<Wallet>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sessionId = getSessionId();
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('zcanopy_token') : null;
    const resolvedToken = storedToken || sessionId;

    if (!resolvedToken) {
      clearSession();
      router.replace('/customer');
      return;
    }

    setToken(resolvedToken);
    loadDashboard(resolvedToken);
  }, [router]);

  const loadDashboard = async (resolvedToken: string) => {
    setLoading(true);
    setError('');

    try {
      const [profileResult, bookingsResult, transactionsResult, messagesResult, notificationsResult, favoritesResult, walletResult] = await Promise.all([
        webApi.customer.getProfile(resolvedToken),
        webApi.customer.getBookings(resolvedToken, 1, 10),
        webApi.customer.getTransactions(resolvedToken, 1, 10),
        webApi.customer.getMessages(resolvedToken, 1, 10),
        webApi.customer.getNotifications(resolvedToken, 1, 20),
        webApi.getCustomerFavorites(resolvedToken),
        webApi.customer.getWallet(resolvedToken),
      ]);

      const nextProfile = profileResult as Profile;
      const nextBookings = (bookingsResult.bookings || []) as Booking[];
      const nextTransactions = (transactionsResult.transactions || []) as Transaction[];
      const nextMessages = (messagesResult.messages || []) as Message[];
      const nextNotifications = (notificationsResult.notifications || []) as Notification[];
      const nextFavorites = (favoritesResult.favorites || []) as Favorite[];
      const nextWallet = walletResult as Wallet;

      setProfile(nextProfile);
      setCustomerName(getDisplayName(nextProfile));
      setBookings(nextBookings);
      setTransactions(nextTransactions);
      setMessages(nextMessages);
      setNotifications(nextNotifications);
      setFavorites(nextFavorites);
      setWallet(nextWallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('zcanopy_token');
      window.localStorage.removeItem('zcanopy_customer_name');
    }
    setToken(null);
    router.replace('/customer');
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const completedBookings = bookings.filter((booking) => ['approved', 'completed', 'confirmed'].includes((booking.status || '').toLowerCase())).length;
  const recentActivity: ActivityItem[] = [
    ...notifications.map((notification) => ({
      id: notification.id,
      title: notification.title || 'Notification',
      body: notification.body || '',
      createdAt: notification.createdAt,
      read: notification.isRead,
      kind: 'notification' as const,
    })),
    ...messages.map((message) => ({
      id: message.id,
      title: message.subject || 'Message',
      body: message.body || '',
      createdAt: message.createdAt,
      read: true,
      kind: 'message' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

  const displayTransactions = transactions.length > 0 ? transactions : mockData.customerTransactions().transactions as Transaction[];
  const displayFavorites = favorites.length > 0 ? favorites : mockData.customerProperties().properties.slice(0, 3).map((property) => ({
    id: property.id,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyLocation: property.location,
    imageUrl: property.imageUrl?.[0],
    price: property.price,
    isAvailable: property.isAvailable,
  }));

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
          <p className="text-sm" style={{ color: 'var(--zcanopy-muted)' }}>Loading your dashboard</p>
        </div>
      </main>
    );
  }

  if (error && !token) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/customer" className="btn-primary mt-6 inline-flex px-5 py-2.5 text-sm">Return to login</Link>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-8 lg:py-10">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-4 shadow-[var(--zcanopy-shadow)] lg:block">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--zcanopy-accent-gold)] font-display text-lg font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Z</div>
            <div>
              <p className="font-display text-lg" style={{ color: 'var(--zcanopy-card-brown)' }}>Customer</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--zcanopy-primary)' }}>Dashboard</p>
            </div>
          </div>

          <nav className="mt-5 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/customer-dahbaord' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'bg-[var(--zcanopy-accent-gold)]/15 font-semibold text-[var(--zcanopy-primary)]'
                      : 'text-[var(--zcanopy-card-brown)] hover:bg-[var(--zcanopy-accent-gold)]/10 hover:text-[var(--zcanopy-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-[var(--zcanopy-border)] pt-4">
            <div className="rounded-xl bg-[var(--zcanopy-background)] p-3">
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{customerName}</p>
              <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{profile?.email || 'Customer account'}</p>
            </div>
            <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--zcanopy-primary)' }}>Customer portal</p>
              <h1 className="mt-1 font-display text-3xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Dashboard</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              className="rounded-xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-2.5"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-3 lg:hidden">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--zcanopy-card-brown)] hover:bg-[var(--zcanopy-accent-gold)]/10">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="col-span-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </nav>
          )}

          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--zcanopy-primary)' }}>Customer portal</p>
            <div className="mt-1 flex items-end justify-between gap-6">
              <h1 className="font-display text-4xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Welcome back, {customerName}</h1>
              <Link href="/properties" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                Browse properties
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--zcanopy-muted)' }}>Track your bookings, payments, messages, and saved properties from one place.</p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50">
              {error}
            </div>
          )}

          <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Active bookings', value: String(completedBookings || bookings.length), hint: bookings.length ? `${bookings.length} total` : 'No bookings yet', icon: CalendarCheck },
              { label: 'Saved properties', value: String(displayFavorites.length), hint: 'Quick access to favorites', icon: Heart },
              { label: 'Unread messages', value: String(unreadCount), hint: messages.length ? `${messages.length} recent messages` : 'You are all caught up', icon: MessageCircle },
              { label: 'Wallet balance', value: formatCurrency(wallet.balance ?? mockData.wallet().balance, wallet.currency || mockData.wallet().currency), hint: 'Available balance', icon: Wallet },
            ].map(({ label, value, hint, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-5 shadow-[var(--zcanopy-shadow)] transition-all hover:-translate-y-0.5 hover:border-[var(--zcanopy-accent-gold)]/40">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--zcanopy-accent-gold)]/15" style={{ color: 'var(--zcanopy-primary)' }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ShieldCheck className="h-4 w-4" style={{ color: 'var(--zcanopy-muted)' }} />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-muted)' }}>{label}</p>
                <p className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>{value}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{hint}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)] xl:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Recent bookings</p>
                  <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Your activity</h2>
                </div>
                <Link href="/customer/bookings" className="flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>View all<ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="mt-5 space-y-3">
                {bookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--zcanopy-border)] p-8 text-center">
                    <CalendarCheck className="mx-auto h-7 w-7" style={{ color: 'var(--zcanopy-accent-gold)' }} />
                    <p className="mt-3 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No bookings yet. Your upcoming property viewings will appear here.</p>
                    <Link href="/properties" className="btn-primary mt-4 inline-flex px-4 py-2 text-xs">Find a property</Link>
                  </div>
                ) : bookings.slice(0, 4).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--zcanopy-border)] p-4 transition-colors hover:border-[var(--zcanopy-accent-gold)]/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{booking.propertyTitle}</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{booking.location || 'Property viewing'} · {formatDate(booking.date)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClass(booking.status)}`}>{booking.status || 'pending'}</span>
                      <p className="text-xs font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{formatCurrency(booking.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Stay informed</p>
                  <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Latest updates</h2>
                </div>
                <Bell className="h-5 w-5" style={{ color: 'var(--zcanopy-accent-gold)' }} />
              </div>
              <div className="mt-5 space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--zcanopy-border)] p-6 text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No recent activity.</p>
                ) : recentActivity.map((activity) => (
                  <div key={`${activity.kind}-${activity.id}`} className="flex gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activity.read ? 'bg-[var(--zcanopy-border)]' : 'bg-[var(--zcanopy-primary)]'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{activity.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{activity.body || 'No details available.'}</p>
                      <p className="mt-1 text-[10px]" style={{ color: 'var(--zcanopy-muted)' }}>{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/customer/notifications" className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs">Open notifications<ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Payments</p>
                  <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Recent transactions</h2>
                </div>
                <Receipt className="h-5 w-5" style={{ color: 'var(--zcanopy-accent-gold)' }} />
              </div>
              <div className="mt-5 space-y-3">
                {displayTransactions.slice(0, 4).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--zcanopy-border)] p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{transaction.reasonForPayment || 'Transaction'}</p>
                      <p className="mt-1 text-[10px]" style={{ color: 'var(--zcanopy-muted)' }}>{transaction.referenceNumber ? `Ref ${transaction.referenceNumber}` : formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{formatCurrency(transaction.amount)}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${statusClass(transaction.paymentStatus)}`}>{transaction.paymentStatus || 'pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/customer/transactions" className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs">View transactions<ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>

            <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Saved for later</p>
                  <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Favorite properties</h2>
                </div>
                <Heart className="h-5 w-5" style={{ color: 'var(--zcanopy-accent-gold)' }} />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {displayFavorites.slice(0, 4).map((favorite) => (
                  <Link key={favorite.id} href={`/properties/${favorite.propertyId}`} className="group overflow-hidden rounded-xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-background)] transition-all hover:-translate-y-0.5 hover:border-[var(--zcanopy-accent-gold)]/40">
                    <div className="h-24 overflow-hidden bg-[var(--zcanopy-border)]">
                      {favorite.imageUrl ? <img src={favorite.imageUrl} alt={favorite.propertyTitle} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center" style={{ color: 'var(--zcanopy-muted)' }}><HomePlaceholder /></div>}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-xs font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{favorite.propertyTitle}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[10px]" style={{ color: 'var(--zcanopy-muted)' }}>{favorite.propertyLocation || 'Uganda'}</p>
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--zcanopy-primary)' }}>{formatCurrency(favorite.price)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/customer/favorites" className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs">View favorites<ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Need help?</p>
                <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>We are here to help you move with confidence.</h2>
                <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--zcanopy-muted)' }}>Contact the ZCanopy team whenever you need support with a booking, payment, or property inquiry.</p>
              </div>
              <Link href="/customer/messages" className="btn-primary shrink-0 px-5 py-3 text-sm">Contact support</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function HomePlaceholder() {
  return <LayoutGrid className="h-7 w-7" />;
}
