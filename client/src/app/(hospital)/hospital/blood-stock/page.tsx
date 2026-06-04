'use client';

import { useState } from 'react';
import { Droplets, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockStatus = 'Critical' | 'Adequate' | 'Optimal' | 'Low';

interface StockRow {
  group: string;
  status: StockStatus;
  units: number;
}

const INITIAL_STOCK: StockRow[] = [
  { group: 'O-', status: 'Critical', units: 12 },
  { group: 'O+', status: 'Optimal', units: 210 },
  { group: 'A+', status: 'Adequate', units: 84 },
  { group: 'B-', status: 'Low', units: 18 },
  { group: 'AB+', status: 'Adequate', units: 28 },
];

const STATUS_CLASS: Record<StockStatus, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  Low: 'bg-amber-50 text-amber-700 border-amber-200',
  Adequate: 'bg-blue-50 text-blue-700 border-blue-200',
  Optimal: 'bg-green-50 text-green-700 border-green-200',
};

export default function BloodStockPage() {
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [selected, setSelected] = useState<StockRow | null>(null);
  const [units, setUnits] = useState('');

  const openModal = (row: StockRow) => {
    setSelected(row);
    setUnits(String(row.units));
  };

  const saveStock = () => {
    if (!selected) return;
    const nextUnits = Number(units);
    setStock(rows => rows.map(row => row.group === selected.group ? { ...row, units: Number.isFinite(nextUnits) ? nextUnits : row.units } : row));
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Blood Stock</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Manage live blood bank inventory and critical thresholds.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stock.slice(0, 4).map(row => (
          <div key={row.group} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#6B7A5A]">{row.group}</p>
              <Droplets size={16} className="text-red-700" />
            </div>
            <p className="mt-2 text-[30px] font-bold leading-none text-[#1a2e0a]">{row.units}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">Current units</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E4D8]">
          <p className="text-[14px] font-semibold text-[#1a2e0a]">Inventory Console</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#FAFAF7] text-[11px] uppercase tracking-wide text-[#8A9A7A]">
            <tr>
              <th className="px-5 py-3">Blood Group</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Current Units</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE3]">
            {stock.map(row => (
              <tr key={row.group} className="hover:bg-[#FAFAF7]">
                <td className="px-5 py-4 text-[14px] font-bold text-[#1a2e0a]">{row.group}</td>
                <td className="px-5 py-4">
                  <span className={cn('rounded-full border px-2.5 py-1 text-[11.5px] font-semibold', STATUS_CLASS[row.status])}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#3A4A2A]">{row.units}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openModal(row)}
                    className="rounded-lg bg-[#1a2e0a] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2B4A18]"
                  >
                    Update Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-[#E8E4D8] shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
              <div>
                <p className="text-[15px] font-bold text-[#1a2e0a]">Update {selected.group} Stock</p>
                <p className="text-[12px] text-[#8A9A7A]">Mock update stored in local UI state.</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-[#8A9A7A] hover:text-[#1a2e0a]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-[#6B7A5A]">Current Units</span>
                <input
                  type="number"
                  value={units}
                  onChange={e => setUnits(e.target.value)}
                  className="h-10 rounded-lg border border-[#D0CCBC] px-3 text-[13px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-[#D0CCBC] px-4 py-2 text-[13px] font-semibold text-[#3A4A2A]">Cancel</button>
                <button type="button" onClick={saveStock} className="rounded-lg bg-[#1a2e0a] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2B4A18]">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
