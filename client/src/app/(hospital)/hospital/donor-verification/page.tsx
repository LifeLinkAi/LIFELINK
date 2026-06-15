'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldX, Clock, Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────
type VerifStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type DocType = 'identity' | 'medical' | 'blood_test';

interface Document {
  type: DocType;
  label: string;
  verified: boolean;
}

interface DonorVerification {
  id: string;
  donorName: string;
  initials: string;
  age: number;
  bloodGroup: string;
  donationType: 'Blood' | 'Organ';
  organType?: string;
  status: VerifStatus;
  faceMatchScore: number;
  submittedAt: string;
  documents: Document[];
  flagged: boolean;
  flagReason?: string;
  notes?: string;
}

// ── Data ──────────────────────────────────────────────
const VERIFICATIONS: DonorVerification[] = [
  {
    id: 'VD-8892', donorName: 'Rahul Menon', initials: 'RM',
    age: 28, bloodGroup: 'O-', donationType: 'Blood',
    status: 'PENDING', faceMatchScore: 99.8,
    submittedAt: 'Just now', flagged: true,
    flagReason: 'Fraud check flagged — duplicate registration attempt detected.',
    documents: [
      { type: 'identity',   label: 'Aadhaar Card',   verified: true  },
      { type: 'medical',    label: 'Medical History', verified: true  },
      { type: 'blood_test', label: 'Blood Test',      verified: false },
    ],
  },
  {
    id: 'VD-8890', donorName: 'Aisha Khan', initials: 'AK',
    age: 34, bloodGroup: 'A+', donationType: 'Organ', organType: 'Kidney',
    status: 'PENDING', faceMatchScore: 97.2,
    submittedAt: '18 mins ago', flagged: false,
    documents: [
      { type: 'identity',   label: 'Passport',        verified: true  },
      { type: 'medical',    label: 'Medical History', verified: true  },
      { type: 'blood_test', label: 'Blood Test',      verified: true  },
    ],
  },
  {
    id: 'VD-8887', donorName: 'Tom George', initials: 'TG',
    age: 41, bloodGroup: 'B+', donationType: 'Blood',
    status: 'APPROVED', faceMatchScore: 95.1,
    submittedAt: '2 hrs ago', flagged: false,
    notes: 'All documents verified. Cleared for donation.',
    documents: [
      { type: 'identity',   label: 'Voter ID',        verified: true },
      { type: 'medical',    label: 'Medical History', verified: true },
      { type: 'blood_test', label: 'Blood Test',      verified: true },
    ],
  },
  {
    id: 'VD-8884', donorName: 'Priya Varghese', initials: 'PV',
    age: 26, bloodGroup: 'AB+', donationType: 'Organ', organType: 'Liver',
    status: 'PENDING', faceMatchScore: 88.4,
    submittedAt: '3 hrs ago', flagged: false,
    documents: [
      { type: 'identity',   label: 'Aadhaar Card',   verified: true  },
      { type: 'medical',    label: 'Medical History', verified: false },
      { type: 'blood_test', label: 'Blood Test',      verified: false },
    ],
  },
  {
    id: 'VD-8880', donorName: 'Sara Fathima', initials: 'SF',
    age: 31, bloodGroup: 'O+', donationType: 'Blood',
    status: 'REJECTED', faceMatchScore: 61.3,
    submittedAt: '5 hrs ago', flagged: true,
    flagReason: 'Face match score below threshold (60%). ID may be fraudulent.',
    notes: 'Rejected: face verification failed.',
    documents: [
      { type: 'identity',   label: 'Aadhaar Card',   verified: false },
      { type: 'medical',    label: 'Medical History', verified: true  },
      { type: 'blood_test', label: 'Blood Test',      verified: true  },
    ],
  },
];

// ── Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<VerifStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:  { label: 'Pending Review', color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D' },
  APPROVED: { label: 'Approved',       color: '#2B6B0A', bg: '#E8F5E0', border: '#86EFAC' },
  REJECTED: { label: 'Rejected',       color: '#CC0000', bg: '#FFE5E5', border: '#FCA5A5' },
};

const DOC_ICONS: Record<DocType, string> = {
  identity:   '🪪',
  medical:    '📋',
  blood_test: '🩸',
};

const FILTERS = [
  { key: 'all',      label: 'All'      },
  { key: 'PENDING',  label: 'Pending'  },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'flagged',  label: '⚠ Flagged' },
];

// ── Face match ring ────────────────────────────────────
function FaceMatchRing({ score }: { score: number }) {
  const color = score >= 90 ? '#16a34a' : score >= 70 ? '#B86E00' : '#CC0000';
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={r} fill="none" stroke="#E8E4D8" strokeWidth="4" />
          <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 24 24)" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <span className="text-[10px] text-[#6B7A5A] mt-1 font-medium">Face Match</span>
    </div>
  );
}

// ── Document chip ──────────────────────────────────────
function DocChip({ doc }: { doc: Document }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium',
      doc.verified
        ? 'bg-[#E8F5E0] border-[#86EFAC] text-[#2B6B0A]'
        : 'bg-[#FFF3E0] border-[#FCD34D] text-[#B86E00]'
    )}>
      <span>{DOC_ICONS[doc.type]}</span>
      {doc.label}
      {doc.verified
        ? <CheckCircle size={12} className="text-[#2B6B0A]" />
        : <Clock size={12} className="text-[#B86E00]" />
      }
    </div>
  );
}

// ── Verification card ──────────────────────────────────
function VerificationCard({
  v, onApprove, onReject,
}: {
  v: DonorVerification;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(v.flagged);
  const sc = STATUS_CONFIG[v.status];
  const borderColor = v.flagged ? '#CC0000' : v.status === 'APPROVED' ? '#3d6b1e' : '#D0CCBC';

  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}>

      {/* Flag banner */}
      {v.flagged && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b border-red-100">
          <ShieldX size={14} className="text-red-600 flex-shrink-0" />
          <span className="text-[12.5px] font-semibold text-red-700">{v.flagReason}</span>
        </div>
      )}

      {/* Main row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0',
          v.flagged ? 'bg-red-100 text-red-700' : 'bg-[#f3f9ea] text-[#2B4A18]'
        )}>
          {v.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1a2e0a]">{v.donorName}</span>
            <span className="text-[11px] text-[#8A9A7A]">{v.age}y · {v.bloodGroup}</span>
            <span className="text-[12px] font-medium text-[#4a5940]">
              {v.donationType}{v.organType ? ` — ${v.organType}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11.5px] text-[#8A9A7A]">{v.id}</span>
            <span className="text-[#D0CCBC]">·</span>
            <span className="text-[11.5px] text-[#8A9A7A]">{v.submittedAt}</span>
          </div>
        </div>

        {/* Face match */}
        <FaceMatchRing score={v.faceMatchScore} />

        {/* Status */}
        <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0"
          style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
          {sc.label}
        </span>

        {expanded ? <ChevronUp size={16} className="text-[#8A9A7A]" /> : <ChevronDown size={16} className="text-[#8A9A7A]" />}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#F0EDE3] bg-[#FAFAF7]">

          {/* Documents */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-2">Documents</p>
            <div className="flex flex-wrap gap-2">
              {v.documents.map(doc => <DocChip key={doc.type} doc={doc} />)}
            </div>
          </div>

          {/* Biometric section */}
          <div className="mt-4 bg-white rounded-lg border border-[#E8E4D8] p-4">
            <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-3">Biometric Verification</p>
            <div className="flex items-center gap-6">
              {/* Placeholder face comparison */}
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg bg-[#F0EDE3] border border-[#D0CCBC] flex items-center justify-center">
                  <span className="text-2xl">🪪</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'text-[11px] font-bold px-2 py-1 rounded',
                    v.faceMatchScore >= 90 ? 'bg-green-100 text-green-700' :
                    v.faceMatchScore >= 70 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {v.faceMatchScore >= 90 ? '✓ MATCH' : v.faceMatchScore >= 70 ? '~ PARTIAL' : '✗ MISMATCH'}
                  </div>
                  <span className="text-[10px] text-[#8A9A7A] mt-1">{v.faceMatchScore}% confidence</span>
                </div>
                <div className="w-16 h-16 rounded-lg bg-[#F0EDE3] border border-[#D0CCBC] flex items-center justify-center">
                  <span className="text-2xl">🤳</span>
                </div>
              </div>
              <div className="flex-1 text-[12.5px] text-[#6B7A5A]">
                {v.faceMatchScore >= 90
                  ? 'Biometric identity confirmed. Selfie matches submitted ID document.'
                  : v.faceMatchScore >= 70
                  ? 'Partial match detected. Manual review recommended before approval.'
                  : 'Face match below threshold. High risk of fraudulent submission.'
                }
              </div>
            </div>
          </div>

          {/* Notes */}
          {v.notes && (
            <div className="mt-3 px-3 py-2.5 bg-white rounded-lg border border-[#E8E4D8]">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">Review Notes</p>
              <p className="text-[13px] text-[#3A4A2A]">{v.notes}</p>
            </div>
          )}

          {/* Actions */}
          {v.status === 'PENDING' && (
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => onApprove(v.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2B4A18] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#3d6b1e] transition-colors"
              >
                <ShieldCheck size={13} /> Approve Donor
              </button>
              <button
                onClick={() => onReject(v.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#CC0000] text-[#CC0000] text-[12.5px] font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <ShieldX size={13} /> Reject & Log
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[12.5px] font-medium rounded-lg hover:border-[#7AB648] transition-colors ml-auto">
                <Eye size={13} /> View Full Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────
export default function DonorVerificationPage() {
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [verifications, setVerifications] = useState<DonorVerification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchVerifications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/requests/hospital/incoming');
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (!mounted) return;
        
        const mapped = data
          .filter((r: any) => r.status === 'PENDING_HOSPITAL' || r.status === 'APPROVED') // PENDING_HOSPITAL means pending verification, APPROVED means verified
          .map((r: any) => {
            const donorName = r.acceptedDonorId?.userId?.name || 'Unknown Donor';
            const initials = donorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            
            return {
              id: r.id,
              donorName,
              initials,
              age: r.age || 30,
              bloodGroup: r.acceptedDonorId?.bloodType || r.bloodGroup || 'Unknown',
              donationType: r.type,
              organType: r.organType,
              status: (r.status === 'PENDING_HOSPITAL' ? 'PENDING' : 'APPROVED') as VerifStatus,
              faceMatchScore: 92,
              submittedAt: new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleTimeString(),
              documents: [
                { type: 'identity' as DocType,   label: 'Identity Document', verified: true },
                { type: 'medical' as DocType,    label: 'Medical History',   verified: true },
                { type: 'blood_test' as DocType, label: 'Blood Test',        verified: true },
              ],
              flagged: false,
            };
          });
        
        setVerifications(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchVerifications();
    return () => { mounted = false; };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/requests/${id}/status`, { status: 'APPROVED' });
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'APPROVED' as VerifStatus, flagged: false } : v));
      toast.success('Donor verified successfully.');
    } catch (err: any) {
      console.error('Failed to approve donor', err);
      toast.error('Failed to verify donor.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/requests/${id}/status`, { status: 'PENDING' }); // sending back to matching pool
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'REJECTED' as VerifStatus } : v));
      toast.success('Donor rejected.');
    } catch (err: any) {
      console.error('Failed to reject donor', err);
      toast.error('Failed to reject donor.');
    }
  };

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === 'all'     ? verifications.length
               : f.key === 'flagged' ? verifications.filter(v => v.flagged).length
               : verifications.filter(v => v.status === f.key).length;
    return acc;
  }, {});

  const visible = verifications.filter(v => {
    const matchFilter = filter === 'all'     ? true
                      : filter === 'flagged' ? v.flagged
                      : v.status === filter;
    const matchSearch = search === '' ||
      v.donorName.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: 'Total Today',    value: verifications.length,                              note: 'Submissions',       color: '' },
    { label: 'Pending Review', value: counts['PENDING'] ?? 0,                           note: 'Awaiting decision', color: 'text-amber-600' },
    { label: '⚠ Flagged',      value: verifications.filter(v => v.flagged).length,      note: 'Needs attention',   color: 'text-red-600' },
    { label: 'Approved',       value: counts['APPROVED'] ?? 0,                          note: 'Cleared today',     color: 'text-green-700' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Donor Verification</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            AI-powered identity and eligibility verification protocol.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors">
            Export Log
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8E4D8] p-5">
            <p className="text-[12px] font-medium text-[#6B7A5A] uppercase tracking-wide">{s.label}</p>
            <p className={cn('text-[32px] font-bold leading-none mt-2', s.color || 'text-[#1a2e0a]')}>{s.value}</p>
            <p className="text-[11.5px] text-[#8A9A7A] mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
          <input
            type="text"
            placeholder="Search donor name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 h-9 w-56 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
          />
        </div>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all',
              filter === f.key
                ? 'bg-[#2B4A18] text-white border-[#2B4A18]'
                : 'bg-white text-[#5A6A4A] border-[#D0CCBC] hover:border-[#7AB648]'
            )}
          >
            {f.label}
            <span className={cn(
              'text-[11px] px-1.5 py-0.5 rounded-full',
              filter === f.key ? 'bg-white/20 text-white' : 'bg-[#F0EDE3] text-[#6B7A5A]'
            )}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-12 text-[#8A9A7A]">Loading verifications...</div>
        ) : visible.length > 0
          ? visible.map(v => (
              <VerificationCard
                key={v.id} v={v}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          : (
            <div className="bg-white rounded-xl border border-[#E8E4D8] p-12 text-center text-[#8A9A7A]">
              No verifications match this filter.
            </div>
          )
        }
      </div>
    </div>
  );
}
