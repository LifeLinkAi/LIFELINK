'use client';
import { useEffect, useMemo, useState } from 'react';
import { Siren, Droplets, Heart, Clock, MapPin, FileHeart, ArrowRight, CheckCircle, Activity, ShieldCheck, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

type RequestType = 'Blood' | 'Organ';
type RequestStatus = 'PENDING' | 'MATCHING' | 'DONOR_FOUND' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BackendRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  registeredDate: string;
  facility: string;
  bloodGroup?: string;
  organType?: string;
  units?: number;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

const ACTIVE_STATUSES: RequestStatus[] = ['PENDING', 'MATCHING', 'DONOR_FOUND', 'IN_PROGRESS'];

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  MATCHING: 'Matching',
  DONOR_FOUND: 'Donor found',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  MATCHING: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
  DONOR_FOUND: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  IN_PROGRESS: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]',
  COMPLETED: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  CANCELLED: 'bg-gray-400',
};

const QUICK_ACTIONS = [
  { label: 'SOS Emergency',     href: '/patient/request-blood',      icon: <Siren     size={24} />, bg: 'from-red-500 to-red-700', text: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', urgent: true  },
  { label: 'Request Blood',     href: '/patient/request-blood',      icon: <Droplets  size={24} />, bg: 'from-rose-400 to-rose-600', text: 'text-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]', urgent: false },
  { label: 'My Requests',       href: '/patient/request-status',     icon: <Clock     size={24} />, bg: 'from-blue-500 to-indigo-600', text: 'text-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]', urgent: false },
  { label: 'Medical History',   href: '/patient/medical-history',    icon: <FileHeart size={24} />, bg: 'from-slate-600 to-slate-800', text: 'text-slate-600', glow: 'shadow-[0_0_20px_rgba(71,85,105,0.2)]', urgent: false },
];

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function buildRequestSummary(req: BackendRequest) {
  const typeLabel = req.type === 'Blood'
    ? `${req.bloodGroup || 'Unknown'} · ${req.units ?? 0} unit${req.units === 1 ? '' : 's'}`
    : `${req.organType || 'Organ'} · ${req.bloodGroup || 'Unknown'}`;

  return `${req.type} req ${req.id.slice(-6).toUpperCase()} — ${typeLabel} · ${STATUS_LABELS[req.status] ?? req.status}`;
}

export default function PatientDashboard() {
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{ success: true; data: BackendRequest[] }>('/requests/my-history');
        setRequests(response.data.data || []);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || err?.message || 'Unable to load dashboard data.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const orderedRequests = useMemo(() => {
    return [...requests].sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime());
  }, [requests]);

  const stats = useMemo(() => {
    const activeCount = requests.filter(r => ACTIVE_STATUSES.includes(r.status)).length;
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
    return [
      { label: 'Active Missions', value: activeCount, icon: Activity, gradient: 'from-rose-500 to-red-600', ring: 'ring-rose-100', text: 'text-rose-600' },
      { label: 'Pending Approvals', value: pendingCount, icon: Clock, gradient: 'from-amber-400 to-orange-500', ring: 'ring-amber-100', text: 'text-amber-600' },
      { label: 'Cleared Requests', value: completedCount, icon: ShieldCheck, gradient: 'from-emerald-400 to-green-600', ring: 'ring-emerald-100', text: 'text-emerald-600' },
      { label: 'Total Submitted', value: requests.length, icon: FileHeart, gradient: 'from-slate-600 to-slate-800', ring: 'ring-slate-100', text: 'text-slate-700' },
    ];
  }, [requests]);

  const recentRequests = useMemo(() => orderedRequests.slice(0, 4), [orderedRequests]);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-rose-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, Patient 👋
            </h1>
            <p className="text-[15px] font-medium text-slate-500 mt-2">
              Here is your secure health overview and active requests.
            </p>
          </div>
          <a href="/patient/request-blood"
            className="group relative flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[14px] font-bold rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]">
            <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <Siren size={18} className="animate-pulse group-hover:animate-none" /> 
            INITIATE SOS
          </a>
        </div>

        {/* Quick Actions (Gamified glass cards) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {QUICK_ACTIONS.map(a => (
            <a key={a.label} href={a.href}
              className={cn(
                'group relative flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white transition-all duration-300 hover:-translate-y-1',
                a.glow
              )}>
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/60 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className={cn(
                "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
                a.urgent ? "bg-gradient-to-br from-red-500 to-red-700 animate-pulse group-hover:animate-none" : "bg-white"
              )}>
                {a.urgent ? (
                  <span className="text-white">{a.icon}</span>
                ) : (
                  <span className={a.text}>{a.icon}</span>
                )}
              </div>
              <span className={cn(
                'relative z-10 text-[13px] font-bold text-center leading-tight tracking-wide',
                a.urgent ? 'text-red-700' : 'text-slate-700 group-hover:text-slate-900'
              )}>
                {a.label}
              </span>
            </a>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br", s.gradient)} />
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl ring-4 ring-offset-2 bg-gradient-to-br text-white shadow-lg", s.gradient, s.ring)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className={cn("text-3xl font-extrabold tracking-tight mt-1", s.text)}>{loading ? '—' : s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          
          {/* Recent Activity */}
          <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Mission Log</h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Recent updates on your active requests</p>
              </div>
              <a href="/patient/request-status" className="flex items-center gap-1 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full">
                View all <ArrowRight size={14} />
              </a>
            </div>

            {loading ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Activity size={32} className="animate-spin text-blue-400" />
                <span className="font-semibold text-sm">Syncing secure data...</span>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50/80 backdrop-blur p-8 text-sm font-medium text-red-700 shadow-inner">
                {error}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center gap-3 text-slate-400">
                <FileHeart size={32} />
                <span className="font-semibold text-sm">No active requests. You're all clear!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {recentRequests.map((req, index) => (
                  <div key={req.id} className="group flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0 w-3">
                      <div className={cn("w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-white transition-all group-hover:scale-125", STATUS_DOT[req.status])} />
                      {index < recentRequests.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200/60 my-2 min-h-[30px]" />
                      )}
                    </div>
                    <div className="flex-1 bg-white/50 hover:bg-white/80 transition-colors p-4 rounded-2xl border border-white/60 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} /> {formatRelativeTime(req.registeredDate)}
                      </p>
                      <p className="text-[14px] font-semibold text-slate-800 leading-relaxed mt-1.5">
                        {buildRequestSummary(req)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Mini Reminders */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-8 shadow-[0_8px_30px_rgba(16,185,129,0.3)] text-white relative overflow-hidden">
              <div className="absolute -right-8 -top-8 text-white/10 rotate-12 pointer-events-none">
                <ShieldCheck size={160} />
              </div>
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                  <CheckCircle size={28} className="text-white drop-shadow-md" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold drop-shadow-sm">
                    {loading ? '—' : requests.filter(r => r.status === 'COMPLETED').length}
                  </p>
                  <p className="text-[14px] font-medium text-emerald-100 mt-1 drop-shadow-sm">Lifesaving procedures completed successfully.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8 flex-1">
              <div className="flex items-center gap-2 mb-6">
                <Thermometer size={18} className="text-orange-500" />
                <h3 className="text-lg font-bold text-slate-800">Health Directives</h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { text: 'Dialysis session today at 14:00', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                  { text: 'Influenza vaccine due Oct 2024', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                  { text: 'Follow-up with Dr. Kumar', icon: FileHeart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                ].map((r, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md", r.bg, r.border)}>
                    <r.icon size={16} className={r.color} />
                    <span className={cn("text-[13px] font-bold", r.color)}>
                      {r.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
