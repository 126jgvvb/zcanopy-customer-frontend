'use client';

import { useEffect, useState } from 'react';
import { webApi } from '@/lib/api';
import { mockData } from '@/lib/mockData';

interface CustomerInvoicesContentProps {
  token: string;
}

export default function CustomerInvoicesContent({ token }: CustomerInvoicesContentProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoices(token);
  }, [token]);

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
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
      </div>
    );
  }

  const displayInvoices = invoices.length > 0 ? invoices : mockData.customerInvoices().invoices;

  return (
    <div className="min-h-[500px]">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Invoices</h2>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!displayInvoices.length ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--zcanopy-muted)' }}>No invoices found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {displayInvoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-5 shadow-sm dark:bg-[var(--zcanopy-surface)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--zcanopy-card-brown)' }}>{invoice.reasonForPayment || 'Invoice'}</p>
                  <p className="text-xs" style={{ color: 'var(--zcanopy-muted)' }}>Ref: {invoice.referenceNumber} • Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>UGX {Number(invoice.amount).toLocaleString()}</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    invoice.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
