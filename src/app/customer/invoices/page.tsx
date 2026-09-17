'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi } from '@/lib/api';

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zcanopy_token');
    if (!token) {
      router.replace('/customer');
      return;
    }
    loadInvoices(token);
  }, [router]);

  const loadInvoices = async (token: string) => {
    try {
      const result = await webApi.customer.getInvoices(token, 1, 20);
      setInvoices(result.invoices || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
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
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Invoices</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!invoices.length ? (
        <p className="mt-4 text-sm text-gray-600">No invoices found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.reasonForPayment || 'Invoice'}</p>
                  <p className="text-xs text-gray-600">Ref: {invoice.referenceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">UGX {Number(invoice.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{invoice.paymentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

