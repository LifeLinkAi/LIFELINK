'use client';

import { useEffect, useState } from 'react';
import { Droplets, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type StockStatus = 'Critical' | 'Adequate' | 'Optimal' | 'Low';

interface StockRow {
  group: string;
  status: StockStatus;
  units: number;
  maxCapacity: number;
}

const INITIAL_STOCK: StockRow[] = [
  { group: 'O-', status: 'Critical', units: 12, maxCapacity: 100 },
  { group: 'O+', status: 'Optimal', units: 210, maxCapacity: 250 },
  { group: 'A+', status: 'Adequate', units: 84, maxCapacity: 120 },
  { group: 'B-', status: 'Low', units: 18, maxCapacity: 80 },
  { group: 'AB+', status: 'Adequate', units: 28, maxCapacity: 70 },
];

const normalizeStatus = (status: string | undefined): StockStatus => {
  switch (status?.toLowerCase()) {
    case 'critical':
      return 'Critical';
    case 'low':
      return 'Low';
    case 'optimal':
      return 'Optimal';
    default:
      return 'Adequate';
  }
};

const calculateStatus = (units: number, maxCapacity: number): string => {
  const percentage = maxCapacity > 0 ? (units / maxCapacity) * 100 : 0;
  if (percentage <= 15) return 'critical';
  if (percentage <= 30) return 'low';
  if (percentage >= 80) return 'optimal';
  return 'adequate';
};

const STATUS_CLASS: Record<StockStatus, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  Low: 'bg-amber-50 text-amber-700 border-amber-200',
  Adequate: 'bg-blue-50 text-blue-700 border-blue-200',
  Optimal: 'bg-green-50 text-green-700 border-green-200',
};

export default function BloodStockPage() {
  const [stock, setStock] = useState<StockRow[]>(INITIAL_STOCK);
  const [selected, setSelected] = useState<StockRow | null>(null);
  const [units, setUnits] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/hospital/dashboard');
        const payload = res.data?.data ?? res.data;
        const inventory = Array.isArray(payload?.bloodInventory) ? payload.bloodInventory.map((item: any) => ({
          group: item.bloodGroup,
          units: item.units ?? 0,
          maxCapacity: item.maxCapacity ?? 100,
          status: normalizeStatus(item.status),
        })) : INITIAL_STOCK;

        if (!mounted) return;
        setStock(inventory);
      } catch (error: any) {
        toast.error(error?.response?.data?.error?.message || error?.message || 'Failed to load blood inventory.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadInventory();
    return () => { mounted = false; };
  }, []);

  const openModal = (row: StockRow) => {
    setSelected(row);
    setUnits(String(row.units));
  };

  const saveStock = async () => {
    if (!selected) return;
    const nextUnits = Number(units);
    const unitsValue = Number.isFinite(nextUnits) ? nextUnits : selected.units;
    const statusValue = calculateStatus(unitsValue, selected.maxCapacity);
    const requestBody = {
      bloodGroup: selected.group,
      units: unitsValue,
      maxCapacity: selected.maxCapacity,
      status: statusValue,
    };

    setSavingGroup(selected.group);
    try {
      const res = await api.put('/hospital/inventory', requestBody);
      const payload = res.data?.data ?? res.data;
      const updatedInventory = Array.isArray(payload) ? payload.map((item: any) => ({
        group: item.bloodGroup,
        units: item.units ?? 0,
        maxCapacity: item.maxCapacity ?? 100,
        status: normalizeStatus(item.status),
      })) : stock;

      setStock(updatedInventory);
      toast.success('Inventory updated successfully.');
      setSelected(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.message || 'Failed to update inventory.');
    } finally {
      setSavingGroup(null);
    }
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
        {isLoading ? (
          <div className="p-6 text-center text-sm text-[#6B7A5A]">Loading inventory…</div>
        ) : (
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
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-[#E8E4D8] shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
              <div>
                <p className="text-[15px] font-bold text-[#1a2e0a]">Update {selected.group} Stock</p>
                <p className="text-[12px] text-[#8A9A7A]">Submit stock changes to the live hospital inventory.</p>
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
                <button
                  type="button"
                  onClick={saveStock}
                  disabled={savingGroup === selected?.group}
                  className="rounded-lg bg-[#1a2e0a] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2B4A18] disabled:cursor-not-allowed disabled:bg-[#8A9A7A]"
                >
                  {savingGroup === selected?.group ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
