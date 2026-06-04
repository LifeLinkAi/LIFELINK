'use client';

import { useState } from 'react';
import { Droplets, Heart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type RequestType = 'Blood' | 'Organ' | 'General';

const REQUESTS: { id: string; patient: string; type: RequestType; detail: string; status: 'OPEN' | 'IN_REVIEW' | 'COMPLETED' }[] = [
  { id: 'REQ-1042', patient: 'PT-1042', type: 'Blood', detail: 'O- Negative, 2 units', status: 'OPEN' },
  { id: 'REQ-1188', patient: 'PT-1188', type: 'Organ', detail: 'Kidney compatibility review', status: 'IN_REVIEW' },
  { id: 'REQ-1205', patient: 'PT-1205', type: 'General', detail: 'Emergency care coordination', status: 'COMPLETED' },
];

const TYPE_CONFIG = {
  Blood: { icon: <Droplets size={15} />, className: 'bg-red-50 text-red-700' },
  Organ: { icon: <Heart size={15} />, className: 'bg-purple-50 text-purple-700' },
  General: { icon: <Search size={15} />, className: 'bg-[#F5F2E8] text-[#1a2e0a]' },
};

export default function PatientRequestsPage() {
  const [filter, setFilter] = useState<RequestType | 'All'>('All');
  const visible = filter === 'All' ? REQUESTS : REQUESTS.filter(request => request.type === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Patient Requests</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">All incoming patient requests across blood, organ, and general care workflows.</p>
      </div>

      <div className="flex gap-2">
        {(['All', 'Blood', 'Organ', 'General'] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-all',
              filter === item ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]' : 'bg-white text-[#6B7A5A] border-[#E8E4D8] hover:border-[#7AB648]'
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map(request => {
          const type = TYPE_CONFIG[request.type];
          return (
            <article key={request.id} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', type.className)}>
                    {type.icon}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a2e0a]">{request.id}</p>
                    <p className="text-[12px] text-[#8A9A7A]">Patient {request.patient}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#F5F2E8] px-2.5 py-1 text-[11px] font-semibold text-[#3A4A2A]">{request.status}</span>
              </div>
              <p className="mt-4 text-[13px] text-[#3A4A2A]">{request.detail}</p>
              <button className="mt-4 rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2B4A18]">
                Open Request
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
