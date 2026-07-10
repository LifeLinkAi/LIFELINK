'use client';

import { useAppSelector } from '@/store/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Droplets,
  HeartPulse,
  Loader2,
  MapPin,
  RefreshCcw,
  SearchX,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

type MatchResponse = {
  donorId?: string;
  id?: string;
  _id?: string;
  userId?: string | { _id?: string; name?: string; email?: string; phone?: string };
  name?: string;
  donorName?: string;
  bloodType?: string;
  bloodGroup?: string;
  score?: number;
  matchScore?: number;
  matchPercentage?: number;
  distance?: number | string;
  distanceKm?: number | string;
  tier?: string;
  totalDonated?: string;
  phone?: string;
};

type MatchesApiResponse = {
  success: boolean;
  data: MatchResponse[];
  notifiedDonors?: string[];
};

type DonorMatch = {
  donorId: string;
  name: string;
  bloodGroup: string;
  score: number;
  distanceKm: number | null;
  tier: string;
  totalDonated: string;
  phone?: string;
};

const tierScore: Record<string, number> = {
  Platinum: 98,
  Gold: 94,
  Silver: 89,
  Bronze: 84,
};

function getTokenHeader(): { Authorization?: string } {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseNumber(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeScore(match: MatchResponse, distanceKm: number | null): number {
  const explicit = parseNumber(match.matchPercentage ?? match.matchScore ?? match.score);
  if (explicit !== null) return Math.max(0, Math.min(100, Math.round(explicit)));

  const base = tierScore[match.tier || ''] ?? 86;
  const distancePenalty = distanceKm === null ? 0 : Math.min(12, Math.floor(distanceKm / 8));
  return Math.max(72, Math.min(99, base - distancePenalty));
}

function normalizeMatch(match: MatchResponse): DonorMatch | null {
  const donorId = String(match.donorId || match.id || match._id || '');
  if (!donorId) return null;

  const nestedUser = typeof match.userId === 'object' ? match.userId : undefined;
  const distanceKm = parseNumber(match.distanceKm ?? match.distance);

  return {
    donorId,
    name: match.name || match.donorName || nestedUser?.name || 'Verified donor',
    bloodGroup: match.bloodType || match.bloodGroup || 'Unknown',
    score: normalizeScore(match, distanceKm),
    distanceKm,
    tier: match.tier || 'Verified',
    totalDonated: match.totalDonated || 'Donation history available',
    phone: match.phone || nestedUser?.phone,
  };
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) return 'Distance pending';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

function DonorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[2.5rem] border border-white bg-white/40 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/60" />
              <div>
                <div className="h-5 w-32 rounded-lg bg-white/60" />
                <div className="mt-2 h-4 w-20 rounded-lg bg-white/40" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/60" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-24 rounded-2xl bg-white/50" />
            <div className="h-24 rounded-2xl bg-white/50" />
          </div>
          <div className="mt-6 h-12 rounded-xl bg-white/60" />
        </div>
      ))}
    </div>
  );
}

export default function SelectDonorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get('requestId')?.trim() || '';

  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifiedDonorIds, setNotifiedDonorIds] = useState<Set<string>>(new Set());
  
  const lastUpdated = useAppSelector(state => state.notifications.lastUpdated);

  const selectedMatches = useMemo(
    () => matches.filter((match) => selectedIds.has(match.donorId)),
    [matches, selectedIds]
  );

  const fetchMatches = useCallback(async () => {
    if (!requestId) {
      setError('Missing request ID. Open this page from a blood or organ request to load donor matches.');
      setLoading(false);
      return;
    }

    const headers = getTokenHeader();
    if (!('Authorization' in headers)) {
      setError('Authentication token is missing. Please sign in again before selecting donors.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<MatchesApiResponse>(
        `/requests/${requestId}/find-matches`,
        { headers }
      );

      const normalized = (response.data.data || [])
        .map(normalizeMatch)
        .filter((match): match is DonorMatch => Boolean(match));

      setMatches(normalized);
      setNotifiedDonorIds(new Set((response.data.notifiedDonors || []).map(String)));
      setSelectedIds(new Set());
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load matching donors.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches, lastUpdated]);

  const toggleDonor = (donorId: string) => {
    if (notifiedDonorIds.has(donorId)) return;

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(donorId)) {
        next.delete(donorId);
      } else {
        next.add(donorId);
      }
      return next;
    });
  };

  const dispatchSelected = async () => {
    if (!requestId || selectedIds.size === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const selectedDonorIds = Array.from(selectedIds);
      const response = await api.post(
        `/requests/${requestId}/dispatch`,
        { selectedDonorIds },
        { headers: getTokenHeader() }
      );

      if (response.data?.success) {
        toast.success(`Dispatched ${selectedDonorIds.length} donor invitation${selectedDonorIds.length === 1 ? '' : 's'}.`);
        setNotifiedDonorIds((current) => {
          const next = new Set(current);
          selectedDonorIds.forEach((donorId) => next.add(donorId));
          return next;
        });
        router.push('/patient/request-status');
        return;
      }

      throw new Error(response.data?.message || 'Dispatch failed.');
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to dispatch selected donors.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasMatches = !loading && !error && matches.length > 0;
  const isEmpty = !loading && !error && matches.length === 0;

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Ambient Background Blobs */}
      <div className="absolute top-[5%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-rose-400/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6">
        
        {/* Header Hero Section */}
        <section className="overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-[0_8px_40px_rgba(15,23,42,0.4)] relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />
          
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_380px] lg:px-12 relative z-10">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-2 text-[13px] font-bold text-white/90 transition-all hover:bg-white/10 hover:border-white/30"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur px-4 py-1.5 text-[12px] font-extrabold text-blue-300 uppercase tracking-widest shadow-inner">
                  <Sparkles size={14} className="text-blue-400" />
                  Donor Radar Active
                </span>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 py-1.5 text-[12px] font-bold text-white/60 uppercase tracking-widest">
                  REQ: {requestId.slice(-6).toUpperCase() || 'NOT_FOUND'}
                </span>
              </div>
              
              <h1 className="mt-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Identify & Dispatch Verified Donors
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-400">
                Review automated compatibility scores, geographical proximity, and donor verification tiers before dispatching mission-critical alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 sm:grid-cols-3 shadow-inner">
              <div className="flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Radar Matches</p>
                <p className="text-3xl font-extrabold text-white">{loading ? '-' : matches.length}</p>
              </div>
              <div className="flex flex-col justify-center items-center text-center border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pt-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Targeted</p>
                <p className="text-3xl font-extrabold text-blue-400">{selectedIds.size}</p>
              </div>
              <div className="flex flex-col justify-center items-center text-center border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pt-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Search Radius</p>
                <p className="text-3xl font-extrabold text-white">50<span className="text-[14px] text-slate-400 ml-1">km</span></p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-4 rounded-[2rem] border border-rose-200 bg-rose-50/80 backdrop-blur p-6 text-rose-800 shadow-sm">
            <CircleAlert className="mt-1 flex-shrink-0 text-rose-600" size={24} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-extrabold">Radar Interference</p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchMatches}
              className="hidden items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-[13px] font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 sm:inline-flex border border-rose-100"
            >
              <RefreshCcw size={16} />
              Reboot Radar
            </button>
          </div>
        )}

        {loading && <DonorSkeleton />}

        {isEmpty && (
          <div className="rounded-[3rem] border border-white bg-white/60 backdrop-blur-xl p-16 text-center shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6 shadow-inner">
              <SearchX size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">No Matching Signatures</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-slate-500">
              The automated radar sweep did not detect any compatible donors within the designated 50km operational radius.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={fetchMatches}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-lg"
              >
                <RefreshCcw size={18} />
                Initiate New Sweep
              </button>
              <button
                type="button"
                onClick={() => router.push('/patient/request-status')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white/50 backdrop-blur px-6 py-3 text-[14px] font-bold text-slate-700 transition hover:bg-white shadow-sm"
              >
                <ClipboardList size={18} />
                Return to Mission Log
              </button>
            </div>
          </div>
        )}

        {hasMatches && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-32">
              {matches.map((match) => {
                const selected = selectedIds.has(match.donorId);
                const alreadyNotified = notifiedDonorIds.has(match.donorId);
                return (
                  <button
                    key={match.donorId}
                    type="button"
                    disabled={alreadyNotified}
                    onClick={() => toggleDonor(match.donorId)}
                    className={cn(
                      'group relative rounded-[2.5rem] border bg-white/60 backdrop-blur-xl p-6 text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20',
                      selected ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-[0_8px_30px_rgba(59,130,246,0.2)] bg-blue-50/50' : 'border-white shadow-sm hover:shadow-md hover:bg-white/80',
                      alreadyNotified ? 'cursor-not-allowed opacity-60 grayscale-[50%]' : 'hover:-translate-y-1'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all shadow-sm',
                        selected
                          ? 'border-blue-500 bg-blue-500 text-white shadow-blue-500/40'
                          : 'border-white bg-white/80 text-transparent group-hover:border-blue-300'
                      )}
                    >
                      <Check size={18} strokeWidth={3} />
                    </div>

                    <div className="flex items-start gap-4 pr-12">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 shadow-inner border border-white">
                        <UserRound size={28} />
                      </div>
                      <div className="min-w-0 pt-1">
                        <h3 className="truncate text-[18px] font-extrabold text-slate-800 tracking-tight">{match.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-rose-600 shadow-sm">
                            <Droplets size={12} />
                            {match.bloodGroup}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 shadow-sm">
                            <ShieldCheck size={12} />
                            {match.tier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white bg-white/50 backdrop-blur p-4 shadow-sm group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                          <HeartPulse size={14} className={selected ? "text-blue-500" : ""} />
                          Match Score
                        </div>
                        <p className="mt-1 text-3xl font-extrabold text-slate-800">{match.score}<span className="text-[18px] text-slate-400">%</span></p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white/50 backdrop-blur p-4 shadow-sm group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                          <MapPin size={14} className={selected ? "text-blue-500" : ""} />
                          Distance
                        </div>
                        <p className="mt-1 text-3xl font-extrabold text-slate-800">{formatDistance(match.distanceKm)}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/50 pt-5">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Donor Record</p>
                        <p className="mt-1 text-[13px] font-bold text-slate-700">{match.totalDonated}</p>
                      </div>
                      {alreadyNotified ? (
                        <span className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 shadow-inner">
                          Dispatched
                        </span>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                          <ChevronRight className="text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 px-4">
              <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="px-2">
                    <p className="text-[16px] font-extrabold text-slate-800 tracking-tight">
                      <span className="text-blue-600">{selectedIds.size}</span> donor{selectedIds.size === 1 ? '' : 's'} targeted for dispatch
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-slate-500 truncate max-w-md">
                      {selectedMatches.length > 0
                        ? selectedMatches.map((match) => match.name).join(', ')
                        : 'Select at least one available matching donor to initiate dispatch protocols.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={selectedIds.size === 0 || submitting}
                    onClick={dispatchSelected}
                    className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-[15px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none md:w-auto flex-shrink-0"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {submitting ? 'Transmitting...' : 'Dispatch Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
