'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { webApi, authErrorMessage, clearSession } from '@/lib/api';
import { Heart, CalendarCheck, Search, Receipt, FileText, MessageCircle, Bell, User, Eye, EyeOff } from 'lucide-react';
import CustomerTransactionsContent from './transactions/page';
import CustomerInvoicesContent from './invoices/page';
import CustomerMessagesContent from './messages/page';
import CustomerNotificationsContent from './notifications/page';
import CustomerProfileContent from './profile/page';
import CustomerFavoritesContent from './favorites/page';
import CustomerBookingsContent from './bookings/page';
import FindBookingContent from './find-booking/page';

type ActiveView = 'dashboard' | 'favorites' | 'bookings' | 'find-booking' | 'transactions' | 'invoices' | 'messages' | 'notifications' | 'profile';

const VALID_VIEWS: ActiveView[] = ['dashboard', 'favorites', 'bookings', 'find-booking', 'transactions', 'invoices', 'messages', 'notifications', 'profile'];

export default function CustomerPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [token, setToken] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState('');
  const [forgotPasswordConfirmPassword, setForgotPasswordConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const router = useRouter();

  // Honours ?view=<tab> deep links, e.g. /customer?view=bookings right after a
  // successful booking.
  const requestedView = searchParams.get('view');

  useEffect(() => {
    if (requestedView && VALID_VIEWS.includes(requestedView as ActiveView)) {
      setActiveView(requestedView as ActiveView);
    }
  }, [requestedView]);

  // Switching tabs by hand clears the deep-link param so a refresh does not
  // snap the user back to the tab they arrived on.
  const selectView = (view: ActiveView) => {
    setActiveView(view);
    if (requestedView && requestedView !== view) {
      router.replace('/customer', { scroll: false });
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('zcanopy_token');
    if (savedToken) {
      setToken(savedToken);
      const name = localStorage.getItem('zcanopy_customer_name');
      if (name) setCustomerName(name);
      setLoggedIn(true);
      return;
    }

    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const cookieToken = getCookie('zcanopy_token');
    if (cookieToken) {
      setToken(cookieToken);
      const cookieName = getCookie('zcanopy_customer_name');
      const name = cookieName || localStorage.getItem('zcanopy_customer_name');
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
      const sessionToken = session?.sessionToken; // JWT for Authorization header
      const customer = (result as { customer?: { firstName?: string; lastName?: string; email?: string } }).customer;

      if (!sessionToken) {
        setError('Login failed - invalid session');
        return;
      }

      // Store JWT token and customer info
      if (typeof window !== 'undefined') {
        localStorage.setItem('zcanopy_token', sessionToken);
        localStorage.setItem('zcanopy_customer_email', customer?.email || email);
      }
      const name = customer?.firstName || customer?.email || 'Customer';
      setCustomerName(name);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zcanopy_customer_name', name);
      }
      setToken(sessionToken);
      setLoggedIn(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUri = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/auth/google?redirect_uri=${redirectUri}`;
  };

  async function handleForgotPasswordSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setForgotPasswordMessage('');
    setLoading(true);
    try {
      const res = await webApi.customer.sendForgotPasswordOtp({ email: forgotPasswordEmail.trim() });
      const data = res as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setForgotPasswordMessage(data.message || 'OTP sent to your email.');
      setForgotPasswordStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setForgotPasswordMessage('');
    setLoading(true);
    try {
      const res = await webApi.customer.verifyForgotPasswordOtp({ email: forgotPasswordEmail.trim(), otp: forgotPasswordOtp.trim() });
      const data = res as any;
      if (!data.valid) {
        throw new Error(data.message || 'Invalid OTP');
      }
      setForgotPasswordMessage('OTP verified. Set your new password.');
      setForgotPasswordStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setForgotPasswordMessage('');
    if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (forgotPasswordNewPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await webApi.customer.resetPassword({ email: forgotPasswordEmail.trim(), password: forgotPasswordNewPassword });
      const data = res as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setForgotPasswordMessage('Password reset successfully. You can now sign in.');
      setForgotPasswordMode(false);
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setForgotPasswordOtp('');
      setForgotPasswordNewPassword('');
      setForgotPasswordConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

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
          const mockFavCount = 0;
          const mockBookingCount = 0;
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
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Unread Messages</p>
                </div>
                <div className="rounded-xl border border-[var(--zcanopy-border)] bg-white p-4 text-center dark:bg-[var(--zcanopy-surface)]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--zcanopy-primary)' }}>0</p>
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
            <div className="mt-8 w-full max-w-sm rounded-3xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-[var(--zcanopy-shadow)] dark:bg-[var(--zcanopy-surface)]">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Customer Login</h2>
              <form onSubmit={handleLogin} className="mt-4 space-y-4">
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
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 pr-12 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30 dark:bg-[var(--zcanopy-surface)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--zcanopy-muted)] transition hover:bg-[color-mix(in_srgb,var(--zcanopy-primary)_10%,transparent)] hover:text-[var(--zcanopy-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)]/40"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { setForgotPasswordMode(true); setError(''); setForgotPasswordMessage(''); setForgotPasswordStep('email'); }}
                      className="text-xs font-medium text-[var(--zcanopy-primary)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

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
                    <span className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>or</span>
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--zcanopy-border)' }} />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                     Sign in with Google
                  </button>

                  <p className="text-center text-sm" style={{ color: 'var(--zcanopy-muted)' }}>
                    Not a customer?{' '}
                    <Link href="/customer/signup" className="font-semibold underline-offset-4 hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
                      Register
                    </Link>
                  </p>
                </form>

                {forgotPasswordMode && (
                 <div className="mt-6 rounded-xl border border-[var(--zcanopy-border)] bg-white p-6">
                   <h2 className="mb-4 text-lg font-semibold text-[var(--zcanopy-card-brown)]">Reset your password</h2>
                   {forgotPasswordStep === 'email' && (
                     <form onSubmit={handleForgotPasswordSendOtp} className="space-y-4">
                       <label className="mb-1.5 block text-sm font-medium text-[var(--zcanopy-card-brown)]">Email</label>
                       <input
                         type="email"
                         required
                         value={forgotPasswordEmail}
                         onChange={(e) => setForgotPasswordEmail(e.target.value)}
                         className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                       />
                       {error && <p className="text-sm text-red-600">{error}</p>}
                       {forgotPasswordMessage && <p className="text-sm text-green-600">{forgotPasswordMessage}</p>}
                       <button type="submit" disabled={loading} className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: 'var(--zcanopy-primary)' }}>
                         {loading ? 'Sending OTP…' : 'Send OTP'}
                       </button>
                       <button type="button" onClick={() => { setForgotPasswordMode(false); setError(''); setForgotPasswordMessage(''); }} className="w-full text-sm font-medium text-[var(--zcanopy-muted)] hover:text-[var(--zcanopy-card-brown)]">
                         Back to login
                       </button>
                     </form>
                   )}

                   {forgotPasswordStep === 'otp' && (
                     <form onSubmit={handleForgotPasswordVerifyOtp} className="space-y-4">
                       <label className="mb-1.5 block text-sm font-medium text-[var(--zcanopy-card-brown)]">Enter OTP sent to {forgotPasswordEmail}</label>
                       <input
                         type="text"
                         required
                         maxLength={6}
                         value={forgotPasswordOtp}
                         onChange={(e) => setForgotPasswordOtp(e.target.value)}
                         className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                       />
                       {error && <p className="text-sm text-red-600">{error}</p>}
                       {forgotPasswordMessage && <p className="text-sm text-green-600">{forgotPasswordMessage}</p>}
                       <button type="submit" disabled={loading} className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: 'var(--zcanopy-primary)' }}>
                         {loading ? 'Verifying…' : 'Verify OTP'}
                       </button>
                       <button type="button" onClick={() => { setForgotPasswordStep('email'); setError(''); setForgotPasswordMessage(''); }} className="w-full text-sm font-medium text-[var(--zcanopy-muted)] hover:text-[var(--zcanopy-card-brown)]">
                         Back
                       </button>
                     </form>
                   )}

                   {forgotPasswordStep === 'reset' && (
                     <form onSubmit={handleForgotPasswordReset} className="space-y-4">
<label className="mb-1.5 block text-sm font-medium text-[var(--zcanopy-card-brown)]">New Password</label>
                       <div className="relative">
                         <input
                           type={showNewPassword ? 'text' : 'password'}
                           required
                           minLength={6}
                           value={forgotPasswordNewPassword}
                           onChange={(e) => setForgotPasswordNewPassword(e.target.value)}
                           className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 pr-12 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                         />
                         <button
                           type="button"
                           onClick={() => setShowNewPassword((prev) => !prev)}
                           aria-label={showNewPassword ? 'Hide passwords' : 'Show passwords'}
                           title={showNewPassword ? 'Hide passwords' : 'Show passwords'}
                           className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--zcanopy-muted)] transition hover:bg-[color-mix(in_srgb,var(--zcanopy-primary)_10%,transparent)] hover:text-[var(--zcanopy-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)]/40"
                         >
                           {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                         </button>
                       </div>
                       <label className="mb-1.5 mt-4 block text-sm font-medium text-[var(--zcanopy-card-brown)]">Confirm New Password</label>
                       <div className="relative">
                         <input
                           type={showNewPassword ? 'text' : 'password'}
                           required
                           minLength={6}
                           value={forgotPasswordConfirmPassword}
                           onChange={(e) => setForgotPasswordConfirmPassword(e.target.value)}
                           className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 pr-12 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                         />
                         <button
                           type="button"
                           onClick={() => setShowNewPassword((prev) => !prev)}
                           aria-label={showNewPassword ? 'Hide passwords' : 'Show passwords'}
                           title={showNewPassword ? 'Hide passwords' : 'Show passwords'}
                           className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--zcanopy-muted)] transition hover:bg-[color-mix(in_srgb,var(--zcanopy-primary)_10%,transparent)] hover:text-[var(--zcanopy-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zcanopy-primary)]/40"
                         >
                           {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                         </button>
                       </div>
                       {error && <p className="text-sm text-red-600">{error}</p>}
                       {forgotPasswordMessage && <p className="text-sm text-green-600">{forgotPasswordMessage}</p>}
                       <button type="submit" disabled={loading} className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: 'var(--zcanopy-primary)' }}>
                         {loading ? 'Resetting…' : 'Reset Password'}
                       </button>
                     </form>
                   )}
                 </div>
               )}
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
                      onClick={() => selectView(link.view)}
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
