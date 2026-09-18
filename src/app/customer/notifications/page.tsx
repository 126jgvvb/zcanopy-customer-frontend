'use client';

import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

interface CustomerNotificationsContentProps {
  token: string;
}

export default function CustomerNotificationsContent({ token }: CustomerNotificationsContentProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications(token);
  }, [token]);

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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  const mockNotifs = mockData.customerNotifications();
  const displayNotifications = notifications.length > 0 ? notifications : mockNotifs.notifications;
  const displayUnreadCount = notifications.length > 0 ? unreadCount : mockNotifs.unreadCount;

  return (
    <div className="min-h-[500px]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Notifications</h2>
        {displayUnreadCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-[var(--zcanopy-primary)] px-2.5 py-0.5 text-xs font-medium text-white">
            {displayUnreadCount} unread
          </span>
        )}
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!displayNotifications.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No notifications found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {displayNotifications.map((notification) => (
            <div key={notification.id} className={`rounded-2xl border p-5 shadow-sm ${notification.isRead ? 'border-[var(--zcanopy-border)] bg-white dark:bg-[var(--zcanopy-surface)]' : 'border-[var(--zcanopy-primary)] bg-[var(--zcanopy-primary)]/5'}`}>
              <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{notification.title}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>{notification.body}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
