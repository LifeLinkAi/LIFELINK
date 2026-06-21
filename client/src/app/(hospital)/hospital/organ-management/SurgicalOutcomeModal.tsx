'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, Activity, AlertCircle, Loader2, CheckCircle2,
  Syringe, Clock, Calendar, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { OrganMatch } from './ReviewMatchModal';

// ─────────────────────────────────────────────
// ZOD SCHEMA (Post-Op Form)
// ─────────────────────────────────────────────

const postOpSchema = z.object({
  outcome: z.enum(['SUCCESS', 'FAILED'], {
    required_error: 'Select a surgical outcome',
  }),
  complications: z.string().optional(),
  patientDischargeDate: z.string().optional(),
});

type FormValues = z.infer<typeof postOpSchema>;

interface Props {
  match: OrganMatch;
  onClose: () => void;
  onUpdated: () => void;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-red-600">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

const inputCls = `
  w-full px-3 py-2 text-[13px] bg-white border border-[#D0CCBC] rounded-lg
  outline-none transition-colors placeholder:text-[#C0CCBC]
  focus:border-[#7AB648] focus:ring-1 focus:ring-[#7AB648]/30
`;
const labelCls = 'block text-[12px] font-semibold text-[#4A5A3A] mb-1';

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function SurgicalOutcomeModal({ match, onClose, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(postOpSchema),
    defaultValues: {
      outcome: undefined,
      complications: '',
      patientDischargeDate: '',
    },
  });

  const currentOutcome = watch('outcome');

  const commenceSurgery = async () => {
    try {
      setIsSubmitting(true);
      await api.patch(`/organ-waitlist/matches/${match.id}/surgery-status`, {
        action: 'COMMENCE_SURGERY',
      });
      toast.success('Surgery officially commenced.');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to commence surgery.');
      setIsSubmitting(false);
    }
  };

  const submitPostOp = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/organ-waitlist/matches/${match.id}/surgery-status`, {
        action: 'LOG_OUTCOME',
        outcomeData: {
          outcome: values.outcome,
          complications: values.complications,
          patientDischargeDate: values.patientDischargeDate || undefined,
        },
      });
      setDone(true);
      toast.success(
        values.outcome === 'SUCCESS'
          ? 'Transplant archived successfully.'
          : 'Transplant failed. Patient returned to critical waitlist.'
      );
      onUpdated();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to log outcome.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4D8] bg-[#FAFAF7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <HeartPulse size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1a2e0a]">
                Surgical Pipeline
              </h2>
              <p className="text-[11.5px] text-[#8A9A7A]">
                Patient: {match.patient?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9A7A] hover:bg-[#F0EDE3] transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6">
          {match.status === 'TRANSPLANT_SCHEDULED' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 animate-pulse">
                <Syringe size={32} />
              </div>
              <h3 className="text-[18px] font-bold text-[#1a2e0a] mb-2">Ready for Operation</h3>
              <p className="text-[13px] text-[#6B7A5A] mb-8 max-w-sm">
                Ensure all surgical prep is complete. Clicking commence will timestamp the start of the procedure.
              </p>
              
              <button
                onClick={commenceSurgery}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                COMMENCE SURGERY
              </button>
            </div>
          ) : (
            <form id="post-op-form" onSubmit={handleSubmit(submitPostOp)} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Surgical Outcome *</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <label className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    currentOutcome === 'SUCCESS' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-[#E8E4D8] text-[#6B7A5A] hover:border-green-200'
                  )}>
                    <input type="radio" value="SUCCESS" {...register('outcome')} className="hidden" />
                    <CheckCircle2 size={16} />
                    SUCCESS
                  </label>
                  
                  <label className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    currentOutcome === 'FAILED' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-[#E8E4D8] text-[#6B7A5A] hover:border-red-200'
                  )}>
                    <input type="radio" value="FAILED" {...register('outcome')} className="hidden" />
                    <AlertCircle size={16} />
                    FAILED
                  </label>
                </div>
                <FieldError msg={errors.outcome?.message} />
              </div>

              <div>
                <label htmlFor="complications" className={labelCls}>Complications / Surgical Notes</label>
                <textarea
                  id="complications"
                  rows={3}
                  placeholder="Record any intra-op or post-op complications..."
                  {...register('complications')}
                  className={cn(inputCls, 'resize-none')}
                />
              </div>

              {currentOutcome === 'SUCCESS' && (
                <div>
                  <label htmlFor="patientDischargeDate" className={labelCls}>Expected Discharge Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
                    <input
                      id="patientDischargeDate"
                      type="date"
                      {...register('patientDischargeDate')}
                      className={cn(inputCls, 'pl-9')}
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* ── Footer (Only for Post-Op Form) ── */}
        {match.status === 'SURGERY_IN_PROGRESS' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E4D8] bg-[#FAFAF7]">
            {isSubmitting ? (
              <div className="flex items-center gap-2 text-[12px] text-[#6B7A5A]">
                <Loader2 size={13} className="animate-spin text-blue-600" />
                <span>Archiving record...</span>
              </div>
            ) : done ? (
              <div className="flex items-center gap-2 text-[12px] text-green-700">
                <CheckCircle2 size={13} /> Recorded
              </div>
            ) : <div />}

            <button
              type="submit"
              form="post-op-form"
              disabled={isSubmitting || done}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1a2e0a] hover:bg-[#2B4A18] text-[13px] font-bold text-white transition-all disabled:opacity-60"
            >
              Finalize & Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
