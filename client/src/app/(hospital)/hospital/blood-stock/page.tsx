'use client';
import { useState } from 'react';
import { Droplets, Plus, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockStatus = 'critical' | 'low' | 'adequate' | 'optimal';

interface BloodStock {
  type: string;
  units: number;
  capacity: number;
  status: StockStatus;
  lastUpdated: string;
  expiringIn: number; // days
  reserved: number;
  trend: 'up' | 'down' | 'stable';
}

interface Transaction {
  id: string;
  type: 'in' | 'out';
  bloodType: string;
  units: number;
  source: string;
  time: string;
}

const STOCK: BloodStock[] = [
  { type:'O−',  units:12,  capacity:80,  status:'critical', lastUpdated:'2 mins ago',  expiringIn:3,  reserved:4,  trend:'down' },
  { type:'O+',  units:67,  capacity:120, status:'adequate', lastUpdated:'15 mins ago', expiringIn:18, reserved:10, trend:'stable' },
  { type:'A+',  units:84,  capacity:120, status:'adequate', lastUpdated:'1 hr ago',    expiringIn:22, reserved:8,  trend:'up' },
  { type:'A−',  units:18,  capacity:80,  status:'low',      lastUpdated:'3 hrs ago',   expiringIn:7,  reserved:2,  trend:'down' },
  { type:'B+',  units:45,  capacity:80,  status:'optimal',  lastUpdated:'30 mins ago', expiringIn:28, reserved:6,  trend:'up' },
  { type:'B−',  units:9,   capacity:80,  status:'critical', lastUpdated:'45 mins ago', expiringIn:2,  reserved:3,  trend:'down' },
  { type:'AB+', units:22,  capacity:60,  status:'low',      lastUpdated:'2 hrs ago',   expiringIn:12, reserved:4,  trend:'stable' },
  { type:'AB−', units:38,  capacity:60,  status:'optimal',  lastUpdated:'1 hr ago',    expiringIn:25, reserved:2,  trend:'up' },
];

const TRANSACTIONS: Transaction[] = [
  { id:'TXN-441', type:'out', bloodType:'O−', units:2, source:'OR-2 Surgery',          time:'Just now'   },
  { id:'TXN-440', type:'in',  bloodType:'A+', units:4, source:'City Blood Bank',        time:'18 mins ago'},
  { id:'TXN-439', type:'out', bloodType:'B+', units:1, source:'ICU Bed 7',              time:'42 mins ago'},
  { id:'TXN-438', type:'in',  bloodType:'O+', units:6, source:'Donor Drive — Hall B',   time:'1 hr ago'   },
  { id:'TXN-437', type:'out', bloodType:'AB+',units:1, source:'Maternity Ward',         time:'2 hrs ago'  },
];

const STATUS_CONFIG: Record<StockStatus, { bar:string; text:string; bg:string; border:string; label:string }> = {
  critical: { bar:'#CC0000', text:'text-red-700',   bg:'bg-red-50',   border:'border-red-200',   label:'Critical' },
  low:      { bar:'#D97706', text:'text-amber-700', bg:'bg-amber-50', border:'border-amber-200', label:'Low'      },
  adequate: { bar:'#3d6b1e', text:'text-green-700', bg:'bg-green-50', border:'border-green-200', label:'Adequate' },
  optimal:  { bar:'#16a34a', text:'text-green-700', bg:'bg-green-50', border:'border-green-200', label:'Optimal'  },
};

export default function BloodStockPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const totalUnits    = STOCK.reduce((s, b) => s + b.units, 0);
  const criticalCount = STOCK.filter(b => b.status === 'critical').length;
  const expiringCount = STOCK.filter(b => b.expiringIn <= 7).length;
  const reservedTotal = STOCK.reduce((s, b) => s + b.reserved, 0);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Blood Stock</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Real-time blood bank inventory and transaction log.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            <RefreshCw size={13} /> Sync
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#1a2e0a] text-white text-[13px] font-medium hover:bg-[#2B4A18] transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Add Stock
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Units',     value: totalUnits,    note:'Across all types',    color:'text-[#1a2e0a]' },
          { label:'Critical Types',  value: criticalCount, note:'Need immediate restock', color:'text-red-600'  },
          { label:'Expiring Soon',   value: expiringCount, note:'Within 7 days',        color:'text-amber-600' },
          { label:'Reserved Units',  value: reservedTotal, note:'Allocated to patients', color:'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#6B7A5A]">{s.label}</p>
            <p className={cn('text-[30px] font-bold leading-none', s.color)}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A]">{s.note}</p>
          </div>
        ))}
      </div>

      {/* View toggle + critical alert */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-[#f0ede3] p-1 rounded-lg">
          {(['grid','list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[12.5px] font-medium capitalize transition-colors',
                view === v ? 'bg-white text-[#1a2e0a] shadow-sm' : 'text-[#6B7A5A] hover:text-[#1a2e0a]'
              )}
            >
              {v} view
            </button>
          ))}
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium px-3 py-2 rounded-lg">
            <AlertTriangle size={14} />
            {criticalCount} blood type{criticalCount > 1 ? 's' : ''} critically low — request restock immediately
          </div>
        )}
      </div>

      {/* Stock — Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-4 gap-4">
          {STOCK.map(b => {
            const pct = Math.round((b.units / b.capacity) * 100);
            const cfg = STATUS_CONFIG[b.status];
            const available = b.units - b.reserved;
            return (
              <div
                key={b.type}
                className={cn(
                  'bg-white rounded-xl border p-4 flex flex-col gap-3',
                  b.status === 'critical' ? 'border-red-200 ring-1 ring-red-100' : 'border-[#E8E4D8]'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#f0ede3] flex items-center justify-center">
                      <Droplets size={16} className="text-[#3d6b1e]" />
                    </div>
                    <div>
                      <p className="text-[18px] font-bold text-[#1a2e0a] leading-none">{b.type}</p>
                      <p className="text-[10.5px] text-[#8A9A7A] mt-0.5">{b.lastUpdated}</p>
                    </div>
                  </div>
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.text, cfg.bg, cfg.border)}>
                    {cfg.label}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[26px] font-bold text-[#1a2e0a] leading-none">{b.units}</span>
                    <span className="text-[12px] text-[#8A9A7A]">/ {b.capacity} units</span>
                  </div>
                  <div className="h-2 bg-[#f0ede3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cfg.bar }}
                    />
                  </div>
                  <p className="text-[10.5px] text-[#8A9A7A] mt-1">{pct}% capacity</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0ede3]">
                  <div>
                    <p className="text-[10px] text-[#8A9A7A] font-medium uppercase">Available</p>
                    <p className="text-[14px] font-semibold text-[#1a2e0a]">{available} units</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8A9A7A] font-medium uppercase">Reserved</p>
                    <p className="text-[14px] font-semibold text-[#1a2e0a]">{b.reserved} units</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8A9A7A] font-medium uppercase">Expires in</p>
                    <p className={cn('text-[14px] font-semibold', b.expiringIn <= 7 ? 'text-amber-600' : 'text-[#1a2e0a]')}>
                      {b.expiringIn}d
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8A9A7A] font-medium uppercase">Trend</p>
                    <p className="text-[14px] font-semibold flex items-center gap-1">
                      {b.trend === 'up'   && <TrendingUp   size={13} className="text-green-600" />}
                      {b.trend === 'down' && <TrendingDown size={13} className="text-red-600"   />}
                      {b.trend === 'stable' && <span className="text-[#8A9A7A] text-[12px]">—</span>}
                      <span className={b.trend === 'up' ? 'text-green-600' : b.trend === 'down' ? 'text-red-600' : 'text-[#8A9A7A]'}>
                        {b.trend}
                      </span>
                    </p>
                  </div>
                </div>

                {(b.status === 'critical' || b.status === 'low') && (
                  <button className="w-full py-2 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-700 transition-colors">
                    Request Restock
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stock — List view */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E8E4D8] bg-[#f8f6f0]">
                {['Blood Type','Units','Capacity','Available','Reserved','Expires In','Status','Trend',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B7A5A] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede3]">
              {STOCK.map(b => {
                const cfg = STATUS_CONFIG[b.status];
                return (
                  <tr key={b.type} className="hover:bg-[#fafaf7] transition-colors">
                    <td className="px-4 py-3 font-bold text-[#1a2e0a]">{b.type}</td>
                    <td className="px-4 py-3 font-semibold">{b.units}</td>
                    <td className="px-4 py-3 text-[#6B7A5A]">{b.capacity}</td>
                    <td className="px-4 py-3 font-semibold">{b.units - b.reserved}</td>
                    <td className="px-4 py-3 text-[#6B7A5A]">{b.reserved}</td>
                    <td className={cn('px-4 py-3 font-medium', b.expiringIn <= 7 ? 'text-amber-600' : 'text-[#1a2e0a]')}>
                      {b.expiringIn}d
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.text, cfg.bg, cfg.border)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.trend === 'up'   && <TrendingUp   size={13} className="text-green-600" />}
                      {b.trend === 'down' && <TrendingDown size={13} className="text-red-600"   />}
                      {b.trend === 'stable' && <span className="text-[#8A9A7A]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {(b.status === 'critical' || b.status === 'low') && (
                        <button className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 transition-colors">
                          Restock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction log */}
      <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D8]">
          <span className="text-[14px] font-semibold text-[#1a2e0a]">Recent Transactions</span>
          <button className="text-[12.5px] font-medium text-[#3d6b1e] hover:underline">View all →</button>
        </div>
        <div className="divide-y divide-[#f0ede3]">
          {TRANSACTIONS.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-[11px] font-bold',
                t.type === 'in' ? 'bg-green-500' : 'bg-red-500'
              )}>
                {t.type === 'in' ? '↓' : '↑'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#1a2e0a]">
                    {t.type === 'in' ? 'Received' : 'Issued'} {t.units} unit{t.units > 1 ? 's' : ''} of {t.bloodType}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#6B7A5A]">{t.source}</p>
              </div>
              <span className="text-[11.5px] text-[#8A9A7A] flex-shrink-0">{t.time}</span>
              <span className="text-[11px] text-[#8A9A7A] flex-shrink-0">{t.id}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
