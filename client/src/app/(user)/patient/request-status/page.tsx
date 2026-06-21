'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Droplets, Heart, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type RequestType   = 'Blood' | 'Organ';
type RequestStatus = 'PENDING' | 'DONOR_NOTIFIED' | 'PENDING_HOSPITAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BackendRequest {
  id: string;
  userId: string;
  patientName: string;
  facility: string;
  age: number;
  gender: string;
  organType: string;
  bloodGroup: string;
  units: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: RequestStatus;
  matchPercentage: number;
  registeredDate: string;
  distance?: string;
  facilityType: string;
  time?: string;
  notes?: string;
  type: RequestType;
  donorName?: string;
  donorBloodType?: string;
  acceptedAt?: string;
}

interface PatientRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  detail: string;
  hospital: string;
  timeline: { time: string; event: string; done: boolean }[];
  canCancel: boolean;
  donorName?: string;
  donorBloodType?: string;
  acceptedAt?: string;
}

const TIMELINE_STEPS: Array<{ event: string; statuses: RequestStatus[] }> = [
  { event: 'Request Submitted',  statuses: ['PENDING', 'DONOR_NOTIFIED', 'PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Donors Notified',    statuses: ['DONOR_NOTIFIED', 'PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Donor Accepted',     statuses: ['PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Hospital Approved',  statuses: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Donation Completed', statuses: ['COMPLETED'] },
];

function formatRegisteredDate(value: string): string {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date);
  } catch {
    return value;
  }
}

function buildTimeline(req: BackendRequest): PatientRequest['timeline'] {
  return TIMELINE_STEPS.map((step, index) => ({
    time: index === 0 ? formatRegisteredDate(req.registeredDate) : req.time || '—',
    event: step.event,
    done: step.statuses.includes(req.status),
  }));
}

function normalizeStatus(status: string): RequestStatus {
  const rawStatus = status.toUpperCase();
  if (['COMPLETED', 'FULFILLED'].includes(rawStatus)) return 'COMPLETED';
  if (['IN_PROGRESS'].includes(rawStatus)) return 'IN_PROGRESS';
  if (['APPROVED', 'ACCEPTED'].includes(rawStatus)) return 'APPROVED';
  if (['PENDING_HOSPITAL'].includes(rawStatus)) return 'PENDING_HOSPITAL';
  if (['DONOR_NOTIFIED', 'DONOR_FOUND', 'MATCHING'].includes(rawStatus)) return 'DONOR_NOTIFIED';
  if (rawStatus === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

function mapBackendRequest(req: BackendRequest): PatientRequest {
  const detail = req.type === 'Blood'
    ? `${req.bloodGroup || 'Unknown'} · ${req.units} unit${req.units === 1 ? '' : 's'} · ${req.facility}`
    : `${req.organType || 'Organ'} · ${req.bloodGroup || 'Unknown'} · ${req.facility}`;

  const status = normalizeStatus(typeof req.status === 'string' ? req.status : 'PENDING');

  return {
    id: req.id,
    type: req.type,
    status,
    createdAt: formatRegisteredDate(req.registeredDate),
    updatedAt: req.time || formatRegisteredDate(req.registeredDate),
    urgency: req.urgency || 'low',
    detail,
    hospital: req.facility,
    timeline: buildTimeline({ ...req, status }),
    canCancel: ['PENDING', 'DONOR_NOTIFIED'].includes(status),
    donorName: req.donorName,
    donorBloodType: req.donorBloodType,
    acceptedAt: req.acceptedAt,
  };
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:          { label: 'Pending',          color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D' },
  DONOR_NOTIFIED:   { label: 'Donors Notified',  color: '#1A5FAA', bg: '#E3F0FF', border: '#93C5FD' },
  PENDING_HOSPITAL: { label: 'Donor Accepted',   color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD' },
  APPROVED:         { label: 'Hospital Approved',color: '#0369a1', bg: '#E0F2FE', border: '#7DD3FC' },
  IN_PROGRESS:      { label: 'In Progress',      color: '#0369a1', bg: '#E0F2FE', border: '#7DD3FC' },
  COMPLETED:        { label: 'Completed',        color: '#2B6B0A', bg: '#E8F5E0', border: '#86EFAC' },
  CANCELLED:        { label: 'Cancelled',        color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
};

const TYPE_CONFIG: Record<RequestType, { icon: React.ReactNode; color: string; bg: string }> = {
  Blood:     { icon: <Droplets size={15} />, color: '#CC0000', bg: '#FFE5E5' },
  Organ:     { icon: <Heart     size={15} />, color: '#5B21B6', bg: '#EDE8FF' },
};

const URGENCY_COLORS: Record<string, string> = {
  critical: '#CC0000', high: '#B86E00', medium: '#1A5FAA', low: '#2B6B0A',
};

const FILTERS = [
  { key: 'all',        label: 'All'        },
  { key: 'active',     label: 'Active'     },
  { key: 'COMPLETED',  label: 'Completed'  },
  { key: 'CANCELLED',  label: 'Cancelled'  },
];

function RequestCard({ req }: { req: PatientRequest }) {
  const [expanded, setExpanded] = useState(req.status !== 'COMPLETED' && req.status !== 'CANCELLED');
  const statusKey = (req.status in STATUS_CONFIG ? req.status : 'PENDING') as RequestStatus;
  const sc = STATUS_CONFIG[statusKey];
  const tc = TYPE_CONFIG[req.type];
  const borderColor = URGENCY_COLORS[req.urgency] ?? URGENCY_COLORS.low;

  return (
    <div className="overflow-hidden rounded-xl border border-[#E8E4D8] bg-white"
      style={{ borderLeft: `3px solid ${borderColor}` }}>

      {/* Header row */}
      <div
        className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-[#FAFAF7] sm:flex-nowrap sm:gap-4 sm:px-5"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tc.bg, color: tc.color }}>
          {tc.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-[#1a2e0a]">{req.id}</span>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: tc.bg, color: tc.color }}>
              {req.type}
            </span>
          </div>
          <p className="text-[12px] text-[#8A9A7A] mt-0.5">{req.detail}</p>
          <p className="text-[11px] text-[#C0CCBC] mt-0.5">
            Created {req.createdAt} · Updated {req.updatedAt}
          </p>
        </div>

        <span className="order-4 ml-[52px] text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 sm:order-none sm:ml-0"
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
          {sc.label}
        </span>

        {expanded
          ? <ChevronUp   size={16} className="text-[#8A9A7A] flex-shrink-0" />
          : <ChevronDown size={16} className="text-[#8A9A7A] flex-shrink-0" />
        }
      </div>

      {/* Timeline */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#F0EDE3] bg-[#FAFAF7]">
          {(req.status === 'APPROVED' || req.status === 'PENDING_HOSPITAL') && req.donorName && (
            <div className="mb-4 mt-4 rounded-xl bg-sky-50 border border-sky-100 p-4">
              <p className="text-[11px] font-bold text-sky-850 uppercase tracking-wide mb-2">Donor Details</p>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[#8A9A7A] font-semibold">Name:</span>{' '}
                  <span className="text-[#1a2e0a] font-bold">{req.donorName}</span>
                </div>
                <div>
                  <span className="text-[#8A9A7A] font-semibold">Blood Type:</span>{' '}
                  <span className="text-[#1a2e0a] font-bold">{req.donorBloodType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#8A9A7A] font-semibold">Acceptance Time:</span>{' '}
                  <span className="text-[#1a2e0a] font-medium">
                    {req.acceptedAt ? formatRegisteredDate(req.acceptedAt) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A9A7A] font-semibold">Hospital:</span>{' '}
                  <span className="text-[#1a2e0a] font-semibold">{req.hospital}</span>
                </div>
              </div>
            </div>
          )}
          <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mt-4 mb-3">
            Timeline
          </p>
          <div className="flex flex-col">
            {req.timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0 w-4">
                  <div className={cn(
                    'w-3 h-3 rounded-full mt-1 flex-shrink-0',
                    t.done ? 'bg-green-500' :
                    i === req.timeline.findIndex(x => !x.done) ? 'bg-red-500 animate-pulse' :
                    'bg-[#D0CCBC]'
                  )} />
                  {i < req.timeline.length - 1 && (
                    <div className={cn('w-0.5 flex-1 my-1 min-h-[16px]',
                      t.done ? 'bg-green-200' : 'bg-[#E8E4D8]'
                    )} />
                  )}
                </div>
                <div className="pb-3">
                  <p className={cn(
                    'text-[13px]',
                    t.done ? 'text-[#3A4A2A] font-medium' :
                    i === req.timeline.findIndex(x => !x.done)
                      ? 'text-red-700 font-semibold'
                      : 'text-[#C0CCBC]'
                  )}>
                    {t.event}
                  </p>
                  <p className="text-[11px] text-[#8A9A7A] mt-0.5">{t.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-2 flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            {req.status === 'COMPLETED' && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-green-700 font-medium">
                <CheckCircle size={14} /> Fulfilled successfully
              </div>
            )}
            
            {/* Conditional Matching Access Option */}
            {['PENDING', 'DONOR_NOTIFIED'].includes(req.status) && (
              <Link 
                href={`/patient/select-donors?requestId=${req.id}`}
                className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#2B4A18] sm:w-auto"
              >
                <Search size={13} /> View Matches
              </Link>
            )}

            {req.canCancel && (
              <button className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 sm:ml-auto sm:w-auto">
                <XCircle size={13} /> Cancel Request
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestStatusPage() {
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const ACTIVE_STATUSES = ['PENDING', 'DONOR_NOTIFIED', 'PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS'];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await api.get<{ success: true; data: BackendRequest[] }>('/requests/my-history', { headers });
      setRequests(response.data.data || []);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || 'Unable to load request history.';
      toast.error(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchHistory();
    // Auto-poll every 30 s so donor accept/decline is reflected without manual refresh
    const interval = setInterval(fetchHistory, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const displayRequests = requests.map(mapBackendRequest);

  const visible = displayRequests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(r.status);
    return r.status === filter;
  });

  const counts = {
    all:       displayRequests.length,
    active:    displayRequests.filter(r => ACTIVE_STATUSES.includes(r.status)).length,
    COMPLETED: displayRequests.filter(r => r.status === 'COMPLETED').length,
    CANCELLED: displayRequests.filter(r => r.status === 'CANCELLED').length,
  };

  const stats = [
    { label: 'Total',    value: displayRequests.length,    color: '' },
    { label: 'Active',   value: counts.active,              color: 'text-red-600'   },
    { label: 'Completed',value: counts.COMPLETED,           color: 'text-green-700' },
    { label: 'Cancelled',value: counts.CANCELLED,           color: 'text-[#8A9A7A]' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a2e0a] sm:text-[28px]">My Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Track all your blood and organ requests.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className={cn(
            'flex min-h-10 w-full items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors sm:w-auto',
            loading
              ? 'border-[#E8E4D8] bg-[#F5F5F3] text-[#8A9A7A] cursor-not-allowed'
              : 'border-[#D0CCBC] bg-white text-[#3A4A2A] hover:border-[#7AB648]'
          )}
        >
          <RefreshCw size={13} /> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 text-center">
            <p className={cn('text-[26px] font-bold leading-none', s.color || 'text-[#1a2e0a]')}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all',
              filter === f.key
                ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]'
                : 'bg-white text-[#5A6A4A] border-[#D0CCBC] hover:border-[#7AB648]'
            )}>
            {f.label}
            <span className={cn('text-[11px] px-1.5 py-0.5 rounded-full',
              filter === f.key ? 'bg-white/20 text-white' : 'bg-[#F0EDE3] text-[#6B7A5A]'
            )}>
              {counts[f.key as keyof typeof counts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
            Loading your request history…
          </div>
        ) : visible.length > 0 ? (
          visible.map(r => <RequestCard key={r.id} req={r} />)
        ) : (
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
            No requests in this category.
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: 'Request Blood',     href: '/patient/request-blood',     icon: <Droplets  size={16} />, color: '#CC0000' },
        ].map(l => (
          <a key={l.label} href={l.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-[#E8E4D8] hover:border-[#7AB648] transition-colors text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#F5F2E8', color: l.color }}>
              {l.icon}
            </div>
            <span className="text-[12px] font-medium text-[#3A4A2A]">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
