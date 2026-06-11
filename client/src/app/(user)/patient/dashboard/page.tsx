'use client';
import { useEffect, useMemo, useState } from 'react';
import { Siren, Droplets, Heart, Clock, MapPin, FileHeart, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

type RequestType = 'Blood' | 'Organ';
type RequestStatus = 'PENDING' | 'MATCHING' | 'DONOR_FOUND' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BackendRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  registeredDate: string;
  facility: string;
  bloodGroup?: string;
  organType?: string;
  units?: number;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

const ACTIVE_STATUSES: RequestStatus[] = ['PENDING', 'MATCHING', 'DONOR_FOUND', 'IN_PROGRESS'];

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  MATCHING: 'Matching',
  DONOR_FOUND: 'Donor found',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  PENDING: '#B86E00',
  MATCHING: '#5B21B6',
  DONOR_FOUND: '#1A5FAA',
  IN_PROGRESS: '#0369A1',
  COMPLETED: '#2B6B0A',
  CANCELLED: '#6B7280',
};

const QUICK_ACTIONS = [
  { label: 'SOS Emergency',     href: '/patient/sos',                icon: <Siren     size={22} />, color: '#CC0000', bg: '#FFE5E5', urgent: true  },
  { label: 'Request Blood',     href: '/patient/request-blood',      icon: <Droplets  size={22} />, color: '#CC0000', bg: '#FFF0F0', urgent: false },
  { label: 'Request Organ',     href: '/patient/request-organ',      icon: <Heart     size={22} />, color: '#5B21B6', bg: '#F0EEFF', urgent: false },
  { label: 'My Requests',       href: '/patient/request-status',     icon: <Clock     size={22} />, color: '#1A5FAA', bg: '#EFF6FF', urgent: false },
  { label: 'Nearby Hospitals',  href: '/patient/nearby-hospitals',   icon: <MapPin    size={22} />, color: '#2B6B0A', bg: '#F0FDF4', urgent: false },
  { label: 'Medical History',   href: '/patient/medical-history',    icon: <FileHeart size={22} />, color: '#6B7A5A', bg: '#F5F2E8', urgent: false },
];

const TYPE_ICONS = {
  Blood: <Droplets size={14} />,
  Organ: <Heart size={14} />,
};

const TYPE_COLORS = {
  Blood: { color: '#CC0000', bg: '#FFE5E5' },
  Organ: { color: '#5B21B6', bg: '#EDE8FF' },
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function buildRequestSummary(req: BackendRequest) {
  const typeLabel = req.type === 'Blood'
    ? `${req.bloodGroup || 'Unknown'} · ${req.units ?? 0} unit${req.units === 1 ? '' : 's'}`
    : `${req.organType || 'Organ'} · ${req.bloodGroup || 'Unknown'}`;

  return `${req.type} request ${req.id} — ${typeLabel} · ${STATUS_LABELS[req.status] ?? req.status}`;
}

export default function PatientDashboard() {
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{ success: true; data: BackendRequest[] }>('/requests/my-history');
        setRequests(response.data.data || []);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || err?.message || 'Unable to load dashboard data.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const orderedRequests = useMemo(() => {
    return [...requests].sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime());
  }, [requests]);

  const stats = useMemo(() => {
    const activeCount = requests.filter(r => ACTIVE_STATUSES.includes(r.status)).length;
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
    return [
      { label: 'Active Requests', value: activeCount, note: 'Currently in progress', color: 'text-red-600' },
      { label: 'Pending Approvals', value: pendingCount, note: 'Waiting for donor response', color: 'text-amber-600' },
      { label: 'Completed Requests', value: completedCount, note: 'Fulfilled successfully', color: 'text-green-700' },
      { label: 'Total Requests', value: requests.length, note: 'All requests submitted', color: 'text-[#1a2e0a]' },
    ];
  }, [requests]);

  const recentRequests = useMemo(() => orderedRequests.slice(0, 4), [orderedRequests]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">
            Good morning, Patient 👋
          </h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Here is your health overview and active requests.
          </p>
        </div>
        <a href="/patient/sos"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13.5px] font-bold rounded-xl transition-colors animate-pulse hover:animate-none">
          <Siren size={16} /> SOS Emergency
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <p className="text-[12px] font-medium text-[#6B7A5A] uppercase tracking-wide">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none mt-2', s.color)}>{loading ? '—' : s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-[#1a2e0a] mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(a => (
            <a key={a.label} href={a.href}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md',
                a.urgent
                  ? 'border-red-300 bg-red-50 hover:border-red-500'
                  : 'border-[#E8E4D8] bg-white hover:border-[#7AB648]'
              )}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </div>
              <span className={cn(
                'text-[12px] font-semibold text-center leading-tight',
                a.urgent ? 'text-red-700' : 'text-[#1a2e0a]'
              )}>
                {a.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1a2e0a]">Recent Activity</p>
            <a href="/patient/request-status" className="text-[12px] font-medium text-[#3A4A2A] hover:underline">
              View all
            </a>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-[#E8E4D8] p-10 text-center text-[#8A9A7A]">
              Loading recent activity…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="rounded-xl border border-[#E8E4D8] p-10 text-center text-[#8A9A7A]">
              No recent requests yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {recentRequests.map((req, index) => (
                <div key={req.id} className="flex gap-3 pb-3">
                  <div className="flex flex-col items-center flex-shrink-0 w-3">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ background: STATUS_DOT[req.status] }} />
                    {index < recentRequests.length - 1 && (
                      <div className="w-px flex-1 bg-[#E8E4D8] my-1 min-h-[16px]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide">
                      {formatRelativeTime(req.registeredDate)}
                    </p>
                    <p className="text-[12.5px] text-[#3A4A2A] leading-relaxed mt-0.5">
                      {buildRequestSummary(req)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-[28px] font-bold text-[#1a2e0a] leading-none">
                {loading ? '—' : requests.filter(r => r.status === 'COMPLETED').length}
              </p>
              <p className="text-[12.5px] text-[#6B7A5A] mt-1">Requests fulfilled successfully</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex-1">
            <p className="text-[13px] font-semibold text-[#1a2e0a] mb-3">Reminders</p>
            <div className="flex flex-col gap-2.5">
              {[
                { text: 'Dialysis session today at 2:00 PM', color: '#CC0000', bg: '#FFE5E5' },
                { text: 'Influenza vaccine due Oct 2024', color: '#B86E00', bg: '#FFF3E0' },
                { text: 'Follow-up with Dr. Kumar on 20 Apr', color: '#1A5FAA', bg: '#E3F0FF' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                  style={{ background: r.bg }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: r.color }} />
                  <span className="text-[12.5px] font-medium" style={{ color: r.color }}>
                    {r.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
