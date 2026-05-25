'use client';
import { useState } from 'react';
import { Users, Search, ChevronDown, ChevronUp, Phone, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────
type RequestType = 'Blood' | 'Organ' | 'Ambulance' | 'General';
type ReqStatus   = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Urgency     = 'critical' | 'high' | 'medium' | 'low';

interface PatientRequest {
  id: string;
  patientName: string;
  initials: string;
  age: number;
  bloodGroup: string;
  ward: string;
  requestType: RequestType;
  urgency: Urgency;
  status: ReqStatus;
  requestedAt: string;
  condition: string;
  phone: string;
  assignedTo?: string;
  notes?: string;
}

// ── Data ──────────────────────────────────────────────
const REQUESTS: PatientRequest[] = [
  {
    id: 'PR-3041', patientName: 'John Doe',        initials: 'JD',
    age: 45, bloodGroup: 'O-', ward: 'ICU · Bed 4',
    requestType: 'Blood', urgency: 'critical', status: 'IN_PROGRESS',
    requestedAt: 'Just now',
    condition: 'Severe trauma from MVA. Requires 4 units O-negative immediately.',
    phone: '+91 98765 43210', assignedTo: 'Dr. Aris (ER)',
  },
  {
    id: 'PR-3039', patientName: 'Leena Thomas',    initials: 'LT',
    age: 38, bloodGroup: 'A+', ward: 'Surgery · OR 2',
    requestType: 'Blood', urgency: 'high', status: 'IN_PROGRESS',
    requestedAt: '12 mins ago',
    condition: 'Post-operative haemorrhage. 2 units A+ required.',
    phone: '+91 87654 32109', assignedTo: 'Dr. Vance (Surgery)',
  },
  {
    id: 'PR-3035', patientName: 'Arjun Pillai',    initials: 'AP',
    age: 61, bloodGroup: 'B+', ward: 'Cardiology · Bed 7',
    requestType: 'Organ', urgency: 'high', status: 'PENDING',
    requestedAt: '34 mins ago',
    condition: 'End-stage heart failure. Awaiting cardiac transplant matching.',
    phone: '+91 76543 21098',
  },
  {
    id: 'PR-3031', patientName: 'Fatima Noor',     initials: 'FN',
    age: 29, bloodGroup: 'AB+', ward: 'Maternity · Rm 3',
    requestType: 'Blood', urgency: 'medium', status: 'PENDING',
    requestedAt: '1 hr ago',
    condition: 'Post-partum haemorrhage. 1 unit AB+ requested.',
    phone: '+91 65432 10987',
  },
  {
    id: 'PR-3028', patientName: 'Ravi Kumar',      initials: 'RK',
    age: 54, bloodGroup: 'O+', ward: 'General · Bed 12',
    requestType: 'Ambulance', urgency: 'medium', status: 'COMPLETED',
    requestedAt: '2 hrs ago',
    condition: 'Transferred from external facility. Stable on arrival.',
    phone: '+91 54321 09876', assignedTo: 'AMB-09',
    notes: 'Patient arrived safely. Handed to Gen. Medicine.',
  },
  {
    id: 'PR-3024', patientName: 'Sarah Jenkins',   initials: 'SJ',
    age: 33, bloodGroup: 'A-', ward: 'Neurology · Bed 5',
    requestType: 'General', urgency: 'low', status: 'COMPLETED',
    requestedAt: '3 hrs ago',
    condition: 'Severe migraine with transient aphasia. Monitoring complete.',
    phone: '+91 43210 98765', assignedTo: 'Dr. Lin (Neuro)',
    notes: 'Discharged to outpatient care.',
  },
];

// ── Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<ReqStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:     { label: '● Pending',     color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D' },
  IN_PROGRESS: { label: '◐ In Progress', color: '#1A5FAA', bg: '#E3F0FF', border: '#93C5FD' },
  COMPLETED:   { label: '✓ Completed',   color: '#2B6B0A', bg: '#E8F5E0', border: '#86EFAC' },
  CANCELLED:   { label: '✕ Cancelled',   color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
};

const URGENCY_CONFIG: Record<Urgency, { color: string; bg: string }> = {
  critical: { color: '#CC0000', bg: '#FFE5E5' },
  high:     { color: '#B86E00', bg: '#FFF3E0' },
  medium:   { color: '#1A5FAA', bg: '#E3F0FF' },
  low:      { color: '#2B6B0A', bg: '#E8F5E0' },
};

const TYPE_CONFIG: Record<RequestType, { color: string; bg: string; icon: string }> = {
  Blood:     { color: '#CC0000', bg: '#FFE5E5', icon: '🩸' },
  Organ:     { color: '#5B21B6', bg: '#EDE8FF', icon: '🫀' },
  Ambulance: { color: '#B86E00', bg: '#FFF3E0', icon: '🚑' },
  General:   { color: '#1A5FAA', bg: '#E3F0FF', icon: '🏥' },
};

const FILTERS = [
  { key: 'all',         label: 'All'         },
  { key: 'PENDING',     label: 'Pending'     },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED',   label: 'Completed'   },
  { key: 'CANCELLED',   label: 'Cancelled'   },
];

const TYPE_FILTERS = [
  { key: 'all',       label: 'All Types'  },
  { key: 'Blood',     label: '🩸 Blood'    },
  { key: 'Organ',     label: '🫀 Organ'    },
  { key: 'Ambulance', label: '🚑 Ambulance'},
  { key: 'General',   label: '🏥 General'  },
];

// ── Request card ───────────────────────────────────────
function RequestCard({ req }: { req: PatientRequest }) {
  const [expanded, setExpanded] = useState(false);
  const sc  = STATUS_CONFIG[req.status];
  const uc  = URGENCY_CONFIG[req.urgency];
  const tc  = TYPE_CONFIG[req.requestType];
  const borderColor = req.urgency === 'critical' ? '#CC0000'
                    : req.urgency === 'high'      ? '#E8A020' : '#D0CCBC';

  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}>

      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
          style={{ background: uc.bg, color: uc.color }}>
          {req.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1a2e0a]">{req.patientName}</span>
            <span className="text-[11px] text-[#8A9A7A]">{req.age}y · {req.bloodGroup}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11.5px] text-[#8A9A7A]">{req.id}</span>
            <span className="text-[#D0CCBC]">·</span>
            <span className="text-[11.5px] text-[#8A9A7A]">{req.ward}</span>
            <span className="text-[#D0CCBC]">·</span>
            <span className="text-[11.5px] text-[#8A9A7A]">{req.requestedAt}</span>
          </div>
        </div>

        {/* Type badge */}
        <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: tc.color, background: tc.bg }}>
          {tc.icon} {req.requestType}
        </span>

        {/* Urgency */}
        <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: uc.color, background: uc.bg }}>
          {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
        </span>

        {/* Status */}
        <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
          {sc.label}
        </span>

        {expanded
          ? <ChevronUp size={16} className="text-[#8A9A7A] flex-shrink-0" />
          : <ChevronDown size={16} className="text-[#8A9A7A] flex-shrink-0" />
        }
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#F0EDE3] bg-[#FAFAF7]">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg border border-[#E8E4D8] p-3">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">
                Clinical Condition
              </p>
              <p className="text-[13px] text-[#3A4A2A] leading-relaxed">{req.condition}</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E8E4D8] p-3 flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide">
                Assignment
              </p>
              {req.assignedTo && (
                <p className="text-[13px] text-[#3A4A2A]">
                  Assigned to: <span className="font-semibold">{req.assignedTo}</span>
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[13px] text-[#3A4A2A]">
                <Phone size={12} className="text-[#6B7A5A]" />
                {req.phone}
              </div>
              {req.notes && (
                <p className="text-[12px] text-[#6B7A5A] italic mt-1">{req.notes}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-4">
            {req.status === 'PENDING' && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2B4A18] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#3d6b1e] transition-colors">
                <AlertTriangle size={13} /> Assign & Process
              </button>
            )}
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[12.5px] font-medium rounded-lg hover:border-[#7AB648] transition-colors ml-auto">
              <FileText size={13} /> Full Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────
export default function PatientRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [search,       setSearch]       = useState('');

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === 'all'
      ? REQUESTS.length
      : REQUESTS.filter(r => r.status === f.key).length;
    return acc;
  }, {});

  const visible = REQUESTS.filter(r => {
    const ms = statusFilter === 'all' || r.status === statusFilter;
    const mt = typeFilter   === 'all' || r.requestType === typeFilter;
    const mq = search === '' ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.ward.toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const stats = [
    { label: 'Total Today',   value: REQUESTS.length,                                        note: 'All requests',      color: '' },
    { label: 'Critical',      value: REQUESTS.filter(r => r.urgency === 'critical').length,  note: 'Immediate action',  color: 'text-red-600'    },
    { label: 'In Progress',   value: REQUESTS.filter(r => r.status === 'IN_PROGRESS').length,note: 'Being handled',     color: 'text-blue-600'   },
    { label: 'Completed',     value: REQUESTS.filter(r => r.status === 'COMPLETED').length,  note: 'Resolved today',    color: 'text-green-700'  },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Patient Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            All incoming patient requests — blood, organ, ambulance and general.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B4A18] text-white text-[13px] font-medium hover:bg-[#3d6b1e] transition-colors">
            <Users size={14} /> New Request
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

      {/* Search + Status filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
          <input
            type="text"
            placeholder="Search patient, ID, ward..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 h-9 w-56 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
          />
        </div>
        {FILTERS.map(f => (
          <button key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all',
              statusFilter === f.key
                ? 'bg-[#2B4A18] text-white border-[#2B4A18]'
                : 'bg-white text-[#5A6A4A] border-[#D0CCBC] hover:border-[#7AB648]'
            )}>
            {f.label}
            <span className={cn('text-[11px] px-1.5 py-0.5 rounded-full',
              statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-[#F0EDE3] text-[#6B7A5A]'
            )}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-2 flex-wrap -mt-2">
        {TYPE_FILTERS.map(f => (
          <button key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all',
              typeFilter === f.key
                ? 'bg-[#F0EDE3] text-[#2B4A18] border-[#2B4A18]'
                : 'bg-white text-[#6B7A5A] border-[#E8E4D8] hover:border-[#7AB648]'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {visible.length > 0
          ? visible.map(r => <RequestCard key={r.id} req={r} />)
          : (
            <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
              No requests match this filter.
            </div>
          )
        }
      </div>
    </div>
  );
}
