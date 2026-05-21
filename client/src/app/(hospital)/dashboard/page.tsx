'use client';
import { useState } from 'react';
import { 
  AlertTriangle, Droplets, Users, Truck,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  subtitle: string;
  value: string;
  suffix?: string;
  tag: string;
  tagVariant: 'critical' | 'warn' | 'ok';
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

interface ActivityItem {
  time: string;
  title: string;
  desc: string;
  urgent: boolean;
}

interface BloodLevel {
  type: string;
  units: number;
  max: number;
  status: 'critical' | 'low' | 'adequate' | 'optimal';
}

// ── Data ─────────────────────────────────────────────────
const BLOOD_LEVELS: BloodLevel[] = [
  { type: 'O Negative', units: 12,  max: 80, status: 'critical' },
  { type: 'A Positive', units: 84,  max: 120, status: 'adequate' },
  { type: 'B Negative', units: 45,  max: 80, status: 'optimal'  },
  { type: 'AB Positive', units: 22, max: 80, status: 'low'      },
];

const ACTIVITY: ActivityItem[] = [
  { time: 'JUST NOW',    title: 'Trauma Code Alpha',          desc: 'Inbound ETA 4 mins. Bay 3 prepped. Surgical Team 2 notified.', urgent: true  },
  { time: '12 MINS AGO', title: 'Ambulance Unit 4 Dispatched', desc: 'Responding to cardiac arrest — 1042 Westheimer Rd.',          urgent: false },
  { time: '28 MINS AGO', title: 'Blood Request Fulfilled',     desc: 'O-Negative units transferred to OR-2 for ongoing surgery.',   urgent: false },
  { time: '1 HR AGO',    title: 'ICU Bed Alert',               desc: 'Capacity reached 90%. Elective admissions deferred.',         urgent: false },
];

const FLEET_UNITS = [
  { id: 'AMB-3',  label: 'Unit 3 (En Route)',  x: 30, y: 35, status: 'active'   },
  { id: 'AMB-7',  label: 'Unit 7 (Returning)', x: 72, y: 60, status: 'returning'},
  { id: 'AMB-1',  label: 'Unit 1 (Dispatched)',x: 60, y: 78, status: 'returning'},
];

const STATUS_COLORS = {
  critical: { bar: '#CC0000', text: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200'   },
  low:      { bar: '#D97706', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  adequate: { bar: '#3d6b1e', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  optimal:  { bar: '#16a34a', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
};

// ── Sub-components ────────────────────────────────────────
function StatCard({ title, subtitle, value, suffix, tag, tagVariant, icon, trend, trendUp }: StatCardProps) {
  const tagColors = {
    critical: 'text-red-700   bg-red-50   border border-red-200',
    warn:     'text-amber-700 bg-amber-50 border border-amber-200',
    ok:       'text-green-700 bg-green-50 border border-green-200',
  };
  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-[#6B7A5A] uppercase tracking-wide">{title}</p>
          <p className="text-[11.5px] text-[#8A9A7A] mt-0.5">{subtitle}</p>
        </div>
        <div className="w-9 h-9 bg-[#f3f9ea] rounded-lg flex items-center justify-center text-[#3d6b1e]">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-bold text-[#1a2e0a] leading-none">{value}</span>
        {suffix && <span className="text-[15px] text-[#8A9A7A]">{suffix}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', tagColors[tagVariant])}>
          {tag}
        </span>
        {trend && (
          <span className={cn('flex items-center gap-1 text-[12px] font-medium', trendUp ? 'text-green-600' : 'text-red-600')}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function BloodLevelBar({ item }: { item: BloodLevel }) {
  const pct = Math.round((item.units / item.max) * 100);
  const c   = STATUS_COLORS[item.status];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12.5px] font-medium text-[#4a5940]">{item.type}</span>
        <span className={cn('text-[11.5px] font-semibold', c.text)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)} ({item.units} units)
        </span>
      </div>
      <div className="h-1.5 bg-[#F0EDE3] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: c.bar }}
        />
      </div>
    </div>
  );
}

// ── Map dot ───────────────────────────────────────────────
function MapDot({ unit }: { unit: typeof FLEET_UNITS[number] }) {
  const color = unit.status === 'active' ? '#CC0000' : '#3d6b1e';
  return (
    <g>
      <circle cx={`${unit.x}%`} cy={`${unit.y}%`} r="8" fill={color} fillOpacity="0.2" />
      <circle cx={`${unit.x}%`} cy={`${unit.y}%`} r="5" fill={color} />
      <rect
        x={`calc(${unit.x}% + 10px)`} y={`calc(${unit.y}% - 10px)`}
        width={unit.label.length * 6.5 + 8} height="18" rx="4"
        fill="white" fillOpacity="0.92"
      />
      <text
        x={`calc(${unit.x}% + 14px)`} y={`calc(${unit.y}% + 2px)`}
        fontSize="9" fill="#1a2e0a" fontWeight="600" fontFamily="inherit"
      >
        {unit.label}
      </text>
    </g>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function HospitalDashboard() {
  const [, setRefresh] = useState(0);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Overview</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Live hospital operations and resource monitoring.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setRefresh(n => n + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors"
          >
            <Activity size={14} /> Refresh
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#2B4A18] text-white text-[13px] font-medium hover:bg-[#3d6b1e] transition-colors">
            + New Request
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="ICU Capacity" subtitle="Critical beds"
          value="92" suffix="%" tag="NEAR CAPACITY" tagVariant="warn"
          icon={<AlertTriangle size={18} />} trend="+2%" trendUp={false}
        />
        <StatCard
          title="ER Wait Time" subtitle="Average today"
          value="45" suffix="min" tag="LEVEL 1 — ELEVATED" tagVariant="critical"
          icon={<Activity size={18} />}
        />
        <StatCard
          title="On-Call Staff" subtitle="Active shift"
          value="142" suffix="total" tag="✓ Optimal coverage" tagVariant="ok"
          icon={<Users size={18} />} trend="+8" trendUp={true}
        />
        <StatCard
          title="Active Fleet" subtitle="Ambulances deployed"
          value="7" suffix="units" tag="3 en route" tagVariant="warn"
          icon={<Truck size={18} />}
        />
      </div>

      {/* Blood bank card — full width */}
      <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#4a5940]">
            <Droplets size={16} />
            <span className="text-[14px] font-semibold text-[#1a2e0a]">Blood Bank Levels</span>
          </div>
          <a href="/blood-stock" className="text-[12px] font-medium text-[#3d6b1e] hover:underline">
            Manage stock →
          </a>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {BLOOD_LEVELS.map(b => <BloodLevelBar key={b.type} item={b} />)}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-[1fr_1.6fr] gap-4">

        {/* Live Activity */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-[#6B7A5A]" />
            <span className="text-[14px] font-semibold text-[#1a2e0a]">Live Activity</span>
          </div>
          <div className="flex flex-col">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0 w-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0', item.urgent ? 'bg-red-500' : 'bg-[#3d6b1e]')} />
                  {i < ACTIVITY.length - 1 && <div className="w-px flex-1 bg-[#E8E4D8] my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-[10.5px] font-semibold text-[#8A9A7A] tracking-wide mb-0.5">{item.time}</p>
                  <p className="text-[13px] font-semibold text-[#1a2e0a]">{item.title}</p>
                  <p className="text-[12px] text-[#6B7A5A] leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet map */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#f3f9ea] text-[#2B6B0A] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#c0dd97]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3d6b1e] animate-pulse" />
                LIVE
              </div>
              <span className="text-[14px] font-semibold text-[#1a2e0a]">Active Fleet</span>
            </div>
            <span className="text-[12px] text-[#8A9A7A]">7 units deployed</span>
          </div>

          {/* SVG map */}
          <div className="h-[200px] bg-[#2B4A18] relative overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid */}
              {[20,40,60,80].map(v => (
                <g key={v}>
                  <line x1="0" y1={v} x2="100" y2={v} stroke="#3d5020" strokeWidth="0.3" />
                  <line x1={v} y1="0" x2={v} y2="100" stroke="#3d5020" strokeWidth="0.3" />
                </g>
              ))}
              {/* Roads */}
              <path d="M0,50 Q25,45 50,50 T100,47" stroke="#4a6028" strokeWidth="3" fill="none" />
              <path d="M48,0 Q50,30 49,100" stroke="#4a6028" strokeWidth="2.5" fill="none" />
              <path d="M0,25 L100,30" stroke="#3d5020" strokeWidth="1.5" fill="none" />
              <path d="M0,75 L100,70" stroke="#3d5020" strokeWidth="1.5" fill="none" />
              {/* Hospital marker */}
              <circle cx="50" cy="50" r="5" fill="#1a2e0a" stroke="#7AB648" strokeWidth="1" />
              <text x="50" y="52.5" textAnchor="middle" fontSize="5" fill="#7AB648" fontWeight="bold">+</text>
            </svg>
            {/* Overlay dots using absolute positioning */}
            {FLEET_UNITS.map(u => {
              const dotColor = u.status === 'active' ? '#CC0000' : '#3d6b1e';
              return (
                <div
                  key={u.id}
                  className="absolute flex items-center gap-1.5"
                  style={{ left: `${u.x}%`, top: `${u.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: dotColor }}
                  />
                  <span className="text-white text-[9px] font-semibold bg-black/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {u.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fleet summary */}
          <div className="grid grid-cols-4 divide-x divide-[#E8E4D8] border-t border-[#E8E4D8]">
            {[
              { num: '3', label: 'En Route'  },
              { num: '2', label: 'Returning' },
              { num: '2', label: 'Standby'   },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-3">
                <span className="text-[20px] font-bold text-[#1a2e0a]">{s.num}</span>
                <span className="text-[11px] text-[#8A9A7A] font-medium">{s.label}</span>
              </div>
            ))}
            <div className="flex items-center justify-center text-[13px] font-medium text-[#3d6b1e] hover:underline py-3">
              <a href="/ambulance-coordination">View All →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
