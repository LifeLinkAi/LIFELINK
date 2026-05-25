'use client';
import { useState } from 'react';
import { Heart, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────
type OrganStatus = 'PENDING' | 'MATCHING' | 'DONOR_FOUND' | 'UNDER_VERIFICATION' | 'APPROVED' | 'SURGERY_SCHEDULED' | 'COMPLETED' | 'CANCELLED';
type Urgency = 'critical' | 'high' | 'medium' | 'low';

interface OrganRequest {
  id: string;
  patientName: string;
  initials: string;
  age: number;
  bloodGroup: string;
  organType: string;
  urgency: Urgency;
  status: OrganStatus;
  aiMatch: number;
  requestedAt: string;
  ward: string;
  condition: string;
  donorName?: string;
  surgeryDate?: string;
}

// ── Data ──────────────────────────────────────────────
const REQUESTS: OrganRequest[] = [
  {
    id: 'ORG-441', patientName: 'Arjun Pillai',    initials: 'AP',
    age: 34, bloodGroup: 'O+', organType: 'Kidney',
    urgency: 'critical', status: 'SURGERY_SCHEDULED',
    aiMatch: 98, requestedAt: '2 hrs ago',
    ward: 'Nephrology · Bed 4',
    condition: 'End-stage renal disease. Dialysis dependent.',
    donorName: 'Rahul M.', surgeryDate: 'Today, 18:00',
  },
  {
    id: 'ORG-438', patientName: 'Fatima Noor',     initials: 'FN',
    age: 52, bloodGroup: 'A+', organType: 'Liver',
    urgency: 'critical', status: 'UNDER_VERIFICATION',
    aiMatch: 91, requestedAt: '5 hrs ago',
    ward: 'Hepatology · Bed 2',
    condition: 'Acute liver failure. MELD score 38.',
    donorName: 'Priya V.',
  },
  {
    id: 'ORG-435', patientName: 'John Mathew',     initials: 'JM',
    age: 61, bloodGroup: 'B+', organType: 'Heart',
    urgency: 'high', status: 'DONOR_FOUND',
    aiMatch: 87, requestedAt: '8 hrs ago',
    ward: 'Cardiology · ICU 1',
    condition: 'Dilated cardiomyopathy. EF 15%.',
    donorName: 'Anonymous',
  },
  {
    id: 'ORG-431', patientName: 'Sara Thomas',     initials: 'ST',
    age: 29, bloodGroup: 'AB+', organType: 'Lung',
    urgency: 'high', status: 'MATCHING',
    aiMatch: 74, requestedAt: '14 hrs ago',
    ward: 'Pulmonology · Bed 8',
    condition: 'Pulmonary fibrosis. O2 sat 82% on max support.',
  },
  {
    id: 'ORG-428', patientName: 'Mohammed Jaleel', initials: 'MJ',
    age: 45, bloodGroup: 'O-', organType: 'Kidney',
    urgency: 'medium', status: 'PENDING',
    aiMatch: 0, requestedAt: '1 day ago',
    ward: 'Nephrology · Bed 11',
    condition: 'Chronic kidney disease stage 5.',
  },
  {
    id: 'ORG-420', patientName: 'Leena George',    initials: 'LG',
    age: 38, bloodGroup: 'A-', organType: 'Liver',
    urgency: 'low', status: 'COMPLETED',
    aiMatch: 95, requestedAt: '3 days ago',
    ward: 'Discharged',
    condition: 'Autoimmune hepatitis.',
    donorName: 'Donor #882', surgeryDate: '3 days ago',
  },
];

// ── Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<OrganStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:            { label: 'Pending',            color: '#6B7A5A', bg: '#F5F2E8', border: '#D0CCBC' },
  MATCHING:           { label: 'AI Matching',        color: '#5B21B6', bg: '#EDE8FF', border: '#C4B5FD' },
  DONOR_FOUND:        { label: 'Donor Found',        color: '#1A5FAA', bg: '#E3F0FF', border: '#93C5FD' },
  UNDER_VERIFICATION: { label: 'Verifying',          color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D' },
  APPROVED:           { label: 'Approved',           color: '#16a34a', bg: '#F0FDF4', border: '#86EFAC' },
  SURGERY_SCHEDULED:  { label: 'Surgery Scheduled',  color: '#0369a1', bg: '#E0F2FE', border: '#7DD3FC' },
  COMPLETED:          { label: 'Completed',          color: '#2B6B0A', bg: '#E8F5E0', border: '#86EFAC' },
  CANCELLED:          { label: 'Cancelled',          color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
};

const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: '#CC0000', bg: '#FFE5E5' },
  high:     { label: 'High',     color: '#B86E00', bg: '#FFF3E0' },
  medium:   { label: 'Medium',   color: '#1A5FAA', bg: '#E3F0FF' },
  low:      { label: 'Low',      color: '#2B6B0A', bg: '#E8F5E0' },
};

const ORGAN_ICONS: Record<string, string> = {
  Kidney: '🫘', Liver: '🫁', Heart: '❤️', Lung: '🫁', Pancreas: '🟤', Cornea: '👁️',
};

const WORKFLOW_STEPS: OrganStatus[] = [
  'PENDING', 'MATCHING', 'DONOR_FOUND', 'UNDER_VERIFICATION', 'APPROVED', 'SURGERY_SCHEDULED', 'COMPLETED',
];

const FILTERS: { key: string; label: string }[] = [
  { key: 'all',               label: 'All'               },
  { key: 'PENDING',           label: 'Pending'           },
  { key: 'MATCHING',          label: 'AI Matching'       },
  { key: 'DONOR_FOUND',       label: 'Donor Found'       },
  { key: 'UNDER_VERIFICATION',label: 'Verifying'         },
  { key: 'SURGERY_SCHEDULED', label: 'Surgery Scheduled' },
  { key: 'COMPLETED',         label: 'Completed'         },
];

// ── Workflow progress bar ──────────────────────────────
function WorkflowProgress({ status }: { status: OrganStatus }) {
  if (status === 'CANCELLED') return null;
  const currentIdx = WORKFLOW_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {WORKFLOW_STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const cfg     = STATUS_CONFIG[step];
        return (
          <div key={step} className="flex items-center gap-1 flex-1 min-w-0">
            <div className={cn(
              'h-1.5 rounded-full flex-1 transition-all',
              done   ? 'bg-[#3d6b1e]' :
              active ? 'bg-[#7AB648]' : 'bg-[#E8E4D8]'
            )} />
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
                done || active ? 'bg-[#3d6b1e]' : 'bg-[#E8E4D8]'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── AI Match ring ──────────────────────────────────────
function MatchRing({ pct }: { pct: number }) {
  if (pct === 0) return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#E8E4D8] flex items-center justify-center">
        <span className="text-[10px] text-[#8A9A7A]">—</span>
      </div>
      <span className="text-[10px] text-[#8A9A7A] mt-1">No match</span>
    </div>
  );
  const color = pct >= 90 ? '#16a34a' : pct >= 75 ? '#2B4A18' : '#B86E00';
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={r} fill="none" stroke="#E8E4D8" strokeWidth="4" />
          <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 24 24)" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <span className="text-[10px] text-[#6B7A5A] mt-1 font-medium">AI Match</span>
    </div>
  );
}

// ── Request card ───────────────────────────────────────
function RequestCard({ req }: { req: OrganRequest }) {
  const [expanded, setExpanded] = useState(false);
  const sc  = STATUS_CONFIG[req.status];
  const uc  = URGENCY_CONFIG[req.urgency];
  const borderColor = req.urgency === 'critical' ? '#CC0000' : req.urgency === 'high' ? '#E8A020' : '#D0CCBC';

  return (
    <div
      className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0',
          req.urgency === 'critical' ? 'bg-red-100 text-red-700' :
          req.urgency === 'high'     ? 'bg-amber-100 text-amber-700' :
          req.urgency === 'medium'   ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        )}>
          {req.initials}
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1a2e0a]">{req.patientName}</span>
            <span className="text-[11px] text-[#8A9A7A]">{req.age}y · {req.bloodGroup}</span>
            <span className="text-[13px]">{ORGAN_ICONS[req.organType] ?? '🫀'}</span>
            <span className="text-[13px] font-medium text-[#4a5940]">{req.organType}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11.5px] text-[#8A9A7A]">{req.id}</span>
            <span className="text-[#D0CCBC]">·</span>
            <span className="text-[11.5px] text-[#8A9A7A]">{req.ward}</span>
            <span className="text-[#D0CCBC]">·</span>
            <span className="text-[11.5px] text-[#8A9A7A]">{req.requestedAt}</span>
          </div>
        </div>

        {/* AI match ring */}
        <MatchRing pct={req.aiMatch} />

        {/* Urgency */}
        <span
          className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: uc.color, background: uc.bg }}
        >
          {uc.label}
        </span>

        {/* Status */}
        <span
          className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
        >
          {sc.label}
        </span>

        {/* Expand toggle */}
        <div className="text-[#8A9A7A] flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#F0EDE3] bg-[#FAFAF7]">
          {/* Workflow progress */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-2">Workflow Progress</p>
            <WorkflowProgress status={req.status} />
            <div className="flex justify-between mt-1">
              {WORKFLOW_STEPS.map((step, i) => {
                const done   = WORKFLOW_STEPS.indexOf(req.status) >= i;
                return (
                  <span key={step} className={cn(
                    'text-[9px] font-medium',
                    done ? 'text-[#3d6b1e]' : 'text-[#C0CCBC]'
                  )}>
                    {STATUS_CONFIG[step].label.split(' ')[0]}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Condition */}
            <div className="bg-white rounded-lg border border-[#E8E4D8] p-3">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">Clinical Notes</p>
              <p className="text-[13px] text-[#3A4A2A]">{req.condition}</p>
            </div>

            {/* Donor + Surgery */}
            <div className="bg-white rounded-lg border border-[#E8E4D8] p-3">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">Donor & Surgery</p>
              {req.donorName ? (
                <p className="text-[13px] text-[#3A4A2A]">
                  Donor: <span className="font-semibold">{req.donorName}</span>
                </p>
              ) : (
                <p className="text-[13px] text-[#8A9A7A]">No donor matched yet</p>
              )}
              {req.surgeryDate && (
                <p className="text-[13px] text-[#3A4A2A] mt-1">
                  Surgery: <span className="font-semibold text-[#0369a1]">{req.surgeryDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-4">
            {req.status === 'PENDING' && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2B4A18] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#3d6b1e] transition-colors">
                <Search size={13} /> Find Donor
              </button>
            )}
            {req.status === 'DONOR_FOUND' && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2B4A18] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#3d6b1e] transition-colors">
                <CheckCircle size={13} /> Begin Verification
              </button>
            )}
            {req.status === 'UNDER_VERIFICATION' && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0369a1] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#0284c7] transition-colors">
                <CheckCircle size={13} /> Approve & Schedule
              </button>
            )}
            {(req.status !== 'COMPLETED' && req.status !== 'CANCELLED') && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#CC0000] text-[#CC0000] text-[12.5px] font-medium rounded-lg hover:bg-red-50 transition-colors">
                <XCircle size={13} /> Cancel Request
              </button>
            )}
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[12.5px] font-medium rounded-lg hover:border-[#7AB648] transition-colors ml-auto">
              <Clock size={13} /> View Full History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────
export default function OrganRequestsPage() {
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === 'all'
      ? REQUESTS.length
      : REQUESTS.filter(r => r.status === f.key).length;
    return acc;
  }, {});

  const visible = REQUESTS.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = search === '' ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.organType.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: 'Total Requests', value: REQUESTS.length,                                       note: 'All time',          color: '' },
    { label: 'Critical',       value: REQUESTS.filter(r => r.urgency === 'critical').length, note: 'Needs action now',  color: 'text-red-600' },
    { label: 'In Matching',    value: REQUESTS.filter(r => r.status === 'MATCHING').length,  note: 'AI finding donors', color: 'text-purple-600' },
    { label: 'Surgeries Today',value: REQUESTS.filter(r => r.status === 'SURGERY_SCHEDULED').length, note: 'Scheduled', color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Organ Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            AI-matched transplant coordination and surgical scheduling.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export Report
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B4A18] text-white text-[13px] font-medium hover:bg-[#3d6b1e] transition-colors">
            <Heart size={14} /> New Case
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <p className="text-[12px] font-medium text-[#6B7A5A] uppercase tracking-wide">{s.label}</p>
            <p className={cn('text-[32px] font-bold leading-none mt-2', s.color || 'text-[#1a2e0a]')}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
          <input
            type="text"
            placeholder="Search patient, organ, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 h-9 w-56 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
          />
        </div>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all',
              filter === f.key
                ? 'bg-[#2B4A18] text-white border-[#2B4A18]'
                : 'bg-white text-[#5A6A4A] border-[#D0CCBC] hover:border-[#7AB648]'
            )}
          >
            {f.label}
            <span className={cn(
              'text-[11px] px-1.5 py-0.5 rounded-full',
              filter === f.key ? 'bg-white/20 text-white' : 'bg-[#F0EDE3] text-[#6B7A5A]'
            )}>
              {counts[f.key] ?? 0}
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
              No organ requests match this filter.
            </div>
          )
        }
      </div>
    </div>
  );
}
