'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi, getSessionId, clearSession } from '@/lib/api';

export default function CustomerTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zcanopy_token');
if (!token) {
        router.replace('/customer');
        return;
      }
    loadTransactions(token);
  }, [router]);

  const loadTransactions = async (token: string) => {
    try {
      const result = await webApi.customer.getTransactions(token, 1, 20);
      setTransactions(result.transactions || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
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
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Transactions</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!transactions.length ? (
        <p className="mt-4 text-sm text-gray-600">No transactions found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {transactions.map((txn) => (
            <div key={txn.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.reasonForPayment || 'Transaction'}</p>
                  <p className="text-xs text-gray-600">Ref: {txn.referenceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">UGX {Number(txn.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{txn.paymentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

