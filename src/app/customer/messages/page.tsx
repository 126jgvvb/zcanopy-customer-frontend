'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi } from '@/lib/api';

export default function CustomerMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zcanopy_token');
    if (!token) {
      router.replace('/customer');
      return;
    }
    loadMessages(token);
  }, [router]);

  const loadMessages = async (token: string) => {
    try {
      const result = await webApi.customer.getMessages(token, 1, 20);
      setMessages(result.messages || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
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
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Messages</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!messages.length ? (
        <p className="mt-4 text-sm text-gray-600">No messages found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-900">{message.subject}</p>
              <p className="mt-1 text-sm text-gray-700">{message.body}</p>
              <p className="mt-2 text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

