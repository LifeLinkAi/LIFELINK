'use client';
import { useState } from 'react';
import { Heart, Droplets, Star, CheckCircle2, Clock, Loader2, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type DonationType = 'blood' | 'organ' | 'plasma';
type DonorStatus = 'arriving' | 'screening' | 'donating' | 'completed' | 'deferred';

interface Donor {
  id: string;
  name: string;
  initials: string;
  bloodType: string;
  donationType: DonationType;
  status: DonorStatus;
  scheduledAt: string;
  phone: string;
  location: string;
  units?: number;
  organ?: string;
  firstTime: boolean;
  verified: boolean;
}

const DONORS: Donor[] = [
  { id:'DON-551', name:'Aisha Nair',      initials:'AN', bloodType:'O−', donationType:'blood',  status:'donating',   scheduledAt:'Now',        phone:'+91 98401 55001', location:'Donation Bay 1', units:1,  firstTime:false, verified:true  },
  { id:'DON-550', name:'Vikram Sharma',   initials:'VS', bloodType:'A+', donationType:'blood',  status:'screening',  scheduledAt:'10 mins ago', phone:'+91 98401 55002', location:'Screening Room', units:1,  firstTime:true,  verified:false },
  { id:'DON-549', name:'Lakshmi Pillai',  initials:'LP', bloodType:'B+', donationType:'plasma', status:'arriving',   scheduledAt:'5 mins',      phone:'+91 98401 55003', location:'Reception',      firstTime:false, verified:true  },
  { id:'DON-548', name:'Rohan Menon',     initials:'RM', bloodType:'AB+',donationType:'organ',  status:'screening',  scheduledAt:'20 mins ago', phone:'+91 98401 55004', location:'Screening Room', organ:'Kidney', firstTime:false, verified:true },
  { id:'DON-547', name:'Preethi Thomas',  initials:'PT', bloodType:'O+', donationType:'blood',  status:'completed',  scheduledAt:'1 hr ago',    phone:'+91 98401 55005', location:'Rest Area',      units:1,  firstTime:false, verified:true  },
  { id:'DON-546', name:'Arjun Krishnan',  initials:'AK', bloodType:'A−', donationType:'blood',  status:'deferred',   scheduledAt:'45 mins ago', phone:'+91 98401 55006', location:'Exit',           units:1,  firstTime:true,  verified:false },
];

const STATUS_CONFIG: Record<DonorStatus, { label:string; dot:string; text:string; bg:string; border:string; icon: React.ReactNode }> = {
  arriving:  { label:'Arriving',  dot:'bg-blue-400',   text:'text-blue-700',   bg:'bg-blue-50',   border:'border-blue-200',   icon:<Clock size={11} /> },
  screening: { label:'Screening', dot:'bg-amber-400',  text:'text-amber-700',  bg:'bg-amber-50',  border:'border-amber-200',  icon:<Loader2 size={11} className="animate-spin" /> },
  donating:  { label:'Donating',  dot:'bg-green-500',  text:'text-green-700',  bg:'bg-green-50',  border:'border-green-200',  icon:<Loader2 size={11} className="animate-spin" /> },
  completed: { label:'Completed', dot:'bg-[#3d6b1e]',  text:'text-[#2B6B0A]', bg:'bg-[#f3f9ea]', border:'border-[#c0dd97]',  icon:<CheckCircle2 size={11} /> },
  deferred:  { label:'Deferred',  dot:'bg-gray-400',   text:'text-gray-600',   bg:'bg-gray-100',  border:'border-gray-200',   icon:<Clock size={11} /> },
};

const TYPE_CONFIG: Record<DonationType, { label:string; icon: React.ReactNode; color:string }> = {
  blood:  { label:'Blood',  icon:<Droplets size={12} />, color:'text-red-600'   },
  organ:  { label:'Organ',  icon:<Heart    size={12} />, color:'text-purple-600'},
  plasma: { label:'Plasma', icon:<Star     size={12} />, color:'text-blue-600'  },
};

const AVATAR_BG: Record<string, string> = {
  AN:'bg-red-500', VS:'bg-amber-500', LP:'bg-blue-500',
  RM:'bg-purple-500', PT:'bg-green-600', AK:'bg-gray-500',
};

const FILTER_TABS: { key: DonorStatus | 'all'; label: string }[] = [
  { key:'all',       label:'All'       },
  { key:'arriving',  label:'Arriving'  },
  { key:'screening', label:'Screening' },
  { key:'donating',  label:'Donating'  },
  { key:'completed', label:'Completed' },
  { key:'deferred',  label:'Deferred'  },
];

export default function DonationMonitorPage() {
  const [filter, setFilter]       = useState<DonorStatus | 'all'>('all');
  const [expandedId, setExpanded] = useState<string | null>(null);

  const visible = filter === 'all' ? DONORS : DONORS.filter(d => d.status === filter);

  const counts = FILTER_TABS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? DONORS.length : DONORS.filter(d => d.status === f.key).length;
    return acc;
  }, {} as Record<string, number>);

  const completedToday = DONORS.filter(d => d.status === 'completed').length;
  const activeNow      = DONORS.filter(d => ['arriving','screening','donating'].includes(d.status)).length;
  const bloodUnits     = DONORS.filter(d => d.donationType === 'blood' && d.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Donation Monitor</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Track walk-in and scheduled donors through the donation pipeline.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export Log
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#1a2e0a] text-white text-[13px] font-medium hover:bg-[#2B4A18] transition-colors flex items-center gap-1.5">
            <Heart size={14} /> Register Donor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Today',     value: DONORS.length,  note:'Donors registered',  color:'text-[#1a2e0a]' },
          { label:'Active Now',      value: activeNow,      note:'In pipeline',         color:'text-amber-600' },
          { label:'Completed',       value: completedToday, note:'Donations done',      color:'text-green-600' },
          { label:'Blood Units',     value: bloodUnits,     note:'Collected today',     color:'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#6B7A5A]">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Pipeline visual */}
      <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
        <p className="text-[13px] font-semibold text-[#1a2e0a] mb-4">Donation Pipeline</p>
        <div className="grid grid-cols-5 gap-2">
          {(['arriving','screening','donating','completed','deferred'] as DonorStatus[]).map((stage, i, arr) => {
            const cfg = STATUS_CONFIG[stage];
            const stageCount = DONORS.filter(d => d.status === stage).length;
            return (
              <div key={stage} className="flex flex-col items-center gap-2 relative">
                {i < arr.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-[#E8E4D8] z-0" />
                )}
                <div className={cn('w-10 h-10 rounded-full border-2 flex items-center justify-center text-[15px] font-bold z-10', cfg.border, cfg.bg, cfg.text)}>
                  {stageCount}
                </div>
                <p className="text-[11.5px] font-medium text-[#4a5940] text-center">{cfg.label}</p>
              </div>
            );
          })}
        </div>
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

      {/* Donor list */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <div className="text-center py-12 text-[#8A9A7A] text-[14px]">No donors in this stage.</div>
        )}
        {visible.map(donor => {
          const sc  = STATUS_CONFIG[donor.status];
          const tc  = TYPE_CONFIG[donor.donationType];
          const isExpanded = expandedId === donor.id;

          return (
            <div
              key={donor.id}
              onClick={() => setExpanded(isExpanded ? null : donor.id)}
              className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex items-center gap-4 cursor-pointer hover:border-[#7AB648] transition-colors"
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0', AVATAR_BG[donor.initials] ?? 'bg-gray-400')}>
                {donor.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold text-[#1a2e0a]">{donor.name}</span>
                  {donor.verified && (
                    <ShieldCheck size={13} className="text-[#3d6b1e]" />
                  )}
                  {donor.firstTime && (
                    <span className="text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full">
                      First Time
                    </span>
                  )}
                  <span className="text-[12px] font-bold text-[#1a2e0a] bg-[#f0ede3] px-2 py-0.5 rounded">{donor.bloodType}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={cn('flex items-center gap-1 text-[12px] font-medium', tc.color)}>
                    {tc.icon} {tc.label} donation
                  </span>
                  <span className="text-[11.5px] text-[#8A9A7A]">{donor.id}</span>
                  <span className="flex items-center gap-1 text-[11.5px] text-[#8A9A7A]">
                    <MapPin size={10} /> {donor.location}
                  </span>
                </div>
                {isExpanded && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-[12px] text-[#4a5940] bg-[#f8f6f0] px-2.5 py-1 rounded-lg border border-[#E8E4D8]">
                      <Phone size={11} /> {donor.phone}
                    </span>
                    {donor.organ && (
                      <span className="flex items-center gap-1.5 text-[12px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <Heart size={11} /> Organ: {donor.organ}
                      </span>
                    )}
                    {donor.units && (
                      <span className="flex items-center gap-1.5 text-[12px] text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                        <Droplets size={11} /> {donor.units} unit
                      </span>
                    )}
                  </div>
                )}
              </div>

              <span className={cn('flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0', sc.text, sc.bg, sc.border)}>
                {sc.icon} {sc.label}
              </span>

              <span className="text-[11.5px] text-[#8A9A7A] flex-shrink-0 w-24 text-right">{donor.scheduledAt}</span>

              <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                {donor.status === 'screening' && (
                  <button className="px-3 py-1.5 text-[12px] font-medium bg-[#1a2e0a] text-white rounded-lg hover:bg-[#2B4A18] transition-colors flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Verify
                  </button>
                )}
                {donor.status === 'arriving' && (
                  <button className="px-3 py-1.5 text-[12px] font-medium border border-[#E8E4D8] rounded-lg text-[#4a5940] hover:border-[#7AB648] transition-colors">
                    Check In
                  </button>
                )}
                {donor.status === 'completed' && (
                  <button className="px-3 py-1.5 text-[12px] font-medium border border-[#E8E4D8] rounded-lg text-[#3d6b1e] hover:border-[#7AB648] transition-colors">
                    View Record
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
