'use client';

  import { useState } from 'react';
  import useSWR from 'swr';
  import { webApi } from '@/lib/api';

  interface CustomerProfileContentProps {
    token: string;
    customerName: string;
    onProfileUpdate?: () => void;
  }

  async function fetchProfile(key: [string, string]) {
    const t = key[1];
    return webApi.customer.getProfile(t);
  }

  export default function CustomerProfileContent({ token, customerName, onProfileUpdate }: CustomerProfileContentProps) {
    const key = token ? ['customer-profile', token] : null;

    const { data: profile, error, isLoading, mutate } = useSWR(key, fetchProfile, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      fallbackData: null,
    });

    const [saving, setSaving] = useState(false);
    const [phone, setPhone] = useState('');
    const [updateMessage, setUpdateMessage] = useState('');

    const profileData = (profile as any)?.customer || profile || null;

    if (profileData && !phone) {
      setPhone(profileData.phoneNumber || '');
    }

    const handleUpdatePhone = async (e: React.FormEvent) => {
      e.preventDefault();
      const t = token || (typeof window !== 'undefined' ? localStorage.getItem('zcanopy_token') : null);
      if (!t) return;
      setSaving(true);
      setUpdateMessage('');
      try {
        await webApi.customer.updatePhone(t, phone);
        setUpdateMessage('Phone number updated');
        await mutate();
        onProfileUpdate?.();
      } catch (err) {
        setUpdateMessage(err instanceof Error ? err.message : 'Failed to update phone');
      } finally {
        setSaving(false);
      }
    };

    if (isLoading && !profileData) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--zcanopy-primary)]" />
        </div>
      );
    }

    return (
      <div className="min-h-[500px]">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Profile</h2>
        {error && <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Failed to load profile'}</p>}
        {profileData && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-6 shadow-sm dark:bg-[var(--zcanopy-surface)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--zcanopy-muted)' }}>Email</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-card-brown)' }}>{profileData.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--zcanopy-muted)' }}>First Name</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-card-brown)' }}>{profileData.firstName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--zcanopy-muted)' }}>Last Name</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-card-brown)' }}>{profileData.lastName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--zcanopy-muted)' }}>Verified</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--zcanopy-card-brown)' }}>{profileData.isVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleUpdatePhone} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-6 shadow-sm dark:bg-[var(--zcanopy-surface)]">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Update Phone Number</h2>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--zcanopy-muted)' }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                  required
                />
              </div>
              {updateMessage && <p className="mt-3 text-sm" style={{ color: updateMessage.includes('Failed') ? 'var(--zcanopy-primary)' : 'var(--zcanopy-muted)' }}>{updateMessage}</p>}
              <button
                type="submit"
                disabled={saving}
                className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--zcanopy-primary)' }}
              >
                {saving ? 'Saving...' : 'Save Phone Number'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }
