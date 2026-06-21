'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Heart, Plus, RefreshCw, Search, Filter,
  ExternalLink, Loader2, AlertCircle,
  TrendingUp, Clock, CheckCircle2, Users, GitMerge,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import RegisterPatientModal from './RegisterPatientModal';
import ReviewMatchModal, { OrganMatch } from './ReviewMatchModal';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type UrgencyLevel   = 'Critical' | 'High' | 'Medium' | 'Low';
type WaitlistStatus = 'Waitlisted' | 'Match Found' | 'Surgery Scheduled' | 'Completed' | 'Withdrawn';
type ActiveTab      = 'waitlist' | 'matches';

interface WaitlistPatient {
  id:                    string;
  fullName:              string;
  age:                   number;
  gender:                'Male' | 'Female' | 'Other';
  contact:               string;
  requiredOrgan:         string;
  bloodGroup:            string;
  urgency:               UrgencyLevel;
  status:                WaitlistStatus;
  medicalCertificateUrl: string;
  medicalHistory:        string;
  comorbidities:         string;
  createdAt:             string;
}

// ─────────────────────────────────────────────
// DISPLAY CONFIGS
// ─────────────────────────────────────────────

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; dot: string; text: string; bg: string; border: string }> = {
  Critical: { label: 'Critical', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    },
  High:     { label: 'High',     dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  Medium:   { label: 'Medium',   dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  Low:      { label: 'Low',      dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  },
};

const STATUS_CONFIG: Record<WaitlistStatus, { label: string; text: string; bg: string; border: string }> = {
  'Waitlisted':        { label: 'Waitlisted',        text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  'Match Found':       { label: 'Match Found',       text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  'Surgery Scheduled': { label: 'Surgery Scheduled', text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  'Completed':         { label: 'Completed',         text: 'text-green-700',  bg: 'bg-[#f3f9ea]', border: 'border-[#c0dd97]'  },
  'Withdrawn':         { label: 'Withdrawn',         text: 'text-gray-600',   bg: 'bg-gray-100',  border: 'border-gray-200'   },
};

const ORGAN_ICONS: Record<string, string> = {
  'Kidney':        '🫘',
  'Liver Segment': '🫀',
  'Cornea':        '👁️',
  'Heart':         '❤️',
  'Lung':          '🫁',
  'Pancreas':      '🧬',
  'Bone Marrow':   '🦴',
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────

function StatCard({
  label, value, note, color, icon,
}: {
  label: string; value: number | string; note: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex items-start gap-3">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div>
        <p className="text-[28px] font-bold leading-none text-[#1a2e0a]">{value}</p>
        <p className="text-[12px] font-medium text-[#4A5A3A] mt-0.5">{label}</p>
        <p className="text-[11px] text-[#8A9A7A]">{note}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCH CARD (Incoming Matches tab)
// ─────────────────────────────────────────────

function MatchCard({ match, onReview }: { match: OrganMatch; onReview: () => void }) {
  const { patient, donor } = match;
  const urgCfg = URGENCY_CONFIG[(patient?.urgency ?? 'Medium') as UrgencyLevel];

  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] hover:border-purple-300 transition-colors overflow-hidden">
      <div className={cn('h-1 w-full', urgCfg.dot)} />
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Patient side */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-[12px] font-bold text-purple-600 flex-shrink-0">
              {patient ? patient.fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1a2e0a] truncate">{patient?.fullName ?? '—'}</p>
              <p className="text-[11px] text-[#8A9A7A]">
                {patient?.age}y · {patient?.gender} · {ORGAN_ICONS[patient?.requiredOrgan ?? ''] ?? '🫀'} {patient?.requiredOrgan}
              </p>
              <p className="text-[11px] font-bold text-purple-700 mt-0.5">{patient?.bloodGroup}</p>
            </div>
          </div>

          {/* Donor side */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-[12px] font-bold text-green-700 flex-shrink-0">
              {donor ? donor.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1a2e0a] truncate">{donor?.name ?? 'Unknown Donor'}</p>
              <p className="text-[11px] text-[#8A9A7A]">{donor?.email ?? 'No email'}</p>
              <p className="text-[11px] font-bold text-green-700 mt-0.5">{donor?.bloodType} · {donor?.tier}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0EDE3]">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border',
            urgCfg.text, urgCfg.bg, urgCfg.border,
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', urgCfg.dot)} />
            {urgCfg.label}
          </span>

          <button
            onClick={onReview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-semibold transition-colors shadow-sm"
          >
            <GitMerge size={12} />
            Review Match
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────

export default function OrganManagementPage() {
  const [activeTab,    setActiveTab]    = useState<ActiveTab>('waitlist');
  const [patients,     setPatients]     = useState<WaitlistPatient[]>([]);
  const [matches,      setMatches]      = useState<OrganMatch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [reviewMatch,  setReviewMatch]  = useState<OrganMatch | null>(null);
  const [search,       setSearch]       = useState('');
  const [filterOrgan,  setFilterOrgan]  = useState('all');
  const [filterStatus, setFilterStatus] = useState<WaitlistStatus | 'all'>('all');
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: WaitlistPatient[] }>('/organ-waitlist');
      setPatients(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setMatchLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: OrganMatch[] }>('/organ-waitlist/matches');
      setMatches(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load incoming matches');
    } finally {
      setMatchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchMatches();
  }, [fetchPatients, fetchMatches]);

  const updateStatus = async (id: string, status: WaitlistStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/organ-waitlist/${id}/status`, { status });
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const ORGANS = Array.from(new Set(patients.map(p => p.requiredOrgan))).sort();

  const visible = patients.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        p.requiredOrgan.toLowerCase().includes(search.toLowerCase());
    const matchOrgan  = filterOrgan === 'all'  || p.requiredOrgan === filterOrgan;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchOrgan && matchStatus;
  });

  const stats = {
    total:     patients.length,
    critical:  patients.filter(p => p.urgency === 'Critical').length,
    matched:   patients.filter(p => p.status === 'Match Found').length,
    completed: patients.filter(p => p.status === 'Completed').length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            <Heart size={20} />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-[#1a2e0a] tracking-tight">Organ Management Hub</h1>
            <p className="text-[13px] text-[#6B7A5A] mt-0.5">
              Manage transplant waitlist registrations and review incoming donor matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => { fetchPatients(); fetchMatches(); }}
            disabled={loading && matchLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={cn((loading || matchLoading) && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a2e0a] text-white text-[13px] font-semibold hover:bg-[#2B4A18] transition-colors shadow-sm"
          >
            <Plus size={14} />
            Register Transplant Patient
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Waitlisted" value={stats.total}     note="All registered patients"     color="bg-purple-100 text-purple-600" icon={<Users size={17} />} />
        <StatCard label="Critical Cases"   value={stats.critical}  note="Requiring urgent attention"  color="bg-red-100 text-red-600"       icon={<AlertCircle size={17} />} />
        <StatCard label="Matches Found"    value={stats.matched}   note="Donors identified"           color="bg-blue-100 text-blue-600"     icon={<TrendingUp size={17} />} />
        <StatCard label="Completed"        value={stats.completed} note="Successful transplants"      color="bg-green-100 text-green-600"   icon={<CheckCircle2 size={17} />} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F5F2E8] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('waitlist')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all',
            activeTab === 'waitlist' ? 'bg-white text-[#1a2e0a] shadow-sm' : 'text-[#6B7A5A] hover:text-[#1a2e0a]',
          )}
        >
          <Users size={14} />
          Active Waitlist
          <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded-full', activeTab === 'waitlist' ? 'bg-[#F0EDE3] text-[#4A5A3A]' : 'bg-white/60 text-[#6B7A5A]')}>
            {patients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all',
            activeTab === 'matches' ? 'bg-white text-[#1a2e0a] shadow-sm' : 'text-[#6B7A5A] hover:text-[#1a2e0a]',
          )}
        >
          <GitMerge size={14} />
          Incoming Matches
          {matches.length > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white animate-pulse">
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE WAITLIST */}
      {activeTab === 'waitlist' && (
        <>
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
              <input
                type="text"
                placeholder="Search by patient name or organ…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-[13px] bg-[#FAFAF7] border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={13} className="text-[#8A9A7A]" />
              <select
                value={filterOrgan}
                onChange={e => setFilterOrgan(e.target.value)}
                className="h-9 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors min-w-[140px]"
              >
                <option value="all">All Organs</option>
                {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as WaitlistStatus | 'all')}
              className="h-9 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors min-w-[150px] flex-shrink-0"
            >
              <option value="all">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden">
            <div className="grid grid-cols-[minmax(0,2fr)_120px_100px_110px_130px_180px_48px] px-5 py-3 bg-[#F5F2E8] border-b border-[#E8E4D8] text-[11.5px] font-semibold text-[#6B7A5A] uppercase tracking-wide">
              <span>Patient</span><span>Required Organ</span><span>Blood Group</span>
              <span>Urgency</span><span>Status</span><span>Registered</span><span>Cert.</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-[#8A9A7A] text-[14px]">
                <Loader2 size={16} className="animate-spin" /> Loading waitlist…
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-300">
                  <Heart size={28} />
                </div>
                <p className="text-[14px] font-semibold text-[#4A5A3A]">
                  {patients.length === 0 ? 'No patients registered yet' : 'No results match your filters'}
                </p>
                <p className="text-[12.5px] text-[#8A9A7A]">
                  {patients.length === 0
                    ? 'Click "Register Transplant Patient" to add the first patient.'
                    : 'Try adjusting the search or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EDE3]">
                {visible.map(patient => {
                  const urg = URGENCY_CONFIG[patient.urgency] ?? URGENCY_CONFIG.Medium;
                  const sta = STATUS_CONFIG[patient.status]   ?? STATUS_CONFIG.Waitlisted;
                  const isUpdating = updatingId === patient.id;

                  return (
                    <div
                      key={patient.id}
                      className="grid grid-cols-[minmax(0,2fr)_120px_100px_110px_130px_180px_48px] items-center px-5 py-4 hover:bg-[#FAFAF7] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[12px] font-bold text-purple-600 flex-shrink-0">
                            {patient.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold text-[#1a2e0a] truncate">{patient.fullName}</p>
                            <p className="text-[11.5px] text-[#8A9A7A]">{patient.age}y · {patient.gender} · {patient.contact}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px]" aria-hidden>{ORGAN_ICONS[patient.requiredOrgan] ?? '🫀'}</span>
                        <span className="text-[12.5px] font-medium text-[#3A4A2A]">{patient.requiredOrgan}</span>
                      </div>

                      <span className="text-[13px] font-bold text-[#1a2e0a] bg-[#F0EDE3] px-2 py-0.5 rounded w-fit">
                        {patient.bloodGroup}
                      </span>

                      <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full border w-fit', urg.text, urg.bg, urg.border)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', urg.dot)} />
                        {urg.label}
                      </span>

                      <div className="relative">
                        {isUpdating ? (
                          <div className="flex items-center gap-1 text-[12px] text-[#8A9A7A]">
                            <Loader2 size={12} className="animate-spin" /> Saving…
                          </div>
                        ) : (
                          <select
                            value={patient.status}
                            onChange={e => updateStatus(patient.id, e.target.value as WaitlistStatus)}
                            className={cn('text-[12px] font-semibold px-2 py-1 rounded-lg border cursor-pointer outline-none transition-colors appearance-none pr-6', sta.text, sta.bg, sta.border)}
                            aria-label={`Status for ${patient.fullName}`}
                          >
                            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[12px] text-[#8A9A7A]">
                        <Clock size={11} />
                        {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>

                      <a
                        href={patient.medicalCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View medical certificate"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9A7A] hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && visible.length > 0 && (
              <div className="px-5 py-3 border-t border-[#F0EDE3] bg-[#FAFAF7] text-[11.5px] text-[#8A9A7A]">
                Showing {visible.length} of {patients.length} patients
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: INCOMING MATCHES */}
      {activeTab === 'matches' && (
        <>
          {matchLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[#8A9A7A] text-[14px]">
              <Loader2 size={16} className="animate-spin" /> Loading incoming matches…
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-300">
                <GitMerge size={28} />
              </div>
              <p className="text-[14px] font-semibold text-[#4A5A3A]">No pending matches</p>
              <p className="text-[12.5px] text-[#8A9A7A]">
                Donors who express interest in your waitlisted patients will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} onReview={() => setReviewMatch(match)} />
              ))}
            </div>
          )}
        </>
      )}

      <RegisterPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchPatients}
      />

      {reviewMatch && (
        <ReviewMatchModal
          match={reviewMatch}
          onClose={() => setReviewMatch(null)}
          onEvaluated={() => { fetchMatches(); fetchPatients(); }}
        />
      )}
    </div>
  );
}

