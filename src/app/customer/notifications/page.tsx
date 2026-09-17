'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi } from '@/lib/api';

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zcanopy_token');
    if (!token) {
      router.replace('/customer');
      return;
    }
    loadNotifications(token);
  }, [router]);

  const loadNotifications = async (token: string) => {
    try {
      const result = await webApi.customer.getNotifications(token, 1, 20);
      setNotifications(result.notifications || []);
      setTotal(result.total || 0);
      setUnreadCount(result.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Notifications</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!notifications.length ? (
        <p className="mt-4 text-sm text-gray-600">No notifications found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`rounded-2xl border p-5 shadow-sm ${notification.isRead ? 'border-[var(--zcanopy-border)] bg-white' : 'border-[var(--zcanopy-primary)] bg-[var(--zcanopy-primary)]/5'}`}>
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-700">{notification.body}</p>
              <p className="mt-2 text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

