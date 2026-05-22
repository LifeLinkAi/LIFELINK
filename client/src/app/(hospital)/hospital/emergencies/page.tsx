'use client';
import { useState } from 'react';
import { AlertTriangle, Clock, MapPin, User, Truck, Activity, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type EmergencyStatus = 'incoming' | 'active' | 'stabilising' | 'resolved';

interface Emergency {
  id: string;
  type: string;
  severity: Severity;
  status: EmergencyStatus;
  patient: string;
  age: number;
  location: string;
  receivedAt: string;
  eta?: string;
  assignedBay?: string;
  assignedTeam?: string;
  ambulance?: string;
  notes: string;
  vitals?: { bp: string; hr: string; spo2: string };
}

const EMERGENCIES: Emergency[] = [
  {
    id:'EMG-301', type:'Trauma — MVA', severity:'critical', status:'incoming',
    patient:'John Doe', age:34, location:'Westheimer Rd, near Metro',
    receivedAt:'Just now', eta:'4 mins', assignedBay:'Bay 3',
    assignedTeam:'Surgical Team 2', ambulance:'Unit 1',
    notes:'High-speed collision. Suspected internal bleeding. Two units O− requested.',
    vitals:{ bp:'90/60', hr:'118', spo2:'94%' },
  },
  {
    id:'EMG-300', type:'Cardiac Arrest', severity:'critical', status:'active',
    patient:'Unknown Male', age:58, location:'ER — Bay 1',
    receivedAt:'18 mins ago', assignedBay:'Bay 1',
    assignedTeam:'Cardio Team 1',
    notes:'CPR in progress. Defibrillated twice. ROSC achieved.',
    vitals:{ bp:'100/70', hr:'88', spo2:'96%' },
  },
  {
    id:'EMG-299', type:'Respiratory Distress', severity:'high', status:'active',
    patient:'Leena Thomas', age:45, location:'ER — Bay 2',
    receivedAt:'35 mins ago', assignedBay:'Bay 2',
    assignedTeam:'Pulmonology',
    notes:'Acute asthma exacerbation. On nebuliser. Improving.',
    vitals:{ bp:'130/85', hr:'102', spo2:'91%' },
  },
  {
    id:'EMG-298', type:'Stroke — Ischaemic', severity:'high', status:'stabilising',
    patient:'Ravi Kumar', age:62, location:'Neuro Ward — Rm 4',
    receivedAt:'1 hr ago', assignedBay:'Neuro',
    assignedTeam:'Neurology',
    notes:'tPA administered. CT confirmed ischaemic. Monitoring.',
    vitals:{ bp:'150/95', hr:'78', spo2:'98%' },
  },
  {
    id:'EMG-297', type:'Appendicitis', severity:'medium', status:'stabilising',
    patient:'Fatima Noor', age:27, location:'Surgery Prep — Rm 6',
    receivedAt:'2 hrs ago', assignedTeam:'General Surgery',
    notes:'Awaiting OR slot. IV antibiotics started.',
  },
  {
    id:'EMG-296', type:'Fracture — Compound', severity:'low', status:'resolved',
    patient:'Arjun Pillai', age:19, location:'Ortho Ward',
    receivedAt:'4 hrs ago', assignedTeam:'Orthopaedics',
    notes:'Surgery completed. Cast applied. Discharged to ward.',
  },
];

const SEVERITY_CONFIG: Record<Severity, { label:string; text:string; bg:string; border:string; left:string }> = {
  critical: { label:'Critical', text:'text-red-700',   bg:'bg-red-50',   border:'border-red-200',   left:'#CC0000' },
  high:     { label:'High',     text:'text-amber-700', bg:'bg-amber-50', border:'border-amber-200', left:'#D97706' },
  medium:   { label:'Medium',   text:'text-blue-700',  bg:'bg-blue-50',  border:'border-blue-200',  left:'#1D4ED8' },
  low:      { label:'Low',      text:'text-green-700', bg:'bg-green-50', border:'border-green-200', left:'#16a34a' },
};

const STATUS_CONFIG: Record<EmergencyStatus, { label:string; text:string; bg:string; border:string }> = {
  incoming:    { label:'● Incoming',    text:'text-red-700',    bg:'bg-red-50',    border:'border-red-200'    },
  active:      { label:'◉ Active',      text:'text-amber-700',  bg:'bg-amber-50',  border:'border-amber-200'  },
  stabilising: { label:'↗ Stabilising', text:'text-blue-700',   bg:'bg-blue-50',   border:'border-blue-200'   },
  resolved:    { label:'✓ Resolved',    text:'text-green-700',  bg:'bg-green-50',  border:'border-green-200'  },
};

const FILTER_TABS: { key: EmergencyStatus | 'all'; label: string }[] = [
  { key:'all',         label:'All'         },
  { key:'incoming',    label:'Incoming'    },
  { key:'active',      label:'Active'      },
  { key:'stabilising', label:'Stabilising' },
  { key:'resolved',    label:'Resolved'    },
];

export default function EmergenciesPage() {
  const [filter, setFilter]       = useState<EmergencyStatus | 'all'>('all');
  const [expandedId, setExpanded] = useState<string | null>(null);

  const visible = filter === 'all' ? EMERGENCIES : EMERGENCIES.filter(e => e.status === filter);

  const counts = FILTER_TABS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? EMERGENCIES.length : EMERGENCIES.filter(e => e.status === f.key).length;
    return acc;
  }, {} as Record<string, number>);

  const critical = EMERGENCIES.filter(e => e.severity === 'critical').length;
  const active   = EMERGENCIES.filter(e => ['incoming','active'].includes(e.status)).length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Emergency Cases</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Live ER activity — incoming, active, and resolving cases.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5">
            <AlertTriangle size={14} /> Code Red Alert
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Cases',   value: EMERGENCIES.length, note:'Today',              color:'text-[#1a2e0a]' },
          { label:'Critical',      value: critical,           note:'Needs immediate care',color:'text-red-600'  },
          { label:'Active Now',    value: active,             note:'In ER right now',     color:'text-amber-600'},
          { label:'Resolved',      value: counts.resolved,    note:'Discharged today',    color:'text-green-600'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#6B7A5A]">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTER_TABS.map(f => (
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

      {/* Emergency cards */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <div className="text-center py-12 text-[#8A9A7A] text-[14px]">No cases in this category.</div>
        )}
        {visible.map(emg => {
          const sc = SEVERITY_CONFIG[emg.severity];
          const stc = STATUS_CONFIG[emg.status];
          const isExpanded = expandedId === emg.id;

          return (
            <div
              key={emg.id}
              className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden"
              style={{ borderLeft: `3px solid ${sc.left}` }}
            >
              {/* Main row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#fafaf7] transition-colors"
                onClick={() => setExpanded(isExpanded ? null : emg.id)}
              >
                {/* Severity icon */}
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', sc.bg, sc.border, 'border')}>
                  <AlertTriangle size={16} className={sc.text} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-[#1a2e0a]">{emg.type}</span>
                    <span className="text-[11.5px] text-[#8A9A7A]">{emg.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[12px] text-[#4a5940]">
                      <User size={10} className="text-[#8A9A7A]" /> {emg.patient}, {emg.age}y
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#4a5940]">
                      <MapPin size={10} className="text-[#8A9A7A]" /> {emg.location}
                    </span>
                    {emg.eta && (
                      <span className="flex items-center gap-1 text-[12px] text-red-600 font-medium">
                        <Clock size={10} /> ETA {emg.eta}
                      </span>
                    )}
                  </div>
                </div>

                {/* Severity badge */}
                <span className={cn('text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0', sc.text, sc.bg, sc.border)}>
                  {sc.label}
                </span>

                {/* Status pill */}
                <span className={cn('text-[11.5px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0', stc.text, stc.bg, stc.border)}>
                  {stc.label}
                </span>

                {/* Time */}
                <span className="text-[11.5px] text-[#8A9A7A] flex-shrink-0 w-20 text-right">{emg.receivedAt}</span>

                {/* Expand icon */}
                <div className="text-[#8A9A7A] flex-shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-[#f0ede3] px-5 py-4 bg-[#fafaf7] flex flex-col gap-3">

                  {/* Vitals */}
                  {emg.vitals && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[#4a5940]">
                        <Activity size={13} className="text-[#8A9A7A]" />
                        <span className="text-[11.5px] font-semibold text-[#6B7A5A] uppercase tracking-wide">Vitals</span>
                      </div>
                      {[
                        { label:'BP', value: emg.vitals.bp },
                        { label:'HR', value: emg.vitals.hr + ' bpm' },
                        { label:'SpO₂', value: emg.vitals.spo2 },
                      ].map(v => (
                        <div key={v.label} className="bg-white border border-[#E8E4D8] rounded-lg px-3 py-1.5 text-center">
                          <p className="text-[10px] text-[#8A9A7A] font-medium uppercase">{v.label}</p>
                          <p className="text-[13px] font-bold text-[#1a2e0a]">{v.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  <p className="text-[12.5px] text-[#4a5940] leading-relaxed">{emg.notes}</p>

                  {/* Assignment info */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {emg.assignedBay && (
                      <span className="flex items-center gap-1.5 text-[12px] text-[#4a5940] bg-white border border-[#E8E4D8] px-2.5 py-1 rounded-lg">
                        <MapPin size={11} /> {emg.assignedBay}
                      </span>
                    )}
                    {emg.assignedTeam && (
                      <span className="flex items-center gap-1.5 text-[12px] text-[#4a5940] bg-white border border-[#E8E4D8] px-2.5 py-1 rounded-lg">
                        <User size={11} /> {emg.assignedTeam}
                      </span>
                    )}
                    {emg.ambulance && (
                      <span className="flex items-center gap-1.5 text-[12px] text-[#4a5940] bg-white border border-[#E8E4D8] px-2.5 py-1 rounded-lg">
                        <Truck size={11} /> {emg.ambulance}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button className="px-3 py-1.5 rounded-lg bg-[#1a2e0a] text-white text-[12px] font-medium hover:bg-[#2B4A18] transition-colors">
                      Update Status
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-[#E8E4D8] text-[12px] font-medium text-[#4a5940] hover:border-[#7AB648] transition-colors flex items-center gap-1.5">
                      <Phone size={11} /> Contact Team
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-[#E8E4D8] text-[12px] font-medium text-[#4a5940] hover:border-[#7AB648] transition-colors">
                      View Full Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
