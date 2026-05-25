'use client';
import { Siren, Droplets, Heart, Ambulance, Clock, 
         MapPin, FileHeart, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Data ──────────────────────────────────────────────
const ACTIVE_REQUESTS = [
  {
    id: 'BR-2533', type: 'Blood' as const,
    detail: 'O− · 2 units', status: 'MATCHING',
    statusLabel: '⟳ Matching donors...', statusColor: '#5B21B6', statusBg: '#EDE8FF',
    updatedAt: '2 mins ago',
  },
  {
    id: 'ORG-441', type: 'Organ' as const,
    detail: 'Kidney · O+', status: 'DONOR_FOUND',
    statusLabel: '✦ Donor Found', statusColor: '#1A5FAA', statusBg: '#E3F0FF',
    updatedAt: '30 mins ago',
  },
];

const QUICK_ACTIONS = [
  { label: 'SOS Emergency',     href: '/patient/sos',                icon: <Siren     size={22} />, color: '#CC0000', bg: '#FFE5E5', urgent: true  },
  { label: 'Request Blood',     href: '/patient/request-blood',      icon: <Droplets  size={22} />, color: '#CC0000', bg: '#FFF0F0', urgent: false },
  { label: 'Request Organ',     href: '/patient/request-organ',      icon: <Heart     size={22} />, color: '#5B21B6', bg: '#F0EEFF', urgent: false },
  { label: 'Request Ambulance', href: '/patient/request-ambulance',  icon: <Ambulance size={22} />, color: '#B86E00', bg: '#FFF8ED', urgent: false },
  { label: 'My Requests',       href: '/patient/request-status',     icon: <Clock     size={22} />, color: '#1A5FAA', bg: '#EFF6FF', urgent: false },
  { label: 'Nearby Hospitals',  href: '/patient/nearby-hospitals',   icon: <MapPin    size={22} />, color: '#2B6B0A', bg: '#F0FDF4', urgent: false },
  { label: 'Medical History',   href: '/patient/medical-history',    icon: <FileHeart size={22} />, color: '#6B7A5A', bg: '#F5F2E8', urgent: false },
];

const RECENT_ACTIVITY = [
  { time: 'Just now',   text: 'Blood request BR-2533 — AI matching in progress',      dot: '#5B21B6' },
  { time: '30 min ago', text: 'Organ request ORG-441 — Compatible donor found',       dot: '#1A5FAA' },
  { time: '2 hrs ago',  text: 'Ambulance AMB-312 arrived at Kozhikode Medical College', dot: '#2B6B0A' },
  { time: '3 days ago', text: 'Blood request BR-2028 fulfilled successfully',          dot: '#2B6B0A' },
];

const HEALTH_SNAPSHOT = [
  { label: 'Blood Type',      value: 'O−',         note: 'Universal donor',     color: 'text-red-600'    },
  { label: 'Active Requests', value: '2',           note: 'In progress',         color: 'text-purple-600' },
  { label: 'Allergies',       value: '3',           note: 'On record',           color: 'text-amber-600'  },
  { label: 'Last Visit',      value: '10 Mar',      note: 'Kozhikode Med College', color: 'text-[#1a2e0a]' },
];

const TYPE_ICONS = {
  Blood:     <Droplets  size={14} />,
  Organ:     <Heart     size={14} />,
  Ambulance: <Ambulance size={14} />,
};

const TYPE_COLORS = {
  Blood:     { color: '#CC0000', bg: '#FFE5E5' },
  Organ:     { color: '#5B21B6', bg: '#EDE8FF' },
  Ambulance: { color: '#B86E00', bg: '#FFF3E0' },
};

// ── Page ──────────────────────────────────────────────
export default function PatientDashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">
            Good morning, Patient 👋
          </h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Here is your health overview and active requests.
          </p>
        </div>
        <a href="/patient/sos"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13.5px] font-bold rounded-xl transition-colors animate-pulse hover:animate-none">
          <Siren size={16} /> SOS Emergency
        </a>
      </div>

      {/* Health snapshot */}
      <div className="grid grid-cols-4 gap-4">
        {HEALTH_SNAPSHOT.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <p className="text-[12px] font-medium text-[#6B7A5A] uppercase tracking-wide">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none mt-2', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Active requests */}
      {ACTIVE_REQUESTS.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[14px] font-semibold text-[#1a2e0a]">Active Requests</span>
            </div>
            <a href="/patient/request-status"
              className="text-[12.5px] font-medium text-[#3d6b1e] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="flex flex-col gap-3">
            {ACTIVE_REQUESTS.map(r => {
              const tc = TYPE_COLORS[r.type];
              return (
                <div key={r.id}
                  className="flex items-center gap-4 bg-[#FAFAF7] rounded-xl border border-[#F0EDE3] px-4 py-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: tc.bg, color: tc.color }}>
                    {TYPE_ICONS[r.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-[#1a2e0a]">{r.id}</span>
                      <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: tc.color, background: tc.bg }}>
                        {r.type}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#8A9A7A] mt-0.5">{r.detail} · Updated {r.updatedAt}</p>
                  </div>
                  <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: r.statusColor, background: r.statusBg }}>
                    {r.statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[13px] font-semibold text-[#1a2e0a] mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(a => (
            <a key={a.label} href={a.href}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md',
                a.urgent
                  ? 'border-red-300 bg-red-50 hover:border-red-500'
                  : 'border-[#E8E4D8] bg-white hover:border-[#7AB648]'
              )}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </div>
              <span className={cn(
                'text-[12px] font-semibold text-center leading-tight',
                a.urgent ? 'text-red-700' : 'text-[#1a2e0a]'
              )}>
                {a.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-4">

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <p className="text-[14px] font-semibold text-[#1a2e0a] mb-4">Recent Activity</p>
          <div className="flex flex-col">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0 w-3">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                    style={{ background: item.dot }} />
                  {i < RECENT_ACTIVITY.length - 1 && (
                    <div className="w-px flex-1 bg-[#E8E4D8] my-1 min-h-[16px]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide">
                    {item.time}
                  </p>
                  <p className="text-[12.5px] text-[#3A4A2A] leading-relaxed mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health tips + completed stat */}
        <div className="flex flex-col gap-4">

          {/* Completed requests stat */}
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-[28px] font-bold text-[#1a2e0a] leading-none">6</p>
              <p className="text-[12.5px] text-[#6B7A5A] mt-1">Requests fulfilled successfully</p>
            </div>
          </div>

          {/* Health reminders */}
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex-1">
            <p className="text-[13px] font-semibold text-[#1a2e0a] mb-3">Reminders</p>
            <div className="flex flex-col gap-2.5">
              {[
                { text: 'Dialysis session today at 2:00 PM',    color: '#CC0000', bg: '#FFE5E5' },
                { text: 'Influenza vaccine due Oct 2024',        color: '#B86E00', bg: '#FFF3E0' },
                { text: 'Follow-up with Dr. Kumar on 20 Apr',   color: '#1A5FAA', bg: '#E3F0FF' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                  style={{ background: r.bg }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: r.color }} />
                  <span className="text-[12.5px] font-medium" style={{ color: r.color }}>
                    {r.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
