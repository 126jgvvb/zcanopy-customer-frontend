'use client';

import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

interface CustomerTransactionsContentProps {
  token: string;
}

export default function CustomerTransactionsContent({ token }: CustomerTransactionsContentProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions(token);
  }, [token]);

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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  const displayTransactions = transactions.length > 0 ? transactions : mockData.customerTransactions().transactions;

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Transactions</h2>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!displayTransactions.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No transactions found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {displayTransactions.map((txn) => (
            <div key={txn.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{txn.reasonForPayment || 'Transaction'}</p>
                  <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Ref: {txn.referenceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {Number(txn.amount).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>{txn.paymentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
