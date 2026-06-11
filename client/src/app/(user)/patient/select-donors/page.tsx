'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function SelectDonorsPage() {
  const search = useSearchParams();
  const router = useRouter();
  const requestId = search?.get('requestId') || '';
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    api.get(`/requests/${requestId}/find-matches`).then(res => {
      if (res.data?.success) setDonors(res.data.data || []);
    }).catch(err => {
      toast.error('Failed to load matches.');
    }).finally(() => setLoading(false));
  }, [requestId]);

  const toggle = (id: string) => setSelected(s => ({ ...s, [id]: !s[id] }));

  const confirmAndSend = async () => {
    const selectedIds = Object.keys(selected).filter(k => selected[k]);
    if (selectedIds.length === 0) {
      toast.error('Select at least one donor.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/requests/${requestId}/dispatch`, { selectedDonorIds: selectedIds });
      if (res.data?.success) {
        toast.success('Invitations sent to selected donors.');
        router.push('/patient/request-status');
      } else {
        toast.error('Failed to dispatch donors.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Dispatch failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Select Donors</h1>
      <p className="mb-4">Request ID: <strong>{requestId}</strong></p>
      {loading && <p>Loading matches…</p>}
      {!loading && donors.length === 0 && <p>No matches found.</p>}
      <div className="grid grid-cols-2 gap-4">
        {donors.map(d => (
          <div key={d.donorId} className="p-4 border rounded">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={!!selected[d.donorId]} onChange={() => toggle(d.donorId)} />
              <div>
                <p className="font-semibold">{d.name || d.userId?.name || 'Donor'}</p>
                <p className="text-sm text-gray-600">{d.bloodType || ''} • {d.distance ? `${d.distance.toFixed(2)} km` : ''}</p>
                <p className="text-sm text-gray-500">{d.tier || ''}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={confirmAndSend} className="px-4 py-2 bg-green-600 text-white rounded">Confirm & Send Invitations</button>
      </div>
    </div>
  );
}
