'use client';

  import useSWR from 'swr';
  import { webApi } from '@/lib/api';

  interface CustomerMessagesContentProps {
    token: string;
  }

  async function fetchMessages(key: [string, string]) {
    const t = key[1];
    return webApi.customer.getMessages(t, 1, 20);
  }

  export default function CustomerMessagesContent({ token }: CustomerMessagesContentProps) {
    const key = token ? ['customer-messages', token] : null;

    const { data, error, isLoading } = useSWR(key, fetchMessages, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: { messages: [], total: 0 },
    });

    const messages = data?.messages || [];

    if (isLoading && !data) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
        </div>
      );
    }

    return (
      <div className="min-h-[500px]">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Messages</h2>
        {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load messages'}</p>}
        {!messages.length ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No messages found.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
                <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{message.subject}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>{message.body}</p>
                <p className="mt-2 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
