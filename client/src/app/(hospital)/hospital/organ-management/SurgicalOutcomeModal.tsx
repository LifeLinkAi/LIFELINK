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
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
      <AlertCircle size={12} /> {msg}
    </p>
  );
}

const inputCls = `
  w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md
  outline-none transition-colors placeholder:text-slate-400
  focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
`.trim();
const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <HeartPulse size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Surgical Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Patient: {match.patient?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5">
          {match.status === 'TRANSPLANT_SCHEDULED' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mb-4 animate-pulse">
                <Syringe size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2 tracking-tight">Ready for Operation</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-sm">
                Ensure all surgical prep is complete. Clicking commence will timestamp the start of the procedure.
              </p>
              
              <button
                onClick={commenceSurgery}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                COMMENCE SURGERY
              </button>
            </div>
          ) : (
            <form id="post-op-form" onSubmit={handleSubmit(submitPostOp)} className="flex flex-col gap-6">
              <div>
                <label className={labelCls}>Surgical Outcome *</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <label className={cn(
                    'flex items-center justify-center gap-2 p-2 rounded-md border cursor-pointer transition-all',
                    currentOutcome === 'SUCCESS' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                  )}>
                    <input type="radio" value="SUCCESS" {...register('outcome')} className="hidden" />
                    <CheckCircle2 size={16} />
                    SUCCESS
                  </label>
                  
                  <label className={cn(
                    'flex items-center justify-center gap-2 p-2 rounded-md border cursor-pointer transition-all',
                    currentOutcome === 'FAILED' ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-rose-300'
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
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200/80 bg-slate-50 rounded-b-xl">
            {isSubmitting ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 size={14} className="animate-spin text-slate-900" />
                <span>Archiving record...</span>
              </div>
            ) : done ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 size={14} /> Recorded
              </div>
            ) : <div />}

            <button
              type="submit"
              form="post-op-form"
              disabled={isSubmitting || done}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white shadow-sm transition-all disabled:opacity-50"
            >
              Finalize & Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
