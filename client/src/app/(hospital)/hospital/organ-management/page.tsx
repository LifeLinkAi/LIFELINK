'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Heart, Plus, RefreshCw, Search, Filter,
  ExternalLink, Loader2, AlertCircle,
  TrendingUp, Clock, CheckCircle2, Users, GitMerge, FlaskConical, ShieldCheck, MapPin, Activity, HeartPulse,
  Eye, Wind, Dna, Droplet, MoreVertical, Archive, Calendar as CalendarIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import RegisterPatientModal from './RegisterPatientModal';
import ReviewMatchModal, { OrganMatch } from './ReviewMatchModal';
import ClinicalEvaluationModal from './ClinicalEvaluationModal';
import LegalConsentModal from './LegalConsentModal';
import SurgicalOutcomeModal from './SurgicalOutcomeModal';
import EditPatientModal from './EditPatientModal';
import CancelRequestModal from './CancelRequestModal';
import ScheduleLabTestModal from './ScheduleLabTestModal';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type UrgencyLevel   = 'Critical' | 'High' | 'Medium' | 'Low';
type WaitlistStatus = 'Waitlisted' | 'Searching' | 'Match Found' | 'Surgery Scheduled' | 'Completed' | 'Withdrawn' | 'Cancelled';
type ActiveTab      = 'waitlist' | 'matches' | 'clinical' | 'legal' | 'surgical' | 'archive';

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

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; dot: string; text: string }> = {
  Critical: { label: 'CRITICAL', dot: 'bg-rose-500',    text: 'text-rose-700' },
  High:     { label: 'HIGH',     dot: 'bg-orange-500', text: 'text-orange-700' },
  Medium:   { label: 'MEDIUM',   dot: 'bg-amber-500',  text: 'text-amber-700' },
  Low:      { label: 'LOW',      dot: 'bg-emerald-500',  text: 'text-emerald-700' },
};

const STATUS_CONFIG: Record<WaitlistStatus, { label: string; text: string; dot: string; animate: boolean }> = {
  'Waitlisted':        { label: 'WAITLISTED',        text: 'text-slate-700',   dot: 'bg-amber-500',   animate: true },
  'Searching':         { label: 'SEARCHING',         text: 'text-slate-700',   dot: 'bg-amber-500',   animate: true },
  'Match Found':       { label: 'MATCH FOUND',       text: 'text-slate-700',   dot: 'bg-violet-500',  animate: false },
  'Surgery Scheduled': { label: 'SCHEDULED',         text: 'text-slate-700',   dot: 'bg-emerald-500', animate: false },
  'Completed':         { label: 'COMPLETED',         text: 'text-slate-500',   dot: 'bg-slate-300',   animate: false },
  'Withdrawn':         { label: 'WITHDRAWN',         text: 'text-slate-500',   dot: 'bg-slate-300',   animate: false },
  'Cancelled':         { label: 'CANCELLED',         text: 'text-slate-500',   dot: 'bg-slate-300',   animate: false },
};

const getOrganIcon = (organ: string) => {
  switch (organ) {
    case 'Kidney': return <Droplet className="w-4 h-4 text-slate-400" />;
    case 'Liver Segment': return <Activity className="w-4 h-4 text-slate-400" />;
    case 'Cornea': return <Eye className="w-4 h-4 text-slate-400" />;
    case 'Heart': return <Heart className="w-4 h-4 text-slate-400" />;
    case 'Lung': return <Wind className="w-4 h-4 text-slate-400" />;
    case 'Pancreas': return <Activity className="w-4 h-4 text-slate-400" />;
    case 'Bone Marrow': return <Dna className="w-4 h-4 text-slate-400" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

// ─────────────────────────────────────────────
// MATCH CARD (Incoming Matches tab)
// ─────────────────────────────────────────────

function MatchCard({ match, onReview }: { match: OrganMatch; onReview: () => void }) {
  const { patient, donor } = match;
  const urgCfg = URGENCY_CONFIG[(patient?.urgency ?? 'Medium') as UrgencyLevel];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors overflow-hidden">
      <div className={cn('h-1 w-full', urgCfg.dot)} />
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Patient side */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
              {patient ? patient.fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 tracking-tight truncate">{patient?.fullName ?? '—'}</p>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-500 mt-0.5">
                {patient?.age}y • {patient?.gender} • {getOrganIcon(patient?.requiredOrgan ?? '')} <span className="truncate">{patient?.requiredOrgan}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 mt-0.5 uppercase tracking-wider">{patient?.bloodGroup}</p>
            </div>
          </div>

          {/* Donor side */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
              {donor ? donor.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 tracking-tight truncate">{donor?.name ?? 'Unknown Donor'}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">{donor?.email ?? 'No email'}</p>
              <p className="text-[10px] font-bold text-slate-700 mt-0.5 uppercase tracking-wider">{donor?.bloodType} • {donor?.tier}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', urgCfg.dot)} />
              <span className={cn("font-mono text-[10px] font-bold uppercase tracking-wider", urgCfg.text)}>{urgCfg.label}</span>
            </span>

            {match.distance && (
              <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
                <MapPin size={12} className="text-slate-400" />
                {parseFloat(match.distance).toFixed(0)} mi
              </span>
            )}
          </div>

          <button
            onClick={onReview}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-medium transition-colors shadow-sm",
              match.status === 'TRANSPLANT_SCHEDULED' ? 'bg-rose-600 hover:bg-rose-700' :
              match.status === 'SURGERY_IN_PROGRESS' ? 'bg-rose-600 hover:bg-rose-700' :
              'bg-slate-900 hover:bg-slate-800'
            )}
          >
            {match.status === 'TRANSPLANT_SCHEDULED' ? (
              <>
                <HeartPulse size={14} />
                Commence Surgery
              </>
            ) : match.status === 'SURGERY_IN_PROGRESS' ? (
              <>
                <Activity size={14} />
                Log Outcome
              </>
            ) : match.status === 'PENDING_LEGAL_APPROVAL' ? (
              <>
                <ShieldCheck size={14} />
                Legal Clearance
              </>
            ) : match.status === 'CLINICAL_TESTING' ? (
              <>
                <FlaskConical size={14} />
                Clinical Evaluation
              </>
            ) : (
              <>
                <GitMerge size={14} />
                {match.status === 'PENDING_HOSPITAL' ? 'Accept for Clinical Evaluation' : 'Review Match'}
              </>
            )}
          </button>
        </div>

        {/* Lab Schedule Strip */}
        {match.status === 'CLINICAL_TESTING' && match.clinicalEvaluation?.scheduledTestDate && (
          <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between shadow-inner mt-2 -mx-1">
            <div className="flex items-center gap-2">
              <CalendarIcon size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold">Lab Test Scheduled</span>
            </div>
            <div className="text-xs font-mono text-slate-300 text-right">
              <div>{new Date(match.clinicalEvaluation.scheduledTestDate).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{match.clinicalEvaluation.testingFacility}</div>
            </div>
          </div>
        )}

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
  const [clinicalMatches, setClinicalMatches] = useState<OrganMatch[]>([]);
  const [legalMatches, setLegalMatches] = useState<OrganMatch[]>([]);
  const [surgicalMatches, setSurgicalMatches] = useState<OrganMatch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [clinicalLoading, setClinicalLoading] = useState(true);
  const [legalLoading, setLegalLoading] = useState(true);
  const [surgicalLoading, setSurgicalLoading] = useState(true);
  const [archiveMatches, setArchiveMatches] = useState<any[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [reviewMatch,  setReviewMatch]  = useState<OrganMatch | null>(null);
  const [reviewClinicalMatch, setReviewClinicalMatch] = useState<OrganMatch | null>(null);
  const [reviewLegalMatch, setReviewLegalMatch] = useState<OrganMatch | null>(null);
  const [reviewSurgicalMatch, setReviewSurgicalMatch] = useState<OrganMatch | null>(null);
  
  const [scheduleLabMatch, setScheduleLabMatch] = useState<OrganMatch | null>(null);
  const [editPatient, setEditPatient] = useState<WaitlistPatient | null>(null);
  const [cancelPatient, setCancelPatient] = useState<WaitlistPatient | null>(null);
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

  const fetchClinicalMatches = useCallback(async () => {
    setClinicalLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: OrganMatch[] }>('/organ-waitlist/matches/clinical-testing');
      setClinicalMatches(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load clinical matches');
    } finally {
      setClinicalLoading(false);
    }
  }, []);

  const fetchLegalMatches = useCallback(async () => {
    setLegalLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: OrganMatch[] }>('/organ-waitlist/matches/legal-pending');
      setLegalMatches(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load legal matches');
    } finally {
      setLegalLoading(false);
    }
  }, []);

  const fetchSurgicalMatches = useCallback(async () => {
    setSurgicalLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: OrganMatch[] }>('/organ-waitlist/matches/surgery-pipeline');
      setSurgicalMatches(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load surgical matches');
    } finally {
      setSurgicalLoading(false);
    }
  }, []);

  const fetchArchiveMatches = useCallback(async () => {
    setArchiveLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/organ-waitlist/archive');
      setArchiveMatches(res.data.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load archive');
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchMatches();
    fetchClinicalMatches();
    fetchLegalMatches();
    fetchSurgicalMatches();
    fetchArchiveMatches();
  }, [fetchPatients, fetchMatches, fetchClinicalMatches, fetchLegalMatches, fetchSurgicalMatches, fetchArchiveMatches]);

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
    if (activeTab === 'waitlist' && !['Waitlisted', 'Searching', 'Match Found'].includes(p.status)) {
      return false;
    }
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        p.requiredOrgan.toLowerCase().includes(search.toLowerCase());
    const matchOrgan  = filterOrgan === 'all'  || p.requiredOrgan === filterOrgan;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchOrgan && matchStatus;
  });

  const stats = {
    total:     patients.filter(p => p.status === 'Waitlisted' || p.status === 'Searching').length,
    critical:  patients.filter(p => p.urgency === 'Critical' && (p.status === 'Waitlisted' || p.status === 'Searching')).length,
    matched:   patients.filter(p => p.status === 'Match Found').length,
    completed: patients.filter(p => p.status === 'Completed').length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Heart size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organ Management Hub</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage transplant waitlist registrations and review incoming donor matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => { fetchPatients(); fetchMatches(); fetchClinicalMatches(); fetchLegalMatches(); fetchSurgicalMatches(); }}
            disabled={loading && matchLoading && clinicalLoading && legalLoading && surgicalLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={14} className={cn((loading || matchLoading || clinicalLoading || legalLoading || surgicalLoading) && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Register Transplant Patient
          </button>
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="bg-slate-900 text-white rounded-xl shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          <div className="p-4 flex flex-col justify-center">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Total Waitlisted</p>
            <p className="text-3xl font-mono font-bold tracking-tight text-white">{stats.total}</p>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Critical Cases</p>
            <p className="text-3xl font-mono font-bold tracking-tight text-rose-400">{stats.critical}</p>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Matches Found</p>
            <p className="text-3xl font-mono font-bold tracking-tight text-white">{stats.matched}</p>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">Completed</p>
            <p className="text-3xl font-mono font-bold tracking-tight text-white">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 rounded-lg p-1 w-fit border border-slate-200/80">
        <button
          onClick={() => setActiveTab('waitlist')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'waitlist' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <Users size={16} />
          Active Waitlist
          <span className={cn('text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border', activeTab === 'waitlist' ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-transparent text-slate-500 border-transparent')}>
            {patients.filter(p => ['Waitlisted', 'Searching', 'Match Found'].includes(p.status)).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'matches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <GitMerge size={16} />
          Incoming Matches
          {matches.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
              {matches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('clinical')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'clinical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <FlaskConical size={16} />
          Clinical Lab (Testing)
          {clinicalMatches.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
              {clinicalMatches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'legal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <ShieldCheck size={16} />
          Legal & Ethics (Final)
          {legalMatches.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
              {legalMatches.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('surgical')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'surgical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <Activity size={16} />
          Active Surgeries
          {surgicalMatches.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
              {surgicalMatches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all',
            activeTab === 'archive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <Archive size={16} />
          Historical Archive
        </button>
      </div>

      {/* TAB 1: ACTIVE WAITLIST */}
      {activeTab === 'waitlist' && (
        <>
          {/* Filter & Search Deck */}
          <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-fit">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by patient name or organ…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400"
              />
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />
            <select
              value={filterOrgan}
              onChange={e => setFilterOrgan(e.target.value)}
              className="h-8 px-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors min-w-[120px]"
            >
              <option value="all">All Organs</option>
              {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as WaitlistStatus | 'all')}
              className="h-8 px-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors min-w-[130px]"
            >
              <option value="all">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[minmax(0,2fr)_150px_100px_120px_160px_140px_80px] px-4 py-3 bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Patient</span><span>Required Organ</span><span>Blood</span>
                <span>Urgency</span><span>Status</span><span>Registered</span><span>Cert.</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading waitlist…
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Users size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {patients.length === 0 ? 'No patients registered yet' : 'No results match your filters'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {patients.length === 0
                      ? 'Click "Register Transplant Patient" to add the first patient.'
                      : 'Try adjusting the search or filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visible.map(patient => {
                    const urg = URGENCY_CONFIG[patient.urgency] ?? URGENCY_CONFIG.Medium;
                    const sta = STATUS_CONFIG[patient.status]   ?? STATUS_CONFIG.Waitlisted;
                    const isUpdating = updatingId === patient.id;

                    return (
                      <div
                        key={patient.id}
                        className="grid grid-cols-[minmax(0,2fr)_150px_100px_120px_160px_140px_80px] items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 pr-4">
                          <div className="font-semibold text-slate-900 tracking-tight truncate">{patient.fullName}</div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5 truncate">{patient.age}y • {patient.gender} • {patient.contact}</div>
                        </div>

                        <div className="flex items-center gap-2 pr-2">
                          {getOrganIcon(patient.requiredOrgan)}
                          <span className="text-sm font-medium text-slate-700 truncate">{patient.requiredOrgan}</span>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                          {patient.bloodGroup}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={cn('w-2 h-2 rounded-full', urg.dot)} />
                          <span className={cn("font-mono text-[10px] font-bold uppercase tracking-wider", urg.text)}>{urg.label}</span>
                        </div>

                        <div className="relative">
                          {isUpdating ? (
                            <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                              <Loader2 size={12} className="animate-spin" /> Saving…
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                              {patient.status}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(patient.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>

                        <div className="flex items-center gap-1">
                          <a
                            href={patient.medicalCertificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View medical certificate"
                            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                          
                          <div className="relative group/menu">
                            <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                              <MoreVertical size={14} />
                            </button>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 mr-1 w-48 bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-slate-200 py-1 hidden group-hover/menu:block z-10">
                              <button
                                onClick={() => setEditPatient(patient)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                Edit Clinical Details
                              </button>
                              <button
                                onClick={() => setCancelPatient(patient)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Withdraw / Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!loading && visible.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-500">
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
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading incoming matches…
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <GitMerge size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">No pending matches</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Donors who express interest in your waitlisted patients will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} onReview={() => setScheduleLabMatch(match)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: CLINICAL LAB TESTING */}
      {activeTab === 'clinical' && (
        <>
          {clinicalLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading clinical matches…
            </div>
          ) : clinicalMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <FlaskConical size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">No matches in clinical testing</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Approve an incoming match to send it to the clinical lab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {clinicalMatches.map(match => (
                <MatchCard key={match.id} match={match} onReview={() => setReviewClinicalMatch(match)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 4: LEGAL & ETHICS */}
      {activeTab === 'legal' && (
        <>
          {legalLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading legal matches…
            </div>
          ) : legalMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <ShieldCheck size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">No matches pending legal review</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Matches that pass clinical testing will appear here for final compliance clearance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {legalMatches.map(match => (
                <MatchCard key={match.id} match={match} onReview={() => setReviewLegalMatch(match)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 5: SURGICAL PIPELINE */}
      {activeTab === 'surgical' && (
        <>
          {surgicalLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading surgical pipeline…
            </div>
          ) : surgicalMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <Activity size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">No active surgeries scheduled</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Matches that have passed all compliance gates will appear here for operation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {surgicalMatches.map(match => (
                <MatchCard key={match.id} match={match} onReview={() => setReviewSurgicalMatch(match)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 6: HISTORICAL ARCHIVE */}
      {activeTab === 'archive' && (
        <div className="bg-slate-50 rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto opacity-90">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[minmax(0,2fr)_150px_100px_120px_160px_180px] px-4 py-3 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Patient</span><span>Organ</span><span>Blood</span><span>Status</span><span>Date Closed</span><span>Resolution / Donor</span>
            </div>

            {archiveLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading archive…
              </div>
            ) : archiveMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                  <Archive size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Archive Empty</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Cancelled or successfully completed waitlist requests will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/80">
                {archiveMatches.map(record => {
                  const sta = STATUS_CONFIG[record.status as WaitlistStatus] || STATUS_CONFIG.Completed;
                  return (
                    <div
                      key={record.id}
                      className="grid grid-cols-[minmax(0,2fr)_150px_100px_120px_160px_180px] items-center px-4 py-3"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="font-semibold text-slate-600 tracking-tight truncate">{record.fullName}</div>
                      </div>

                      <div className="flex items-center gap-2 pr-2">
                        {getOrganIcon(record.requiredOrgan)}
                        <span className="text-sm font-medium text-slate-500 truncate">{record.requiredOrgan}</span>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/50 border border-slate-200 px-2 py-0.5 rounded-md w-fit">
                        {record.bloodGroup}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                          {record.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                        <Clock size={12} className="text-slate-400" />
                        {new Date(record.updatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>

                      <div className="min-w-0">
                        {record.status === 'Cancelled' ? (
                          <div className="text-xs font-medium text-slate-500 truncate" title={record.cancellationReason}>
                            {record.cancellationReason || 'No reason provided'}
                          </div>
                        ) : record.donor ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-600 truncate">Donor: {record.donor.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{record.donor.bloodType}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <RegisterPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchPatients}
      />

      {scheduleLabMatch && (
        <ScheduleLabTestModal
          match={scheduleLabMatch}
          onClose={() => setScheduleLabMatch(null)}
          onScheduled={() => { fetchMatches(); fetchClinicalMatches(); fetchPatients(); }}
        />
      )}

      {reviewMatch && (
        <ReviewMatchModal
          match={reviewMatch}
          onClose={() => setReviewMatch(null)}
          onEvaluated={() => { fetchMatches(); fetchClinicalMatches(); fetchPatients(); }}
        />
      )}

      {reviewClinicalMatch && (
        <ClinicalEvaluationModal
          match={reviewClinicalMatch}
          onClose={() => setReviewClinicalMatch(null)}
          onEvaluated={() => { fetchClinicalMatches(); fetchLegalMatches(); fetchPatients(); }}
        />
      )}

      {reviewLegalMatch && (
        <LegalConsentModal
          match={reviewLegalMatch}
          onClose={() => setReviewLegalMatch(null)}
          onCompleted={() => { fetchLegalMatches(); fetchSurgicalMatches(); fetchPatients(); }}
        />
      )}

      {reviewSurgicalMatch && (
        <SurgicalOutcomeModal
          match={reviewSurgicalMatch}
          onClose={() => setReviewSurgicalMatch(null)}
          onUpdated={() => { fetchSurgicalMatches(); fetchPatients(); fetchArchiveMatches(); }}
        />
      )}

      <EditPatientModal
        patient={editPatient}
        onClose={() => setEditPatient(null)}
        onUpdated={fetchPatients}
      />

      <CancelRequestModal
        patient={cancelPatient}
        onClose={() => setCancelPatient(null)}
        onUpdated={() => {
          fetchPatients();
          fetchMatches();
          fetchArchiveMatches();
        }}
      />
    </div>
  );
}

