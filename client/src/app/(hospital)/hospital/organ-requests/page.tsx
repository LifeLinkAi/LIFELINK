'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Tab = 'Pending Reviews' | 'Active Matches' | 'Fulfilled History';

const TABS: Tab[] = ['Pending Reviews', 'Active Matches', 'Fulfilled History'];

type IncomingRequest = {
  id: string;
  type: 'Blood' | 'Organ';
  patientName?: string;
  detail?: string;
  urgency?: string;
  status: string;
};

export default function OrganRequestsPage() {
  const [tab, setTab] = useState<Tab>('Pending Reviews');
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/requests/hospital/incoming');
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (!mounted) return;
        setRequests(data.filter((r: any) => r.type === 'Organ'));
      } catch (err: any) {
        toast.error(err?.response?.data?.error?.message || err.message || 'Unable to load requests');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id: string, status: 'APPROVED' | 'IN_PROGRESS' | 'FULFILLED') => {
    setActionLoading(id);
    try {
      const res = await api.patch(`/requests/${id}/status`, { status });
      const updated = res.data?.data ?? res.data;
      setRequests(prev => prev.map(r => r.id === updated.id ? { ...r, status: updated.status } : r));
      toast.success('Request updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const items = useMemo(() => requests, [requests]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Organ Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Review organ donation requests and medical verification flow.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[#D0CCBC] bg-white px-4 py-2 text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648]">
          <Filter size={14} /> Filter
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              'rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-all',
              tab === item ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]' : 'bg-white text-[#6B7A5A] border-[#E8E4D8] hover:border-[#7AB648]'
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#F5F5F3] rounded-xl h-36" />
          ))
        ) : (
          items.map(request => (
            <article key={request.id} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Heart size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a2e0a]">{request.id}</p>
                    <p className="text-[12px] text-[#8A9A7A]">Patient {request.patientName ?? '—'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#F5F2E8] px-2.5 py-1 text-[11px] font-semibold text-[#3A4A2A]">{request.urgency ?? request.status}</span>
              </div>
              <p className="mt-4 text-[13px] text-[#3A4A2A]">{request.detail}</p>
              <div className="mt-4 flex gap-2">
                {request.status === 'PENDING' && (
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => updateStatus(request.id, 'APPROVED')}
                    className="rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2B4A18]"
                  >
                    {actionLoading === request.id ? 'Saving…' : 'Approve'}
                  </button>
                )}
                {request.status === 'APPROVED' && (
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => updateStatus(request.id, 'IN_PROGRESS')}
                    className="rounded-lg bg-amber-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-amber-700"
                  >
                    {actionLoading === request.id ? 'Saving…' : 'Start'}
                  </button>
                )}
                {request.status === 'IN_PROGRESS' && (
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => updateStatus(request.id, 'FULFILLED')}
                    className="rounded-lg bg-green-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-green-700"
                  >
                    {actionLoading === request.id ? 'Saving…' : 'Fulfill'}
                  </button>
                )}
                <button className="rounded-lg border border-[#D0CCBC] bg-white px-3 py-2 text-[12px] font-semibold text-[#3A4A2A] hover:border-[#7AB648]">Open Timeline</button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
