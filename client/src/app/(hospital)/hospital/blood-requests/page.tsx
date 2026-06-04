'use client';

import { useState } from 'react';
import { Droplets, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'Pending Reviews' | 'Active Matches' | 'Fulfilled History';

const TABS: Tab[] = ['Pending Reviews', 'Active Matches', 'Fulfilled History'];
const REQUESTS: Record<Tab, { id: string; patient: string; detail: string; urgency: string; action: string }[]> = {
  'Pending Reviews': [
    { id: 'BR-2533', patient: 'PT-1042', detail: 'O- Negative, 2 units', urgency: 'Critical', action: 'Review' },
    { id: 'BR-2537', patient: 'PT-1091', detail: 'A+ Positive, 1 unit', urgency: 'Medium', action: 'Assign' },
  ],
  'Active Matches': [
    { id: 'BR-2510', patient: 'PT-0972', detail: 'B+ Positive, donor wave 2', urgency: 'High', action: 'Track' },
  ],
  'Fulfilled History': [
    { id: 'BR-2028', patient: 'PT-0804', detail: 'O- Negative completed', urgency: 'Closed', action: 'View' },
  ],
};

export default function BloodRequestsPage() {
  const [tab, setTab] = useState<Tab>('Pending Reviews');

  return (
    <RequestBoard
      title="Blood Requests"
      subtitle="Review, match, and close blood donation requests."
      icon={<Droplets size={18} />}
      tab={tab}
      tabs={TABS}
      onTabChange={setTab}
      requests={REQUESTS[tab]}
      accent="red"
    />
  );
}

function RequestBoard({ title, subtitle, icon, tab, tabs, onTabChange, requests, accent }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tab: Tab;
  tabs: Tab[];
  onTabChange: (tab: Tab) => void;
  requests: { id: string; patient: string; detail: string; urgency: string; action: string }[];
  accent: 'red' | 'purple';
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">{title}</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">{subtitle}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[#D0CCBC] bg-white px-4 py-2 text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648]">
          <Filter size={14} /> Filter
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => onTabChange(item)}
            className={cn(
              'rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-all',
              tab === item ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]' : 'bg-white text-[#6B7A5A] border-[#E8E4D8] hover:border-[#7AB648]'
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {requests.map(request => (
          <article key={request.id} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accent === 'red' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700')}>
                  {icon}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1a2e0a]">{request.id}</p>
                  <p className="text-[12px] text-[#8A9A7A]">Patient {request.patient}</p>
                </div>
              </div>
              <span className="rounded-full bg-[#F5F2E8] px-2.5 py-1 text-[11px] font-semibold text-[#3A4A2A]">{request.urgency}</span>
            </div>
            <p className="mt-4 text-[13px] text-[#3A4A2A]">{request.detail}</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2B4A18]">{request.action}</button>
              <button className="rounded-lg border border-[#D0CCBC] bg-white px-3 py-2 text-[12px] font-semibold text-[#3A4A2A] hover:border-[#7AB648]">Open Timeline</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
