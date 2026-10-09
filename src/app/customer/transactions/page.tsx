'use client';

  import useSWR from 'swr';
  import { webApi } from '@/lib/api';

  interface CustomerTransactionsContentProps {
    token: string;
  }

  async function fetchTransactions(key: [string, string]) {
    const t = key[1];
    return webApi.customer.getTransactions(t, 1, 20);
  }

  export default function CustomerTransactionsContent({ token }: CustomerTransactionsContentProps) {
    const key = token ? ['customer-transactions', token] : null;

    const { data, error, isLoading } = useSWR(key, fetchTransactions, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: { transactions: [], total: 0 },
    });

    const transactions = data?.transactions || [];

    if (isLoading && !data) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
        </div>
      );
    }

    return (
      <div className="min-h-[500px]">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Transactions</h2>
        {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load transactions'}</p>}
        {!transactions.length ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No transactions found.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {transactions.map((txn) => (
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
