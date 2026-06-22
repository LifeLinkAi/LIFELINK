'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const REASON_OPTIONS = [
  'Patient Withdrawn',
  'Transferred to another facility',
  'Patient Deceased',
  'Condition Improved',
  'Other',
] as const;

const schema = z.object({
  reason: z.enum(REASON_OPTIONS, { required_error: 'Please select a reason' }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  patient: any | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CancelRequestModal({ patient, onClose, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedReason = watch('reason');

  const onSubmit = async (values: FormValues) => {
    if (!patient) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/organ-waitlist/${patient.id}/cancel`, { reason: values.reason });
      toast.success('Patient request cancelled successfully.');
      onUpdated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to cancel request.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  const inputCls = `
    w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md
    outline-none transition-colors placeholder:text-slate-400
    focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white
  `.trim();

  const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-rose-600 tracking-tight uppercase">
                Cancel Waitlist Request
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1">
          <div className="mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              You are about to cancel the organ waitlist request for <strong className="text-slate-900 font-semibold">{patient.fullName}</strong>.
              This action will sever any active donor matches and move the patient to the historical archive. This action <strong>cannot be undone</strong>.
            </p>
          </div>

          <form id="cancel-request-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label htmlFor="reason" className={labelCls}>Reason for Cancellation *</label>
              <select
                id="reason"
                {...register('reason')}
                className={cn(inputCls, errors.reason && 'border-rose-400')}
              >
                <option value="">Select a reason…</option>
                {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.reason && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                  <AlertCircle size={12} /> {errors.reason.message}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors disabled:opacity-50"
          >
            Keep Patient on Waitlist
          </button>
          <button
            type="submit"
            form="cancel-request-form"
            disabled={isSubmitting || !selectedReason}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Cancelling…
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
