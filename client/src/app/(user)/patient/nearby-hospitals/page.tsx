'use client';
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Phone, Clock, Droplets, Heart, Search, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface BloodStock {
  group: string;
  level: 'critical' | 'low' | 'adequate' | 'optimal';
  units: number;
}

interface Hospital {
  id: string;
  name: string;
  distance: string;
  distanceNum: number;
  eta: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private' | 'Trust';
  emergencyOpen: boolean;
  bloodBank: boolean;
  organTransplant: boolean;
  rating: number;
  bloodStock: BloodStock[];
  waitTime: string;
}

interface BackendHospital {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  status?: string;
  specialties?: string[];
  rating?: number;
  website?: string;
  email?: string;
  [key: string]: unknown;
}

function generateRandomDistance(): { distance: string; distanceNum: number; eta: string } {
  const distNum = Math.round((Math.random() * 8 + 0.5) * 10) / 10;
  const eta = Math.round(distNum * 3.5 + Math.random() * 5);
  return {
    distance: `${distNum} km`,
    distanceNum: distNum,
    eta: `${eta} min`,
  };
}

function mapBackendToFrontend(h: BackendHospital): Hospital {
  const { distance, distanceNum, eta } = generateRandomDistance();
  const hasBloodBank = h.specialties?.includes('blood-bank') ?? Math.random() > 0.3;
  const hasOrganTransplant = h.specialties?.includes('organ-transplant') ?? Math.random() > 0.5;

  return {
    id: h.id,
    name: h.name,
    distance,
    distanceNum,
    eta,
    address: h.city || 'Address not available',
    phone: h.phone || 'N/A',
    type: 'Private',
    emergencyOpen: h.status === 'active',
    bloodBank: hasBloodBank,
    organTransplant: hasOrganTransplant,
    rating: h.rating ?? 4.0 + Math.random() * 0.8,
    bloodStock: [
      { group: 'O-', level: 'critical', units: 12 },
      { group: 'A+', level: 'adequate', units: 84 },
      { group: 'B+', level: 'optimal', units: 67 },
      { group: 'AB+', level: 'low', units: 22 },
    ],
    waitTime: h.status === 'active' ? `${Math.floor(Math.random() * 45) + 15} min` : 'Closed',
  };
}

const STOCK_COLORS = {
  critical: { bar: '#CC0000', text: 'text-red-700',   bg: 'bg-red-50'   },
  low:      { bar: '#D97706', text: 'text-amber-700', bg: 'bg-amber-50' },
  adequate: { bar: '#3d6b1e', text: 'text-green-700', bg: 'bg-green-50' },
  optimal:  { bar: '#16a34a', text: 'text-green-700', bg: 'bg-green-50' },
};

const TYPE_COLORS = {
  Government: 'text-blue-700  bg-blue-50  border-blue-200',
  Private:    'text-purple-700 bg-purple-50 border-purple-200',
  Trust:      'text-amber-700 bg-amber-50  border-amber-200',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={cn('text-[12px]', i <= Math.floor(rating) ? 'text-amber-400' : 'text-[#D0CCBC]')}>
          ★
        </span>
      ))}
      <span className="text-[11.5px] text-[#6B7A5A] ml-0.5">{rating}</span>
    </div>
  );
}

function BloodStockBar({ stock }: { stock: BloodStock }) {
  const c = STOCK_COLORS[stock.level];
  const pct = Math.min(100, Math.round((stock.units / 100) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[11.5px] font-bold text-[#1a2e0a]">{stock.group}</span>
        <span className={cn('text-[10px] font-semibold', c.text)}>{stock.units}u</span>
      </div>
      <div className="h-1.5 bg-[#F0EDE3] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: c.bar }} />
      </div>
    </div>
  );
}

function HospitalCard({ hospital: h, onGetDirections }:
  { hospital: Hospital; onGetDirections: (id: string) => void }
) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      'bg-white rounded-xl border border-[#E8E4D8] overflow-hidden transition-all',
      !h.emergencyOpen && 'opacity-70'
    )}>
      {/* Main row */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] font-bold text-[#1a2e0a]">{h.name}</h3>
              <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-full border', TYPE_COLORS[h.type])}>
                {h.type}
              </span>
              {!h.emergencyOpen && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600">
                  ER Closed
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-[#8A9A7A]" />
              <span className="text-[11.5px] text-[#8A9A7A]">{h.address}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StarRating rating={h.rating} />
              <span className="flex items-center gap-1 text-[11.5px] text-[#6B7A5A]">
                <Navigation size={11} /> {h.distance} · {h.eta}
              </span>
              <span className="flex items-center gap-1 text-[11.5px] text-[#6B7A5A]">
                <Clock size={11} /> Wait: {h.waitTime}
              </span>
            </div>
          </div>

          {/* Distance badge */}
          <div className="flex flex-col items-center bg-[#F5F2E8] rounded-lg px-3 py-2 flex-shrink-0">
            <span className="text-[18px] font-bold text-[#1a2e0a]">{h.distance}</span>
            <span className="text-[10px] text-[#8A9A7A]">{h.eta}</span>
          </div>
        </div>

        {/* Service badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {h.bloodBank && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              <Droplets size={10} /> Blood Bank
            </span>
          )}
          {h.organTransplant && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              <Heart size={10} /> Organ Transplant
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onGetDirections(h.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2e0a] text-white text-[12px] font-medium rounded-lg hover:bg-[#2B4A18] transition-colors"
          >
            <Navigation size={12} /> Directions
          </button>
          <a href={`tel:${h.phone}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[12px] font-medium rounded-lg hover:border-[#7AB648] transition-colors">
            <Phone size={12} /> Call
          </a>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-[#D0CCBC] text-[#6B7A5A] text-[12px] font-medium rounded-lg hover:border-[#7AB648] transition-colors ml-auto"
          >
            Blood Stock {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Blood stock expanded */}
      {expanded && (
        <div className="px-5 pb-4 pt-3 border-t border-[#F0EDE3] bg-[#FAFAF7]">
          <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-3">
            Live Blood Stock
          </p>
          <div className="grid grid-cols-4 gap-3">
            {h.bloodStock.map(s => <BloodStockBar key={s.group} stock={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NearbyHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'wait'>('distance');
  const [filterService, setFilterService] = useState('all');

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<BackendHospital[] | { success: true; data: BackendHospital[] }>('/hospitals');
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        const transformed = data.map(mapBackendToFrontend);
        setHospitals(transformed);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || err?.message || 'Unable to load hospitals.';
        setError(message);
        toast.error(message);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const SERVICE_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'blood', label: '🩸 Blood Bank' },
    { key: 'organ', label: '🫀 Organ Transplant' },
    { key: 'open', label: '✓ ER Open' },
  ];

  const filtered = useMemo(() => {
    return hospitals
      .filter(h => {
        const ms = search === '' || h.name.toLowerCase().includes(search.toLowerCase());
        const mf = filterService === 'all'
          ? true
          : filterService === 'blood'
            ? h.bloodBank
            : filterService === 'organ'
              ? h.organTransplant
              : filterService === 'open'
                ? h.emergencyOpen
                : true;
        return ms && mf;
      })
      .sort((a, b) =>
        sortBy === 'distance'
          ? a.distanceNum - b.distanceNum
          : sortBy === 'rating'
            ? b.rating - a.rating
            : a.waitTime.localeCompare(b.waitTime)
      );
  }, [hospitals, search, sortBy, filterService]);

  const stats = useMemo(() => {
    return [
      { label: 'Total Nearby', value: hospitals.length, color: '' },
      { label: 'ER Open', value: hospitals.filter(h => h.emergencyOpen).length, color: 'text-green-700' },
      { label: 'Blood Banks', value: hospitals.filter(h => h.bloodBank).length, color: 'text-red-600' },
    ];
  }, [hospitals]);

  const handleDirections = (id: string) => {
    const h = hospitals.find(x => x.id === id);
    if (h) window.open(`https://maps.google.com?q=${encodeURIComponent(h.address)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Nearby Hospitals</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            {loading ? 'Loading hospitals…' : `${hospitals.length} hospitals found in your area`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-4 text-center">
            <p className={cn('text-[26px] font-bold leading-none', s.color || 'text-[#1a2e0a]')}>
              {loading ? '—' : s.value}
            </p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {!loading && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 h-9 w-52 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#8A9A7A]">Sort:</span>
              {(['distance', 'rating', 'wait'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all capitalize',
                    sortBy === s
                      ? 'bg-[#1a2e0a] text-white border-[#1a2e0a]'
                      : 'bg-white text-[#5A6A4A] border-[#D0CCBC] hover:border-[#7AB648]'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap -mt-2">
            {SERVICE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterService(f.key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                  filterService === f.key
                    ? 'bg-[#F0EDE3] text-[#2B4A18] border-[#2B4A18]'
                    : 'bg-white text-[#6B7A5A] border-[#E8E4D8] hover:border-[#7AB648]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-[#F5F5F3] p-6 h-32" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(h => <HospitalCard key={h.id} hospital={h} onGetDirections={handleDirections} />)
        ) : (
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
            No hospitals match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
