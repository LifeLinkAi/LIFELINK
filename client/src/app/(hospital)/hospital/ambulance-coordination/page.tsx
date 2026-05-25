'use client';
import { useState } from 'react';
import { Truck, MapPin, Clock, Phone, AlertTriangle, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type UnitStatus = 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning' | 'maintenance';

interface AmbulanceUnit {
  id: string;
  callSign: string;
  driver: string;
  phone: string;
  status: UnitStatus;
  location: string;
  patient?: string;
  destination?: string;
  eta?: string;
  dispatchedAt?: string;
  crewCount: number;
}

interface DispatchCall {
  id: string;
  caller: string;
  address: string;
  type: string;
  priority: 'P1' | 'P2' | 'P3';
  receivedAt: string;
  assignedUnit?: string;
  status: 'pending' | 'assigned' | 'active' | 'completed';
}

const UNITS: AmbulanceUnit[] = [
  { id:'AMB-01', callSign:'Unit 1', driver:'Suresh Nair',    phone:'+91 98400 11001', status:'en_route',    location:'Westheimer Rd',         patient:'John Doe',    destination:'City Hospital ER', eta:'4 mins',  dispatchedAt:'12 mins ago', crewCount:2 },
  { id:'AMB-02', callSign:'Unit 2', driver:'Priya Menon',    phone:'+91 98400 11002', status:'available',   location:'Station — Bay 2',       crewCount:3 },
  { id:'AMB-03', callSign:'Unit 3', driver:'Rajan Thomas',   phone:'+91 98400 11003', status:'on_scene',    location:'42 Jubilee Hills',      patient:'Unknown F',   destination:'City Hospital ER', dispatchedAt:'28 mins ago', crewCount:2 },
  { id:'AMB-04', callSign:'Unit 4', driver:'Anita Sharma',   phone:'+91 98400 11004', status:'dispatched',  location:'Ring Road Junction',    patient:'Leena Thomas',destination:'OR-2 Drop',        eta:'9 mins',  dispatchedAt:'6 mins ago',  crewCount:2 },
  { id:'AMB-05', callSign:'Unit 5', driver:'Deepak Pillai',  phone:'+91 98400 11005', status:'returning',   location:'NH-44 Bypass',          crewCount:2 },
  { id:'AMB-06', callSign:'Unit 6', driver:'Meena Krishnan', phone:'+91 98400 11006', status:'available',   location:'Station — Bay 1',       crewCount:3 },
  { id:'AMB-07', callSign:'Unit 7', driver:'Arun Varma',     phone:'+91 98400 11007', status:'maintenance', location:'Workshop — Bay 3',      crewCount:0 },
];

const CALLS: DispatchCall[] = [
  { id:'CAL-991', caller:'Public — 108',   address:'1042 Westheimer Rd, near Metro Station', type:'Cardiac Arrest',   priority:'P1', receivedAt:'Just now',   status:'assigned', assignedUnit:'Unit 4' },
  { id:'CAL-990', caller:'Dr Meera (ICU)', address:'City Hospital — Transfer to OR-2',       type:'Inter-facility',   priority:'P2', receivedAt:'8 mins ago', status:'active',   assignedUnit:'Unit 1' },
  { id:'CAL-989', caller:'Public — 108',   address:'42 Jubilee Hills, Flat 4B',              type:'Trauma — RTA',     priority:'P1', receivedAt:'30 mins ago',status:'active',   assignedUnit:'Unit 3' },
  { id:'CAL-988', caller:'Public — 108',   address:'MG Road, near KFC',                      type:'Respiratory Distress', priority:'P2', receivedAt:'1 hr ago', status:'pending', },
];

const UNIT_STATUS_CONFIG: Record<UnitStatus, { label:string; dot:string; text:string; bg:string; border:string }> = {
  available:   { label:'Available',   dot:'bg-green-500',  text:'text-green-700',  bg:'bg-green-50',  border:'border-green-200'  },
  dispatched:  { label:'Dispatched',  dot:'bg-blue-500',   text:'text-blue-700',   bg:'bg-blue-50',   border:'border-blue-200'   },
  en_route:    { label:'En Route',    dot:'bg-red-500',    text:'text-red-700',    bg:'bg-red-50',    border:'border-red-200'    },
  on_scene:    { label:'On Scene',    dot:'bg-amber-500',  text:'text-amber-700',  bg:'bg-amber-50',  border:'border-amber-200'  },
  returning:   { label:'Returning',   dot:'bg-purple-500', text:'text-purple-700', bg:'bg-purple-50', border:'border-purple-200' },
  maintenance: { label:'Maintenance', dot:'bg-gray-400',   text:'text-gray-600',   bg:'bg-gray-100',  border:'border-gray-200'   },
};

const PRIORITY_CONFIG = {
  P1: { text:'text-red-700',   bg:'bg-red-50',   border:'border-red-200',   label:'P1 — Critical' },
  P2: { text:'text-amber-700', bg:'bg-amber-50', border:'border-amber-200', label:'P2 — Urgent'   },
  P3: { text:'text-green-700', bg:'bg-green-50', border:'border-green-200', label:'P3 — Routine'  },
};

export default function AmbulanceCoordinationPage() {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const available   = UNITS.filter(u => u.status === 'available').length;
  const deployed    = UNITS.filter(u => !['available','maintenance'].includes(u.status)).length;
  const pendingCalls= CALLS.filter(c => c.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Ambulance Coordination</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Fleet status, dispatch calls, and live unit tracking.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            <Phone size={13} /> Call All Units
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5">
            <AlertTriangle size={14} /> Emergency Dispatch
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Fleet',      value: UNITS.length,  note:'Ambulance units',    color:'text-[#1a2e0a]'  },
          { label:'Available',        value: available,     note:'Ready to dispatch',  color:'text-green-600'  },
          { label:'Deployed',         value: deployed,      note:'Active missions',    color:'text-blue-600'   },
          { label:'Pending Calls',    value: pendingCalls,  note:'Awaiting dispatch',  color:'text-red-600'    },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#6B7A5A]">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Main grid: map + units */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        {/* Live map */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#f3f9ea] text-[#2B6B0A] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#c0dd97]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d6b1e] animate-pulse" />
                LIVE
              </div>
              <span className="text-[14px] font-semibold text-[#1a2e0a]">Fleet Map</span>
            </div>
            <span className="text-[12px] text-[#8A9A7A]">{UNITS.length} units total</span>
          </div>

          <div className="h-[280px] bg-[#2B4A18] relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[20,40,60,80].map(v => (
                <g key={v}>
                  <line x1="0" y1={v} x2="100" y2={v} stroke="#3d5020" strokeWidth="0.3" />
                  <line x1={v} y1="0" x2={v} y2="100" stroke="#3d5020" strokeWidth="0.3" />
                </g>
              ))}
              <path d="M0,50 Q25,45 50,50 T100,47" stroke="#4a6028" strokeWidth="3" fill="none" />
              <path d="M48,0 Q50,30 49,100" stroke="#4a6028" strokeWidth="2.5" fill="none" />
              <path d="M0,25 L100,30" stroke="#3d5020" strokeWidth="1.5" fill="none" />
              <circle cx="50" cy="50" r="5" fill="#1a2e0a" stroke="#7AB648" strokeWidth="1" />
              <text x="50" y="52.5" textAnchor="middle" fontSize="5" fill="#7AB648" fontWeight="bold">+</text>
            </svg>
            {[
              { id:'AMB-01', x:28, y:38, status:'en_route'   },
              { id:'AMB-03', x:65, y:62, status:'on_scene'   },
              { id:'AMB-04', x:42, y:72, status:'dispatched' },
              { id:'AMB-05', x:72, y:35, status:'returning'  },
            ].map(u => {
              const color = u.status === 'en_route' ? '#CC0000'
                          : u.status === 'on_scene' ? '#D97706'
                          : u.status === 'dispatched' ? '#1D4ED8' : '#7AB648';
              return (
                <div
                  key={u.id}
                  className="absolute flex items-center gap-1"
                  style={{ left:`${u.x}%`, top:`${u.y}%`, transform:'translate(-50%,-50%)' }}
                >
                  <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ background:color }} />
                  <span className="text-white text-[9px] font-semibold bg-black/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {u.id}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 px-5 py-3 border-t border-[#E8E4D8] flex-wrap">
            {[
              { color:'#CC0000', label:'En Route'  },
              { color:'#D97706', label:'On Scene'  },
              { color:'#1D4ED8', label:'Dispatched'},
              { color:'#7AB648', label:'Returning' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11.5px] text-[#6B7A5A]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background:l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#E8E4D8]">
            <span className="text-[14px] font-semibold text-[#1a2e0a]">Unit Status</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0ede3]">
            {UNITS.map(unit => {
              const cfg = UNIT_STATUS_CONFIG[unit.status];
              const isSelected = selectedUnit === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(isSelected ? null : unit.id)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors',
                    isSelected ? 'bg-[#f3f9ea]' : 'hover:bg-[#fafaf7]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a2e0a]">{unit.callSign}</p>
                        <p className="text-[11px] text-[#8A9A7A]">{unit.driver}</p>
                      </div>
                    </div>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', cfg.text, cfg.bg, cfg.border)}>
                      {cfg.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-3 space-y-1.5 pl-4 border-l-2 border-[#f0ede3]">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#4a5940]">
                        <MapPin size={11} className="text-[#8A9A7A]" /> {unit.location}
                      </div>
                      {unit.patient && (
                        <div className="text-[12px] text-[#4a5940]">👤 Patient: {unit.patient}</div>
                      )}
                      {unit.eta && (
                        <div className="flex items-center gap-1.5 text-[12px] text-[#4a5940]">
                          <Clock size={11} className="text-[#8A9A7A]" /> ETA: {unit.eta}
                        </div>
                      )}
                      {unit.dispatchedAt && (
                        <div className="text-[12px] text-[#8A9A7A]">Dispatched {unit.dispatchedAt}</div>
                      )}
                      <div className="flex items-center gap-1.5 text-[12px] text-[#4a5940]">
                        <Phone size={11} className="text-[#8A9A7A]" /> {unit.phone}
                      </div>
                      {unit.status === 'available' && (
                        <button className="mt-1 px-3 py-1.5 rounded-lg bg-[#1a2e0a] text-white text-[11.5px] font-medium hover:bg-[#2B4A18] transition-colors flex items-center gap-1.5">
                          <Plus size={11} /> Dispatch Unit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
          <span className="text-[14px] font-semibold text-[#1a2e0a]">Dispatch Calls</span>
          <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#3d6b1e] hover:underline">
            <Plus size={13} /> New Call
          </button>
        </div>
        <div className="divide-y divide-[#f0ede3]">
          {CALLS.map(call => {
            const pc = PRIORITY_CONFIG[call.priority];
            return (
              <div key={call.id} className="flex items-start gap-4 px-5 py-4">
                <span className={cn('text-[11px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 mt-0.5', pc.text, pc.bg, pc.border)}>
                  {call.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-semibold text-[#1a2e0a]">{call.type}</span>
                    <span className="text-[11.5px] text-[#8A9A7A]">{call.id} · {call.caller}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#4a5940]">
                    <MapPin size={11} className="text-[#8A9A7A]" /> {call.address}
                  </div>
                  {call.assignedUnit && (
                    <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#3d6b1e] font-medium">
                      <Truck size={11} /> Assigned: {call.assignedUnit}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[11.5px] text-[#8A9A7A]">{call.receivedAt}</span>
                  {call.status === 'pending' ? (
                    <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11.5px] font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5">
                      <Truck size={11} /> Dispatch Now
                    </button>
                  ) : call.status === 'active' ? (
                    <span className="flex items-center gap-1 text-[11.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      <Loader2 size={11} className="animate-spin" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11.5px] font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={11} /> Assigned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
