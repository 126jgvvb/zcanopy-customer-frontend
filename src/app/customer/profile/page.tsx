'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webApi, setSession } from '@/lib/api';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('zcanopy_token');
if (!token) {
        router.replace('/customer');
        return;
      }
    loadProfile(token);
  }, [router]);

  const loadProfile = async (token: string) => {
    try {
      const data = await webApi.customer.getProfile(token);
      setProfile(data);
      setPhone(data.phoneNumber || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('zcanopy_token');
    if (!token) return;
    setSaving(true);
    try {
      await webApi.customer.updatePhone(token, phone);
      alert('Phone number updated');
      await loadProfile(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update phone');
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>My Profile</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {profile && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">First Name</p>
                <p className="mt-1 text-sm text-gray-900">{profile.firstName || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last Name</p>
                <p className="mt-1 text-sm text-gray-900">{profile.lastName || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Verified</p>
                <p className="mt-1 text-sm text-gray-900">{profile.isVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdatePhone} className="rounded-2xl border border-[var(--zcanopy-border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Update Phone Number</h2>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30"
                required
              />
            </div>
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

