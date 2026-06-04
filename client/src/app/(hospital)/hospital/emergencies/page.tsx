'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaseStatus = 'Pending' | 'Responding';

interface CriticalCase {
  id: string;
  condition: string;
  eta: string;
  status: CaseStatus;
}

const INITIAL_CASES: CriticalCase[] = [
  { id: 'PT-1042', condition: 'Severe anemia, O- needed', eta: '4 min', status: 'Pending' },
  { id: 'PT-1188', condition: 'Renal transplant review', eta: '12 min', status: 'Pending' },
  { id: 'PT-1205', condition: 'Post-op bleeding alert', eta: '18 min', status: 'Responding' },
];

export default function HospitalEmergenciesPage() {
  const [cases, setCases] = useState(INITIAL_CASES);

  const acknowledge = (id: string) => {
    setCases(items => items.map(item => item.id === id ? { ...item, status: 'Responding' } : item));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Emergencies</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">Ongoing critical cases requiring hospital action.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical Cases', value: cases.length, color: 'text-red-700' },
          { label: 'Pending', value: cases.filter(c => c.status === 'Pending').length, color: 'text-amber-700' },
          { label: 'Responding', value: cases.filter(c => c.status === 'Responding').length, color: 'text-green-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <p className={cn('text-[30px] font-bold leading-none', stat.color)}>{stat.value}</p>
            <p className="text-[12px] text-[#6B7A5A] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E4D8] flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-700" />
          <span className="text-[14px] font-semibold text-[#1a2e0a]">Critical Case Queue</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAFAF7] text-[11px] uppercase tracking-wide text-[#8A9A7A]">
              <tr>
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">ETA</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE3]">
              {cases.map(item => (
                <tr key={item.id} className="hover:bg-[#FAFAF7]">
                  <td className="px-5 py-4 text-[13px] font-bold text-[#1a2e0a]">{item.id}</td>
                  <td className="px-5 py-4 text-[13px] text-[#3A4A2A]">{item.condition}</td>
                  <td className="px-5 py-4 text-[13px] text-[#6B7A5A]">{item.eta}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold',
                      item.status === 'Responding'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {item.status === 'Responding' && <CheckCircle2 size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => acknowledge(item.id)}
                      disabled={item.status === 'Responding'}
                      className="rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2B4A18] disabled:cursor-default disabled:bg-[#D0CCBC]"
                    >
                      Acknowledge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
