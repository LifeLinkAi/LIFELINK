'use client';
import { useState } from 'react';
import { Droplets, Search, AlertCircle, Clock, CheckCircle2, Loader2, UserSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

type Urgency = 'critical' | 'high' | 'medium' | 'low';
type Status  = 'pending' | 'matching' | 'donor_found' | 'in_transit' | 'fulfilled';

interface BloodRequest {
  id: string;
  patientName: string;
  initials: string;
  bloodType: string;
  urgency: Urgency;
  status: Status;
  ward: string;
  requestedAt: string;
  condition: string;
  unitsNeeded: number;
}

const REQUESTS: BloodRequest[] = [
  { id:'BRQ-881', patientName:'John Doe',      initials:'JD', bloodType:'O−', urgency:'critical', status:'pending',     ward:'ICU · Bed 4',       requestedAt:'Just now',   condition:'Severe trauma, MVA',        unitsNeeded:4 },
  { id:'BRQ-879', patientName:'Leena Thomas',  initials:'LT', bloodType:'A+', urgency:'high',     status:'matching',    ward:'Surgery · OR 2',    requestedAt:'8 mins ago', condition:'Post-op haemorrhage',       unitsNeeded:2 },
  { id:'BRQ-876', patientName:'Arjun Pillai',  initials:'AP', bloodType:'B−', urgency:'high',     status:'donor_found', ward:'ER · Bay 3',        requestedAt:'22 mins ago',condition:'GI bleed, stable',          unitsNeeded:2 },
  { id:'BRQ-872', patientName:'Fatima Noor',   initials:'FN', bloodType:'AB+',urgency:'medium',   status:'in_transit',  ward:'Maternity · Rm 8',  requestedAt:'1 hr ago',   condition:'Post-partum haemorrhage',   unitsNeeded:1 },
  { id:'BRQ-868', patientName:'Ravi Kumar',    initials:'RK', bloodType:'O+', urgency:'low',      status:'fulfilled',   ward:'General · Bed 12',  requestedAt:'3 hrs ago',  condition:'Elective surgery prep',     unitsNeeded:2 },
];

const URGENCY_STYLE: Record<Urgency, { label:string; text:string; bg:string; border:string; left:string }> = {
  critical: { label:'Critical', text:'text-red-700',   bg:'bg-red-50',   border:'border-red-200',   left:'#CC0000' },
  high:     { label:'High',     text:'text-amber-700', bg:'bg-amber-50', border:'border-amber-200', left:'#D97706' },
  medium:   { label:'Medium',   text:'text-blue-700',  bg:'bg-blue-50',  border:'border-blue-200',  left:'#1D4ED8' },
  low:      { label:'Low',      text:'text-green-700', bg:'bg-green-50', border:'border-green-200', left:'#16a34a' },
};

const STATUS_META: Record<Status, { label:string; icon: React.ReactNode; pill:string }> = {
  pending:     { label:'Pending',     icon:<Clock size={11} />,        pill:'bg-gray-100   text-gray-600   border-gray-200'   },
  matching:    { label:'Matching…',   icon:<Loader2 size={11} className="animate-spin" />, pill:'bg-amber-50  text-amber-700  border-amber-200'  },
  donor_found: { label:'Donor Found', icon:<CheckCircle2 size={11} />, pill:'bg-blue-50   text-blue-700   border-blue-200'   },
  in_transit:  { label:'In Transit',  icon:<Loader2 size={11} className="animate-spin" />, pill:'bg-purple-50 text-purple-700 border-purple-200' },
  fulfilled:   { label:'Fulfilled',   icon:<CheckCircle2 size={11} />, pill:'bg-green-50  text-green-700  border-green-200'  },
};

const AVATAR_COLORS: Record<string, string> = {
  JD:'bg-red-500', LT:'bg-amber-500', AP:'bg-amber-400',
  FN:'bg-blue-500', RK:'bg-green-600',
};

const FILTERS: { key: Status | 'all'; label: string }[] = [
  { key:'all',         label:'All'         },
  { key:'pending',     label:'Pending'     },
  { key:'matching',    label:'Matching'    },
  { key:'donor_found', label:'Donor Found' },
  { key:'in_transit',  label:'In Transit'  },
  { key:'fulfilled',   label:'Fulfilled'   },
];

export default function BloodRequestsPage() {
  const [filter, setFilter]       = useState<Status | 'all'>('all');
  const [search, setSearch]       = useState('');
  const [expandedId, setExpanded] = useState<string | null>(null);

  const visible = REQUESTS.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase())
                     || r.bloodType.toLowerCase().includes(search.toLowerCase())
                     || r.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? REQUESTS.length : REQUESTS.filter(r => r.status === f.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Blood Requests</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Incoming patient blood needs — match donors and track fulfilment.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5">
            <AlertCircle size={14} /> SOS Broadcast
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Today',  value: REQUESTS.length,                             note:'Blood requests',    color:'' },
          { label:'Critical',     value: REQUESTS.filter(r=>r.urgency==='critical').length, note:'Needs donor now',  color:'text-red-600' },
          { label:'In Matching',  value: counts.matching,                             note:'AI finding donors', color:'text-amber-600' },
          { label:'Fulfilled',    value: counts.fulfilled,                            note:'Completed today',   color:'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#6B7A5A]">{s.label}</p>
            <p className={cn('text-[30px] font-bold text-[#1a2e0a] leading-none', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, type, ID…"
            className="pl-8 pr-4 h-8 w-56 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-colors',
                filter === f.key
                  ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]'
                  : 'bg-white text-[#4a5940] border-[#E8E4D8] hover:border-[#7AB648]'
              )}
            >
              {f.label}
              <span className={cn(
                'text-[11px] px-1.5 py-0.5 rounded-full font-semibold',
                filter === f.key ? 'bg-white/20 text-white' : 'bg-[#f0ede3] text-[#6B7A5A]'
              )}>
                {counts[f.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <div className="text-center py-12 text-[#8A9A7A] text-[14px]">No requests match this filter.</div>
        )}
        {visible.map(req => {
          const urg = URGENCY_STYLE[req.urgency];
          const st  = STATUS_META[req.status];
          const isExpanded = expandedId === req.id;

          return (
            <div
              key={req.id}
              onClick={() => setExpanded(isExpanded ? null : req.id)}
              className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex items-center gap-4 cursor-pointer hover:border-[#7AB648] transition-colors"
              style={{ borderLeft: `3px solid ${urg.left}` }}
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0', AVATAR_COLORS[req.initials] ?? 'bg-gray-400')}>
                {req.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold text-[#1a2e0a]">{req.patientName}</span>
                  <span className="text-[12px] font-bold text-[#1a2e0a] bg-[#f0ede3] px-2 py-0.5 rounded">{req.bloodType}</span>
                  <span className="text-[11.5px] text-[#8A9A7A]">{req.id} · {req.ward} · {req.unitsNeeded} unit{req.unitsNeeded > 1 ? 's' : ''}</span>
                </div>
                {isExpanded && (
                  <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#4a5940]">
                    <span className="bg-[#f0ede3] px-2 py-0.5 rounded">📋 {req.condition}</span>
                  </div>
                )}
              </div>

              <span className={cn('text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0', urg.text, urg.bg, urg.border)}>
                {urg.label}
              </span>

              <span className={cn('flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0', st.pill)}>
                {st.icon} {st.label}
              </span>

              <span className="text-[11.5px] text-[#8A9A7A] flex-shrink-0 w-20 text-right">{req.requestedAt}</span>

              <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                {req.status === 'fulfilled' ? (
                  <button className="px-3 py-1.5 text-[12px] font-medium border border-[#E8E4D8] rounded-lg text-[#4a5940] hover:border-[#7AB648] transition-colors">
                    View Record
                  </button>
                ) : req.status === 'pending' || req.status === 'matching' ? (
                  <button className="px-3 py-1.5 text-[12px] font-medium bg-[#1a2e0a] text-white rounded-lg hover:bg-[#2B4A18] transition-colors flex items-center gap-1.5">
                    <UserSearch size={12} /> Find Donor
                  </button>
                ) : (
                  <button className="px-3 py-1.5 text-[12px] font-medium border border-[#E8E4D8] rounded-lg text-[#3d6b1e] hover:border-[#7AB648] transition-colors">
                    Track →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
