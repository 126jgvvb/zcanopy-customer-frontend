'use client';

import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

interface CustomerMessagesContentProps {
  token: string;
}

export default function CustomerMessagesContent({ token }: CustomerMessagesContentProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages(token);
  }, [token]);

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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  const displayMessages = messages.length > 0 ? messages : mockData.customerMessages().messages;

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>Messages</h2>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!displayMessages.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No messages found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {displayMessages.map((message) => (
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
