'use client';

import { useEffect, useMemo, useState } from 'react';
import { Droplets } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { RequestBoard } from '../request-board';

type Tab = 'Pending Reviews' | 'Active Matches' | 'Fulfilled History';

const TABS: Tab[] = ['Pending Reviews', 'Active Matches', 'Fulfilled History'];

type IncomingRequest = {
  id: string;
  type: 'Blood' | 'Organ';
  patientName?: string;
  detail?: string;
  urgency?: string;
  status: string;
  facility?: string;
};

export default function BloodRequestsPage() {
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
        setRequests(data.filter((r: any) => r.type === 'Blood'));
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
    <RequestBoard
      title="Blood Requests"
      subtitle="Review, match, and close blood donation requests."
      icon={<Droplets size={18} />}
      tab={tab}
      tabs={TABS}
      onTabChange={setTab}
      items={items}
      loading={loading}
      updateStatus={updateStatus}
      actionLoading={actionLoading}
      accent="red"
    />
  );
}
