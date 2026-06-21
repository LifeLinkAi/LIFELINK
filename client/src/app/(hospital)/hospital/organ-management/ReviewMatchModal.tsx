'use client';

import { useState } from 'react';
import {
  X, User, Heart, FileText, ExternalLink,
  CheckCircle2, XCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface OrganMatchPatient {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  contact: string;
  requiredOrgan: string;
  bloodGroup: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  medicalCertificateUrl: string;
  medicalHistory: string;
  comorbidities: string;
}

export interface OrganMatchDonor {
  id: string;
  name: string;
  email: string | null;
  bloodType: string;
  organsWillingToDonate: string[];
  status: string;
  tier: string;
  details: string;
}

export interface OrganMatch {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient: OrganMatchPatient | null;
  donor: OrganMatchDonor | null;
}

interface Props {
  match: OrganMatch;
  onClose: () => void;
  onEvaluated: () => void;
}

// ─────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────

const URGENCY_CONFIG = {
  Critical: { text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500'    },
  High:     { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-400' },
  Medium:   { text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400'  },
  Low:      { text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500'  },
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide">{label}</span>
      <span className="text-[13px] font-medium text-[#1a2e0a]">{value || '—'}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────

export default function ReviewMatchModal({ match, onClose, onEvaluated }: Props) {
  const [busy, setBusy] = useState<'approve' | 'decline' | null>(null);

  const evaluate = async (action: 'APPROVE_FOR_TESTING' | 'DECLINE') => {
    const key = action === 'APPROVE_FOR_TESTING' ? 'approve' : 'decline';
    setBusy(key);
    try {
      await api.patch(`/organ-waitlist/matches/${match.id}/evaluate`, { action });
      toast.success(
        action === 'APPROVE_FOR_TESTING'
          ? 'Donor approved for clinical evaluation.'
          : 'Match declined. Request re-opened for another donor.',
      );
      onEvaluated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to evaluate match.');
    } finally {
      setBusy(null);
    }
  };

  const { patient, donor } = match;
  const urgCfg = URGENCY_CONFIG[(patient?.urgency ?? 'Medium') as keyof typeof URGENCY_CONFIG];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F0EDE3] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Heart size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1a2e0a]">Match Review</p>
              <p className="text-[11.5px] text-[#8A9A7A]">Evaluate this donor–patient match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9A7A] hover:bg-[#F5F2E8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Urgency banner */}
          {patient && (
            <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12.5px] font-semibold', urgCfg.text, urgCfg.bg, urgCfg.border)}>
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', urgCfg.dot)} />
              {patient.urgency} — {patient.requiredOrgan} transplant required
            </div>
          )}

          {/* Side-by-side: Patient | Donor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* ── Patient Card ── */}
            <div className="bg-[#FAFAF7] rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#EDE9DF]">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <User size={14} />
                </div>
                <p className="text-[12px] font-bold text-[#1a2e0a] uppercase tracking-wide">Patient</p>
              </div>

              {patient ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center text-[13px] font-bold text-purple-700 flex-shrink-0">
                      {patient.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#1a2e0a]">{patient.fullName}</p>
                      <p className="text-[11.5px] text-[#8A9A7A]">{patient.age}y · {patient.gender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <InfoRow
                      label="Required Organ"
                      value={<span>{ORGAN_ICONS[patient.requiredOrgan] ?? '🫀'} {patient.requiredOrgan}</span>}
                    />
                    <InfoRow label="Blood Group" value={<span className="font-bold text-purple-700">{patient.bloodGroup}</span>} />
                    <InfoRow label="Contact" value={patient.contact} />
                  </div>

                  {patient.medicalHistory && (
                    <div className="bg-white rounded-lg border border-[#E8E4D8] p-3">
                      <p className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">Medical History</p>
                      <p className="text-[12px] text-[#3A4A2A] leading-relaxed line-clamp-3">{patient.medicalHistory}</p>
                    </div>
                  )}

                  <a
                    href={patient.medicalCertificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[12px] font-semibold hover:bg-purple-100 transition-colors w-full justify-center"
                  >
                    <FileText size={13} />
                    View Patient Certificate
                    <ExternalLink size={11} />
                  </a>
                </>
              ) : (
                <p className="text-[12.5px] text-[#8A9A7A]">Patient record not found.</p>
              )}
            </div>

            {/* ── Donor Card ── */}
            <div className="bg-[#FAFAF7] rounded-xl border border-[#E8E4D8] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#EDE9DF]">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                  <Heart size={14} />
                </div>
                <p className="text-[12px] font-bold text-[#1a2e0a] uppercase tracking-wide">Matched Donor</p>
              </div>

              {donor ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-[13px] font-bold text-green-700 flex-shrink-0">
                      {donor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#1a2e0a]">{donor.name}</p>
                      <p className="text-[11.5px] text-[#8A9A7A]">{donor.email ?? 'No email'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <InfoRow label="Blood Type" value={<span className="font-bold text-green-700">{donor.bloodType}</span>} />
                    <InfoRow label="Donor Tier" value={donor.tier} />
                    <InfoRow label="Status" value={donor.status} />
                  </div>

                  {donor.organsWillingToDonate?.length > 0 && (
                    <div>
                      <p className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1.5">Willing to Donate</p>
                      <div className="flex flex-wrap gap-1.5">
                        {donor.organsWillingToDonate.map(o => (
                          <span key={o} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            {ORGAN_ICONS[o] ?? '🫀'} {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {donor.details && (() => {
                    // Try to parse as structured JSON (e.g. { certificateUrl, certificateName })
                    let parsed: { certificateUrl?: string; certificateName?: string } | null = null;
                    try { parsed = JSON.parse(donor.details); } catch { /* not JSON — render as text */ }

                    if (parsed?.certificateUrl) {
                      return (
                        <a
                          href={parsed.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[12px] font-semibold hover:bg-green-100 transition-colors w-full justify-center"
                        >
                          <FileText size={13} />
                          {parsed.certificateName ? `View: ${parsed.certificateName}` : 'View Donor Certificate'}
                          <ExternalLink size={11} />
                        </a>
                      );
                    }

                    return (
                      <div className="bg-white rounded-lg border border-[#E8E4D8] p-3">
                        <p className="text-[10.5px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-1">Donor Notes</p>
                        <p className="text-[12px] text-[#3A4A2A] leading-relaxed line-clamp-3">{donor.details}</p>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <p className="text-[12.5px] text-[#8A9A7A]">Donor profile not found.</p>
              )}
            </div>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-amber-700">
              Approving this match will schedule the donor for clinical evaluation and update the
              patient&apos;s waitlist status to <strong>Match Found</strong>. Declining will re-open
              this case for another donor.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => evaluate('APPROVE_FOR_TESTING')}
              disabled={busy !== null}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13.5px] transition-all',
                busy
                  ? 'bg-[#E8E4D8] text-[#8A9A7A] cursor-not-allowed'
                  : 'bg-[#1a2e0a] hover:bg-[#2B4A18] text-white shadow-sm',
              )}
            >
              {busy === 'approve' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {busy === 'approve' ? 'Approving…' : 'Accept for Clinical Evaluation'}
            </button>

            <button
              onClick={() => evaluate('DECLINE')}
              disabled={busy !== null}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13.5px] border-2 transition-all',
                busy
                  ? 'border-[#E8E4D8] text-[#8A9A7A] cursor-not-allowed'
                  : 'border-red-200 text-red-700 hover:bg-red-50',
              )}
            >
              {busy === 'decline' ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              {busy === 'decline' ? 'Declining…' : 'Decline Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

