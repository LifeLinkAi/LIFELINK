'use client';
import { useState } from 'react';
import { Clock, Droplets, Heart, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type RequestType   = 'Blood' | 'Organ';
type RequestStatus = 'PENDING' | 'MATCHING' | 'DONOR_FOUND' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
}

const REQUESTS: PatientRequest[] = [
  {
    id: 'BR-2533', type: 'Blood', status: 'MATCHING',
    createdAt: '10 mins ago', updatedAt: '2 mins ago',
    urgency: 'critical', detail: 'O− · 2 units · LifeLink Main Campus',
    hospital: 'LifeLink Main Campus',
    canCancel: true,
    timeline: [
      { time: '10:42 AM', event: 'Request submitted',           done: true  },
      { time: '10:43 AM', event: 'AI matching started',         done: true  },
      { time: '—',        event: 'Donor found & notified',      done: false },
      { time: '—',        event: 'Donation confirmed',          done: false },
      { time: '—',        event: 'Request fulfilled',           done: false },
    ],
  },
  {
    id: 'ORG-441', type: 'Organ', status: 'DONOR_FOUND',
    createdAt: '2 hrs ago', updatedAt: '30 mins ago',
    urgency: 'critical', detail: 'Kidney · O+ · LifeLink Main Campus',
    hospital: 'LifeLink Main Campus',
    canCancel: true,
    timeline: [
      { time: '08:30 AM', event: 'Request submitted',           done: true  },
      { time: '08:31 AM', event: 'AI matching started',         done: true  },
      { time: '09:15 AM', event: 'Compatible donor found',      done: true  },
      { time: '—',        event: 'Medical verification',        done: false },
      { time: '—',        event: 'Legal clearance',             done: false },
      { time: '—',        event: 'Surgery scheduled',           done: false },
    ],
  },
  {
    id: 'BR-2028', type: 'Blood', status: 'COMPLETED',
    createdAt: '3 days ago', updatedAt: '3 days ago',
    urgency: 'medium', detail: 'O− · 1 unit · Baby Memorial Hospital',
    hospital: 'Baby Memorial Hospital',
    canCancel: false,
    timeline: [
      { time: 'Day 1', event: 'Request submitted',              done: true },
      { time: 'Day 1', event: 'Donor matched',                  done: true },
      { time: 'Day 1', event: 'Donation completed',             done: true },
      { time: 'Day 1', event: 'Request fulfilled',              done: true },
    ],
  },
];

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:     { label: '● Pending',     color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D' },
  MATCHING:    { label: '⟳ Matching',   color: '#5B21B6', bg: '#EDE8FF', border: '#C4B5FD' },
  DONOR_FOUND: { label: '✦ Donor Found', color: '#1A5FAA', bg: '#E3F0FF', border: '#93C5FD' },
  IN_PROGRESS: { label: '↑ In Progress', color: '#0369a1', bg: '#E0F2FE', border: '#7DD3FC' },
  COMPLETED:   { label: '✓ Completed',   color: '#2B6B0A', bg: '#E8F5E0', border: '#86EFAC' },
  CANCELLED:   { label: '✕ Cancelled',   color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
};

const TYPE_CONFIG: Record<RequestType, { icon: React.ReactNode; color: string; bg: string }> = {
  Blood:     { icon: <Droplets size={15} />, color: '#CC0000', bg: '#FFE5E5' },
  Organ:     { icon: <Heart    size={15} />, color: '#5B21B6', bg: '#EDE8FF' },
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
  const sc = STATUS_CONFIG[req.status];
  const tc = TYPE_CONFIG[req.type];
  const borderColor = URGENCY_COLORS[req.urgency];

  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}>

      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
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

        <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
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
          <div className="flex gap-2.5 mt-2">
            {req.status === 'COMPLETED' && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-green-700 font-medium">
                <CheckCircle size={14} /> Fulfilled successfully
              </div>
            )}
            {req.canCancel && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-[12px] font-medium rounded-lg hover:bg-red-50 transition-colors ml-auto">
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

  const ACTIVE_STATUSES = ['PENDING', 'MATCHING', 'DONOR_FOUND', 'IN_PROGRESS'];

  const visible = REQUESTS.filter(r => {
    if (filter === 'all')       return true;
    if (filter === 'active')    return ACTIVE_STATUSES.includes(r.status);
    return r.status === filter;
  });

  const counts = {
    all:       REQUESTS.length,
    active:    REQUESTS.filter(r => ACTIVE_STATUSES.includes(r.status)).length,
    COMPLETED: REQUESTS.filter(r => r.status === 'COMPLETED').length,
    CANCELLED: REQUESTS.filter(r => r.status === 'CANCELLED').length,
  };

  const stats = [
    { label: 'Total',    value: REQUESTS.length,    color: '' },
    { label: 'Active',   value: counts.active,       color: 'text-red-600'   },
    { label: 'Completed',value: counts.COMPLETED,    color: 'text-green-700' },
    { label: 'Cancelled',value: counts.CANCELLED,    color: 'text-[#8A9A7A]' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">My Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Track all your blood and organ requests.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
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
        {visible.length > 0
          ? visible.map(r => <RequestCard key={r.id} req={r} />)
          : (
            <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
              No requests in this category.
            </div>
          )
        }
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Request Blood',     href: '/patient/request-blood',     icon: <Droplets  size={16} />, color: '#CC0000' },
          { label: 'Request Organ',     href: '/patient/request-organ',     icon: <Heart     size={16} />, color: '#5B21B6' },
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

