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
  distance?: string;
  clinicalEvaluation?: {
    scheduledTestDate?: string;
    testingFacility?: string;
    donorInstructions?: string;
  };
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
  Critical: { text: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
  High:     { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-400' },
  Medium:   { text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400'  },
  Low:      { text: 'text-emerald-700',  bg: 'bg-emerald-50',  border: 'border-emerald-200',  dot: 'bg-emerald-500'  },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
      <span className="text-sm font-mono text-slate-900">{value || '—'}</span>
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
        className="relative bg-white rounded-xl shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200/80 px-5 pt-4 pb-3 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
              <Heart size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">Match Review</h2>
              <p className="text-xs text-slate-500">Evaluate this donor–patient match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 pt-2 flex flex-col gap-5">
          {/* Urgency banner */}
          {patient && (
            <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium', urgCfg.text, urgCfg.bg, urgCfg.border)}>
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', urgCfg.dot)} />
              {patient.urgency} — {patient.requiredOrgan} transplant required
            </div>
          )}

          {/* Side-by-side: Patient | Donor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* ── Patient Card ── */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <User size={14} className="text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient</p>
              </div>

              {patient ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">
                      {patient.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{patient.fullName}</p>
                      <p className="text-xs text-slate-500">{patient.age}y · {patient.gender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow
                      label="Required Organ"
                      value={<span className="flex items-center gap-1"><Heart size={12} className="text-slate-400" /> {patient.requiredOrgan}</span>}
                    />
                    <InfoRow label="Blood Group" value={<span className="font-bold text-rose-700">{patient.bloodGroup}</span>} />
                    <InfoRow label="Contact" value={patient.contact} />
                  </div>

                  {patient.medicalHistory && (
                    <div className="bg-white rounded-md border border-slate-200 p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Medical History</p>
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{patient.medicalHistory}</p>
                    </div>
                  )}

                  <a
                    href={patient.medicalCertificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors w-full justify-center"
                  >
                    <FileText size={13} className="text-slate-400" />
                    Patient Certificate
                    <ExternalLink size={11} className="text-slate-400" />
                  </a>
                </>
              ) : (
                <p className="text-sm text-slate-500">Patient record not found.</p>
              )}
            </div>

            {/* ── Donor Card ── */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <Heart size={14} className="text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Matched Donor</p>
              </div>

              {donor ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                      {donor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{donor.name}</p>
                      <p className="text-xs text-slate-500">{donor.email ?? 'No email'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Blood Type" value={<span className="font-bold text-rose-700">{donor.bloodType}</span>} />
                    <InfoRow label="Donor Tier" value={donor.tier} />
                    <InfoRow label="Status" value={donor.status} />
                  </div>

                  {donor.organsWillingToDonate?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Willing to Donate</p>
                      <div className="flex flex-wrap gap-1.5">
                        {donor.organsWillingToDonate.map(o => (
                          <span key={o} className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                            <Heart size={10} className="text-slate-400" /> {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {donor.details && (() => {
                    let parsed: { certificateUrl?: string; certificateName?: string } | null = null;
                    try { parsed = JSON.parse(donor.details); } catch { /* not JSON */ }

                    if (parsed?.certificateUrl) {
                      return (
                        <a
                          href={parsed.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors w-full justify-center"
                        >
                          <FileText size={13} className="text-slate-400" />
                          {parsed.certificateName ? `View: ${parsed.certificateName}` : 'Donor Certificate'}
                          <ExternalLink size={11} className="text-slate-400" />
                        </a>
                      );
                    }

                    return (
                      <div className="bg-white rounded-md border border-slate-200 p-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Donor Notes</p>
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{donor.details}</p>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <p className="text-sm text-slate-500">Donor profile not found.</p>
              )}
            </div>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <AlertTriangle size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-700 leading-relaxed">
              Approving this match will schedule the donor for clinical evaluation and update the
              patient&apos;s waitlist status to <strong>Match Found</strong>. Declining will re-open
              this case for another donor.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row mt-2">
            <button
              onClick={() => evaluate('APPROVE_FOR_TESTING')}
              disabled={busy !== null}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all shadow-sm',
                busy
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              )}
            >
              {busy === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {busy === 'approve' ? 'Approving…' : 'Approve for Clinical Evaluation'}
            </button>

            <button
              onClick={() => evaluate('DECLINE')}
              disabled={busy !== null}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all shadow-sm',
                busy
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-700',
              )}
            >
              {busy === 'decline' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              {busy === 'decline' ? 'Declining…' : 'Decline Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

