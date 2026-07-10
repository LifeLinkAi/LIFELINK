'use client';
import { useState, useEffect } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp, Download, Calendar, Droplets, Loader, HeartPulse, Activity, AlertTriangle, Syringe, FileArchive } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type RecordType = 'Blood Request' | 'Organ Request' | 'Diagnosis' | 'Surgery' | 'Lab Report' | 'Prescription' | 'Allergy' | 'Vaccination';

interface BackendRequest {
  _id?: string;
  id?: string;
  type?: string;
  bloodGroup?: string;
  organType?: string;
  units?: number;
  status?: string;
  urgency?: string;
  createdAt?: string;
  facility?: string;
  registeredDate?: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  notes: string;
  documents: { name: string; size: string }[];
  critical: boolean;
}

interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

interface Vaccination {
  name: string;
  date: string;
  nextDue?: string;
}

const ALLERGIES: Allergy[] = [
  { name: 'Penicillin',  severity: 'severe',   reaction: 'Anaphylaxis — carry EpiPen'    },
  { name: 'Sulfa drugs', severity: 'moderate', reaction: 'Rash and hives'                },
  { name: 'Iodine',      severity: 'mild',     reaction: 'Mild skin irritation'           },
];

const VACCINATIONS: Vaccination[] = [
  { name: 'Hepatitis B',  date: 'Jan 2023',  nextDue: 'Jan 2028'      },
  { name: 'Influenza',    date: 'Oct 2023',  nextDue: 'Oct 2024'      },
  { name: 'COVID-19',     date: 'Mar 2022',                           },
  { name: 'Tetanus',      date: 'Jun 2020',  nextDue: 'Jun 2030'      },
];

const TYPE_CONFIG: Record<RecordType, { color: string; bg: string; icon: any; border: string }> = {
  'Blood Request': { color: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-200',   icon: Droplets },
  'Organ Request': { color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-200', icon: HeartPulse },
  Diagnosis:       { color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200', icon: Activity },
  Surgery:         { color: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-sky-200',    icon: Activity },
  'Lab Report':    { color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200',icon: FileText },
  Prescription:    { color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200',icon: FileText },
  Allergy:         { color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  icon: AlertTriangle },
  Vaccination:     { color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   icon: Syringe },
};

const SEVERITY_CONFIG = {
  severe:   { color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   label: 'Severe'   },
  moderate: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Moderate' },
  mild:     { color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200',label: 'Mild'     },
};

function MedicalRecordCard({ record: r }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(r.critical);
  const tc = TYPE_CONFIG[r.type];
  const Icon = tc.icon;

  return (
    <div className={cn(
      'bg-white/60 backdrop-blur-xl rounded-3xl border border-white overflow-hidden transition-all duration-300',
      r.critical ? 'shadow-[0_8px_30px_rgba(225,29,72,0.15)] ring-1 ring-rose-300' : 'shadow-sm hover:shadow-md'
    )}>
      <div
        className="flex cursor-pointer flex-wrap items-center gap-4 px-6 py-5 transition-colors hover:bg-white/40 sm:flex-nowrap"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner", tc.bg, tc.color)}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[15px] font-bold text-slate-800">{r.title}</span>
            {r.critical && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-500/30">
                Critical
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm", tc.color, tc.bg, tc.border)}>
              {r.type}
            </span>
            <span className="text-[12px] font-medium text-slate-500">{r.date} · {r.doctor}</span>
          </div>
        </div>
        <span className="order-4 ml-[64px] max-w-full text-[12px] font-semibold text-slate-500 sm:order-none sm:ml-0 sm:max-w-[160px] sm:truncate">{r.hospital}</span>
        
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center border border-white shadow-sm flex-shrink-0 ml-2">
          {expanded
            ? <ChevronUp size={16} className="text-slate-500" />
            : <ChevronDown size={16} className="text-slate-500" />
          }
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 bg-white/30 border-t border-white/50">
          <div className="bg-white/50 rounded-2xl border border-white p-5 shadow-inner">
            <p className="text-[13px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{r.notes}</p>
          </div>
          
          {r.documents.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">
                Attached Archives
              </p>
              <div className="flex flex-col gap-2">
                {r.documents.map(doc => (
                  <div key={doc.name}
                    className="flex flex-col gap-3 rounded-2xl border border-white bg-white/60 backdrop-blur px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:shadow transition-all group">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <FileArchive size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="min-w-0 truncate text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                        <p className="text-[11px] font-medium text-slate-400">{doc.size}</p>
                      </div>
                    </div>
                    <button className="flex h-9 items-center justify-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl px-4 transition-colors">
                      <Download size={14} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'records' | 'allergies' | 'vaccinations'>('records');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await api.get<{ success: true; data: BackendRequest[] }>('/requests/my-history', { headers });
        
        if (response.data?.success && response.data?.data) {
          const mapped: MedicalRecord[] = response.data.data.map(req => {
            const recordType = req.type === 'Blood' ? 'Blood Request' : 'Organ Request';
            const title = req.type === 'Blood' 
              ? `Blood Request — ${req.bloodGroup} (${req.units} unit${(req.units || 1) > 1 ? 's' : ''})`
              : `Organ Request — ${req.organType}`;
            const createdDate = new Date(req.createdAt || req.registeredDate || Date.now());
            const dateStr = createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return {
              id: req._id || req.id || '',
              type: recordType as RecordType,
              title,
              date: dateStr,
              doctor: 'LifeLink System',
              hospital: req.facility || 'LifeLink',
              notes: req.notes || `Status: ${req.status || 'Pending'} · Urgency: ${req.urgency || 'Normal'}`,
              documents: [],
              critical: req.urgency === 'critical' || req.status === 'CANCELLED',
            };
          });
          setRecords(mapped);
        }
      } catch (err) {
        console.error('Error fetching request history:', err);
        setError('Failed to load your request history. Please try again.');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestHistory();
  }, [user]);

  const TABS = [
    { key: 'records',      label: 'Request History', count: records.length      },
    { key: 'allergies',    label: 'Allergies',       count: ALLERGIES.length    },
    { key: 'vaccinations', label: 'Vaccinations',    count: VACCINATIONS.length },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Ambient Background Blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Medical Archive</h1>
            <p className="text-[15px] font-medium text-slate-500 mt-2">
              Securely access your complete medical history, alerts, and vital logs.
            </p>
          </div>
          <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 text-[14px] font-bold text-white transition-all hover:scale-[1.02] shadow-lg shadow-slate-900/20 sm:w-auto">
            <Plus size={16} /> Add Record
          </button>
        </div>

        {/* Patient summary card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
          
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-[24px] font-extrabold text-white flex-shrink-0 shadow-inner backdrop-blur">
              PT
            </div>
            <div className="flex-1">
              <p className="text-[20px] font-extrabold text-white tracking-tight">{user?.name || 'Patient Profile'}</p>
              <p className="text-[13px] font-medium text-indigo-200 mt-1">MRN: 8829-XJ-4 <span className="opacity-50 mx-2">|</span> 45 yrs <span className="opacity-50 mx-2">|</span> Male</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-shrink-0 sm:items-center">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/10 px-4 py-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Droplets size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Blood</p>
                  <p className="text-[16px] font-extrabold text-white">O−</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/10 px-4 py-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Allergies</p>
                  <p className="text-[16px] font-extrabold text-white">{ALLERGIES.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto rounded-[2rem] bg-white/60 backdrop-blur border border-white p-2 shadow-sm">
          {TABS.map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={cn(
                'min-w-max flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all',
                activeTab === t.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
              )}>
              {t.label}
              <span className={cn(
                'text-[11px] font-extrabold px-2 py-0.5 rounded-full',
                activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Records tab */}
        {activeTab === 'records' && (
          <div className="flex flex-col gap-4">
            {isLoading && (
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-16 flex flex-col items-center gap-4 text-center">
                <Loader size={32} className="animate-spin text-blue-400" />
                <p className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Loading Archives…</p>
              </div>
            )}
            {!isLoading && error && (
              <div className="bg-rose-50/80 backdrop-blur border border-rose-200 rounded-[2rem] p-6 text-[14px] font-bold text-rose-700 shadow-sm flex items-center gap-3">
                <AlertTriangle size={20} /> {error}
              </div>
            )}
            {!isLoading && records.length === 0 && !error && (
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white p-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <FileText size={32} />
                </div>
                <div>
                  <p className="text-[16px] font-extrabold text-slate-800">No Archives Found</p>
                  <p className="text-[13px] font-medium text-slate-500 mt-2 max-w-xs">
                    Your medical history and requests will appear here once recorded.
                  </p>
                </div>
              </div>
            )}
            {!isLoading && records.length > 0 && (
              records.map(r => <MedicalRecordCard key={r.id} record={r} />)
            )}
          </div>
        )}

        {/* Allergies tab */}
        {activeTab === 'allergies' && (
          <div className="flex flex-col gap-4">
            {ALLERGIES.map(a => {
              const sc = SEVERITY_CONFIG[a.severity];
              return (
                <div key={a.name} className="flex flex-col items-start gap-4 rounded-[2rem] border border-white bg-white/60 backdrop-blur-xl px-6 py-5 sm:flex-row sm:items-center sm:px-6 shadow-sm hover:shadow-md transition-all">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner", sc.bg, sc.color)}>
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-slate-800">{a.name}</p>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">{a.reaction}</p>
                  </div>
                  <span className={cn("text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full flex-shrink-0 sm:ml-auto border shadow-sm", sc.color, sc.bg, sc.border)}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Vaccinations tab */}
        {activeTab === 'vaccinations' && (
          <div className="flex flex-col gap-4">
            {VACCINATIONS.map(v => (
              <div key={v.name} className="flex flex-col items-start gap-4 rounded-[2rem] border border-white bg-white/60 backdrop-blur-xl px-6 py-5 sm:flex-row sm:items-center sm:px-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Syringe size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-slate-800">{v.name}</p>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                      <Calendar size={14} className="text-slate-400" /> Administered: {v.date}
                    </span>
                    {v.nextDue && (
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                        Next cycle: {v.nextDue}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 sm:ml-auto shadow-sm flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
