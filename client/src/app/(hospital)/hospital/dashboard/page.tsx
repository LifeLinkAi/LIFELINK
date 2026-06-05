'use client';

import { useState } from 'react';
import { 
  AlertTriangle, Droplets, Users, Heart,
  TrendingUp, TrendingDown, Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const BLOOD_LEVELS: BloodLevel[] = [
  { type: 'O Negative', units: 12, max: 80, status: 'critical' },
  { type: 'A Positive', units: 84, max: 120, status: 'adequate' },
  { type: 'B Negative', units: 45, max: 80, status: 'optimal' },
  { type: 'AB Positive', units: 22, max: 80, status: 'low' },
];

const ACTIVITY: ActivityItem[] = [
  { time: 'JUST NOW',    title: 'Critical Blood Request',    desc: 'O-Negative request escalated. Donor matching wave 2 started.', urgent: true  },
  { time: '12 MINS AGO', title: 'Organ Verification Updated',  desc: 'Kidney donor medical review moved to legal clearance.',       urgent: false },
  { time: '28 MINS AGO', title: 'Blood Request Fulfilled',     desc: 'O-Negative units transferred to OR-2 for ongoing surgery.',   urgent: false },
  { time: '1 HR AGO',    title: 'ICU Bed Alert',               desc: 'Capacity reached 90%. Elective admissions deferred.',         urgent: false },
];

const STATUS_COLORS = {
  critical: { bar: '#CC0000', text: 'text-red-700' },
  low: { bar: '#D97706', text: 'text-amber-700' },
  adequate: { bar: '#3d6b1e', text: 'text-green-700' },
  optimal: { bar: '#16a34a', text: 'text-green-700' },
};

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
        <StatCard title="ICU Capacity" subtitle="Critical beds" value="92" suffix="%" tag="NEAR CAPACITY" tagVariant="warn" icon={<AlertTriangle size={18} />} trend="+2%" trendUp={false} />
        <StatCard title="ER Wait Time" subtitle="Average today" value="45" suffix="min" tag="LEVEL 1 — ELEVATED" tagVariant="critical" icon={<Activity size={18} />} />
        <StatCard title="On-Call Staff" subtitle="Active shift" value="142" suffix="total" tag="✓ Optimal coverage" tagVariant="ok" icon={<Users size={18} />} trend="+8" trendUp={true} />
        <StatCard title="Organ Requests" subtitle="Pending reviews" value="4" suffix="active" tag="2 urgent" tagVariant="warn" icon={<Heart size={18} />} />
      </div>

      {/* Blood bank card */}
      <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#4a5940]">
            <Droplets size={16} />
            <span className="text-[14px] font-semibold text-[#1a2e0a]">Blood Bank Levels</span>
          </div>
          <a href="/hospital/blood-stock" className="text-[12px] font-medium text-[#3d6b1e] hover:underline">Manage stock →</a>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {BLOOD_LEVELS.map(b => <BloodLevelBar key={b.type} item={b} />)}
        </div>
      </div>

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
    </div>
  );
}

type TagVariant = 'critical' | 'warn' | 'ok';

function StatCard({ title, subtitle, value, suffix, tag, tagVariant, icon, trend, trendUp }: {
  title: string;
  subtitle: string;
  value: string;
  suffix?: string;
  tag: string;
  tagVariant: TagVariant;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  const tagColors: Record<TagVariant, string> = {
    critical: 'text-red-700 bg-red-50 border border-red-200',
    warn: 'text-amber-700 bg-amber-50 border border-amber-200',
    ok: 'text-green-700 bg-green-50 border border-green-200',
  };
  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-[#6B7A5A] uppercase tracking-wide">{title}</p>
          <p className="text-[11.5px] text-[#8A9A7A] mt-0.5">{subtitle}</p>
        </div>
        <div className="w-9 h-9 bg-[#f3f9ea] rounded-lg flex items-center justify-center text-[#3d6b1e]">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-bold text-[#1a2e0a] leading-none">{value}</span>
        {suffix && <span className="text-[15px] text-[#8A9A7A]">{suffix}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', tagColors[tagVariant])}>{tag}</span>
        {trend && (
          <span className={cn('flex items-center gap-1 text-[12px] font-medium', trendUp ? 'text-green-600' : 'text-red-600')}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function BloodLevelBar({ item }: { item: BloodLevel }) {
  const pct = Math.round((item.units / item.max) * 100);
  const color = STATUS_COLORS[item.status];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12.5px] font-medium text-[#4a5940]">{item.type}</span>
        <span className={cn('text-[11.5px] font-semibold', color.text)}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)} ({item.units})</span>
      </div>
      <div className="h-1.5 bg-[#F0EDE3] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color.bar }} />
      </div>
    </div>
  );
}
