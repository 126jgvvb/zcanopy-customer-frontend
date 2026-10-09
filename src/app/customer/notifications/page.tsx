'use client';

  import useSWR from 'swr';
  import { webApi } from '@/lib/api';

  interface CustomerNotificationsContentProps {
    token: string;
    onRead?: (count: number) => void;
  }

  async function fetchNotifications(key: [string, string]) {
    const t = key[1];
    return webApi.customer.getNotifications(t, 1, 20);
  }

  export default function CustomerNotificationsContent({ token, onRead }: CustomerNotificationsContentProps) {
    const key = token ? ['customer-notifications', token] : null;

    const { data, error, isLoading } = useSWR(key, fetchNotifications, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: { notifications: [], total: 0, unreadCount: 0 },
    });

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    if (onRead) onRead(unreadCount);

    if (isLoading && !data) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
        </div>
      );
    }

    return (
      <div className="min-h-[500px]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[var(--zcanopy-primary)] px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load notifications'}</p>}
        {!notifications.length ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No notifications found.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {notifications.map((notification) => (
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
