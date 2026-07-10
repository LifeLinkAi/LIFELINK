'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Droplets, Heart, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, Search, Activity, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
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
  { event: 'Request Dispatched', statuses: ['PENDING', 'DONOR_NOTIFIED', 'PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Donors Alerted',     statuses: ['DONOR_NOTIFIED', 'PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Donor Secured',      statuses: ['PENDING_HOSPITAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Hospital Clear',     statuses: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
  { event: 'Mission Success',    statuses: ['COMPLETED'] },
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
  PENDING:          { label: 'Pending',          color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  DONOR_NOTIFIED:   { label: 'Donors Alerted',   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  PENDING_HOSPITAL: { label: 'Donor Secured',    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  APPROVED:         { label: 'Hospital Clear',   color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  IN_PROGRESS:      { label: 'In Progress',      color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  COMPLETED:        { label: 'Completed',        color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200' },
  CANCELLED:        { label: 'Cancelled',        color: 'text-slate-500',  bg: 'bg-slate-100', border: 'border-slate-200' },
};

const TYPE_CONFIG: Record<RequestType, { icon: React.ReactNode; color: string; bg: string }> = {
  Blood:     { icon: <Droplets size={16} />, color: 'text-rose-600', bg: 'bg-rose-100/50' },
  Organ:     { icon: <Heart     size={16} />, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
};

const URGENCY_COLORS: Record<string, string> = {
  critical: 'rose-500', high: 'orange-500', medium: 'blue-500', low: 'emerald-500',
};

const FILTERS = [
  { key: 'all',        label: 'All Missions' },
  { key: 'active',     label: 'Active' },
  { key: 'COMPLETED',  label: 'Success' },
  { key: 'CANCELLED',  label: 'Aborted' },
];

function RequestCard({ req }: { req: PatientRequest }) {
  const [expanded, setExpanded] = useState(req.status !== 'COMPLETED' && req.status !== 'CANCELLED');
  const statusKey = (req.status in STATUS_CONFIG ? req.status : 'PENDING') as RequestStatus;
  const sc = STATUS_CONFIG[statusKey];
  const tc = TYPE_CONFIG[req.type];
  const borderColor = URGENCY_COLORS[req.urgency] ?? 'emerald-500';

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white bg-white/60 backdrop-blur-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
      {/* Header row */}
      <div
        className="flex cursor-pointer flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-white/40 sm:flex-nowrap"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner", tc.bg, tc.color)}>
          {tc.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[15px] font-extrabold text-slate-800 uppercase tracking-widest">{req.id.slice(-6)}</span>
            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest", tc.bg, tc.color)}>
              {req.type}
            </span>
            <div className={cn(`w-2 h-2 rounded-full bg-${borderColor}`)} title={`Urgency: ${req.urgency}`} />
          </div>
          <p className="text-[13px] font-bold text-slate-600 mt-1">{req.detail}</p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">
            Initiated {req.createdAt}
          </p>
        </div>

        <span className={cn("order-4 ml-[64px] text-[11px] font-bold px-3 py-1.5 rounded-full border flex-shrink-0 sm:order-none sm:ml-0 uppercase tracking-wider shadow-sm", sc.color, sc.bg, sc.border)}>
          {sc.label}
        </span>

        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center border border-white shadow-sm flex-shrink-0 ml-2">
          {expanded
            ? <ChevronUp   size={16} className="text-slate-500" />
            : <ChevronDown size={16} className="text-slate-500" />
          }
        </div>
      </div>

      {/* Timeline */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 bg-white/30 border-t border-white/50">
          {(req.status === 'APPROVED' || req.status === 'PENDING_HOSPITAL') && req.donorName && (
            <div className="mb-6 mt-4 rounded-2xl bg-indigo-50/50 backdrop-blur border border-indigo-100 p-5 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 blur-xl rounded-full" />
              <p className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={14} /> Donor Secured
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Code Name</span>
                  <span className="text-slate-800 font-extrabold text-[13px]">{req.donorName}</span>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Blood Type</span>
                  <span className="text-rose-600 font-extrabold text-[13px]">{req.donorBloodType || 'N/A'}</span>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Timestamp</span>
                  <span className="text-slate-700 font-bold text-[12px]">
                    {req.acceptedAt ? formatRegisteredDate(req.acceptedAt) : 'N/A'}
                  </span>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Facility</span>
                  <span className="text-slate-700 font-bold text-[12px] truncate block">{req.hospital}</span>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-6 mb-4 px-2">
            Mission Timeline
          </p>
          <div className="flex flex-col px-2">
            {req.timeline.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0 w-4">
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 border-2 shadow-sm relative z-10',
                    t.done ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/20' :
                    i === req.timeline.findIndex(x => !x.done) ? 'bg-blue-500 border-blue-400 animate-pulse shadow-blue-500/50' :
                    'bg-slate-200 border-slate-300'
                  )} />
                  {i < req.timeline.length - 1 && (
                    <div className={cn('w-0.5 flex-1 my-1 min-h-[24px]',
                      t.done ? 'bg-emerald-200' : 'bg-slate-200'
                    )} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={cn(
                    'text-[14px]',
                    t.done ? 'text-slate-800 font-bold' :
                    i === req.timeline.findIndex(x => !x.done)
                      ? 'text-blue-700 font-extrabold'
                      : 'text-slate-400 font-medium'
                  )}>
                    {t.event}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{t.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center pt-4 border-t border-white/50">
            {req.status === 'COMPLETED' && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[13px] text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                <CheckCircle size={16} /> Mission Accomplished
              </div>
            )}
            
            {['PENDING', 'DONOR_NOTIFIED'].includes(req.status) && (
              <Link 
                href={`/patient/select-donors?requestId=${req.id}`}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[13px] font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-lg sm:w-auto"
              >
                <Activity size={16} /> Monitor Radar
              </Link>
            )}

            {req.canCancel && (
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white/50 px-6 py-3 text-[13px] font-bold text-rose-600 transition-colors hover:bg-rose-50 sm:ml-auto sm:w-auto shadow-sm">
                <XCircle size={16} /> Abort Request
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
  const lastUpdated = useAppSelector(state => state.notifications.lastUpdated);

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
    const interval = setInterval(fetchHistory, 30_000);
    return () => clearInterval(interval);
  }, [user, lastUpdated]);

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
    { label: 'Total Missions',    value: displayRequests.length,    color: 'text-slate-800' },
    { label: 'Active Radar',      value: counts.active,             color: 'text-blue-600'  },
    { label: 'Successes',         value: counts.COMPLETED,          color: 'text-emerald-600'},
    { label: 'Aborted',           value: counts.CANCELLED,          color: 'text-slate-400' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Ambient Background Blobs */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Mission Log</h1>
            <p className="text-[15px] font-medium text-slate-500 mt-2">
              Track live updates and historical archives for all your requests.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className={cn(
              'flex min-h-12 w-full items-center justify-center gap-2 px-6 py-3 rounded-2xl border text-[14px] font-bold transition-all shadow-sm sm:w-auto',
              loading
                ? 'border-white bg-white/40 text-slate-400 cursor-not-allowed'
                : 'border-white bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md'
            )}
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} /> {loading ? 'Syncing…' : 'Sync Radar'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-sm hover:shadow-md transition-all text-center">
              <p className={cn('text-4xl font-extrabold tracking-tight mb-2', s.color)}>{s.value}</p>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold border transition-all shadow-sm',
                filter === f.key
                  ? 'bg-slate-900 text-white border-transparent scale-105'
                  : 'bg-white/60 backdrop-blur text-slate-600 border-white hover:bg-white hover:text-slate-900'
              )}>
              {f.label}
              <span className={cn('text-[11px] font-extrabold px-2 py-0.5 rounded-full',
                filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200/50 text-slate-500'
              )}>
                {counts[f.key as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Request list */}
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-16 flex flex-col items-center gap-4 text-center">
              <Activity size={32} className="text-blue-400 animate-pulse" />
              <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Syncing Archives…</p>
            </div>
          ) : visible.length > 0 ? (
            visible.map(r => <RequestCard key={r.id} req={r} />)
          ) : (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-16 flex flex-col items-center gap-4 text-center">
              <ShieldCheck size={32} className="text-slate-300" />
              <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">No missions match criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
