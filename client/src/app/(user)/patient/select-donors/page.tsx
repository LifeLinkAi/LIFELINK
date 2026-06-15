'use client';

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
          className="animate-pulse rounded-2xl border border-[#E8E4D8] bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#E8E4D8]" />
              <div>
                <div className="h-4 w-32 rounded bg-[#E8E4D8]" />
                <div className="mt-2 h-3 w-20 rounded bg-[#EFEADF]" />
              </div>
            </div>
            <div className="h-8 w-16 rounded-full bg-[#E8E4D8]" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-[#F5F2E8]" />
            <div className="h-16 rounded-xl bg-[#F5F2E8]" />
          </div>
          <div className="mt-5 h-10 rounded-xl bg-[#E8E4D8]" />
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
  }, [fetchMatches]);

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-6">
      <section className="overflow-hidden rounded-3xl border border-[#DDE6D0] bg-[#123e20] text-white shadow-sm">
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/90 transition hover:bg-white/15"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D2ECA2] px-3 py-1 text-[12px] font-bold text-[#131F00]">
                <Sparkles size={14} />
                Donor matching
              </span>
              <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-[12px] font-medium text-white/80">
                Request {requestId || 'not provided'}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-[32px]">
              Select verified donors and dispatch invitations
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/75">
              Review compatibility, proximity, and donation profile signals before notifying donors for this request.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase text-white/55">Matches</p>
              <p className="mt-1 text-2xl font-bold">{loading ? '-' : matches.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-white/55">Selected</p>
              <p className="mt-1 text-2xl font-bold">{selectedIds.size}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-white/55">Radius</p>
              <p className="mt-1 text-2xl font-bold">50km</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <CircleAlert className="mt-0.5 flex-shrink-0" size={20} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Unable to continue donor selection</p>
            <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchMatches}
            className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100 sm:inline-flex"
          >
            <RefreshCcw size={14} />
            Retry
          </button>
        </div>
      )}

      {loading && <DonorSkeleton />}

      {isEmpty && (
        <div className="rounded-3xl border border-dashed border-[#C9D6B8] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F2E8] text-[#6B7A5A]">
            <SearchX size={30} />
          </div>
          <h2 className="mt-5 text-[22px] font-bold text-[#1a2e0a]">No matching donors found in radius</h2>
          <p className="mx-auto mt-2 max-w-xl text-[14px] leading-6 text-[#6B7A5A]">
            The current request did not return compatible available donors inside the 50 km matching radius.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchMatches}
              className="inline-flex items-center gap-2 rounded-xl bg-[#123e20] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1b4d2c]"
            >
              <RefreshCcw size={16} />
              Retry search
            </button>
            <button
              type="button"
              onClick={() => router.push('/patient/request-status')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D2C4] bg-white px-4 py-2.5 text-sm font-bold text-[#1a2e0a] transition hover:bg-[#F5F2E8]"
            >
              <ClipboardList size={16} />
              View request status
            </button>
          </div>
        </div>
      )}

      {hasMatches && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    'group relative rounded-2xl border bg-white p-5 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#B6D088]/40',
                    selected ? 'border-[#3d6b1e] ring-2 ring-[#7AB648]/30' : 'border-[#E8E4D8]',
                    alreadyNotified ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  <div
                    className={cn(
                      'absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border transition',
                      selected
                        ? 'border-[#3d6b1e] bg-[#3d6b1e] text-white'
                        : 'border-[#D8D2C4] text-transparent group-hover:border-[#7AB648]'
                    )}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>

                  <div className="flex items-start gap-3 pr-10">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1A5FAA]">
                      <UserRound size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[16px] font-bold text-[#1a2e0a]">{match.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-bold text-red-700">
                          <Droplets size={13} />
                          {match.bloodGroup}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F9EA] px-2.5 py-1 text-[12px] font-bold text-[#3d6b1e]">
                          <ShieldCheck size={13} />
                          {match.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#E8E4D8] bg-[#FAF9F4] p-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7A5A]">
                        <HeartPulse size={14} />
                        Match score
                      </div>
                      <p className="mt-1 text-2xl font-bold text-[#1a2e0a]">{match.score}%</p>
                    </div>
                    <div className="rounded-xl border border-[#E8E4D8] bg-[#FAF9F4] p-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7A5A]">
                        <MapPin size={14} />
                        Distance
                      </div>
                      <p className="mt-1 text-2xl font-bold text-[#1a2e0a]">{formatDistance(match.distanceKm)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#EFEADF] pt-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-[#8A9A7A]">Donor record</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[#3A4A2A]">{match.totalDonated}</p>
                    </div>
                    {alreadyNotified ? (
                      <span className="rounded-full bg-[#F0EDE3] px-3 py-1 text-[11px] font-bold text-[#6B7A5A]">
                        Request Sent
                      </span>
                    ) : (
                      <ChevronRight className="text-[#8A9A7A] transition group-hover:translate-x-0.5" size={18} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-2 z-10 rounded-2xl border border-[#D8D2C4] bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[14px] font-bold text-[#1a2e0a]">
                  {selectedIds.size} donor{selectedIds.size === 1 ? '' : 's'} selected for dispatch
                </p>
                <p className="mt-1 text-[12.5px] text-[#6B7A5A]">
                  {selectedMatches.length > 0
                    ? selectedMatches.map((match) => match.name).join(', ')
                    : 'Select at least one available matching donor to continue.'}
                </p>
              </div>
              <button
                type="button"
                disabled={selectedIds.size === 0 || submitting}
                onClick={dispatchSelected}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#CC0000] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B00000] disabled:cursor-not-allowed disabled:bg-[#D8D2C4] disabled:text-[#6B7A5A] md:w-auto"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? 'Dispatching donors' : 'Dispatch selected donors'}
              </button>
            </div>
          </div>
        </>
      )}

      {!loading && !error && selectedIds.size === 0 && matches.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} />
          Choose one or more donors before dispatching notifications.
        </div>
      )}
    </div>
  );
}
