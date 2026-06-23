'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle, Loader2, ClipboardList, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// SCHEMA & TYPES
// ─────────────────────────────────────────────

const URGENCY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;

const schema = z.object({
  urgency: z.enum(URGENCY_LEVELS, { required_error: 'Select urgency level' }),
  medicalHistory: z.string().max(2000).default(''),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  patient: any | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPatientModal({ patient, onClose, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      urgency: 'Medium',
      medicalHistory: '',
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        urgency: patient.urgency || 'Medium',
        medicalHistory: patient.medicalHistory || '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!patient) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/organ-waitlist/${patient.id}/edit`, values);
      toast.success('Patient details updated successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to update patient.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  const inputCls = `
    w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md
    outline-none transition-colors placeholder:text-slate-400
    focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
  `.trim();

  const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 shadow-sm">
              <ClipboardList size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Edit Clinical Details
              </h2>
              <p className="text-xs text-slate-500">{patient.fullName}</p>
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
          <form id="edit-patient-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label htmlFor="urgency" className={labelCls}>Urgency Level *</label>
              <select
                id="urgency"
                {...register('urgency')}
                className={cn(inputCls, errors.urgency && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
              >
                {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.urgency && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                  <AlertCircle size={12} /> {errors.urgency.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="medicalHistory" className={labelCls}>Notes (Medical History)</label>
              <textarea
                id="medicalHistory"
                {...register('medicalHistory')}
                rows={4}
                className={cn(inputCls, 'resize-none', errors.medicalHistory && 'border-rose-400')}
                placeholder="Update patient notes or medical history..."
              />
              {errors.medicalHistory && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                  <AlertCircle size={12} /> {errors.medicalHistory.message}
                </p>
              )}
            </div>

            <div className="rounded-md bg-amber-50 p-3 flex gap-2 border border-amber-200/50 mt-2">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                Updating urgency to <strong>Critical</strong> will prioritize this patient for immediate local and national matching algorithms. Ensure clinical criteria are met before escalating.
              </div>
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
            Cancel
          </button>
          <button
            type="submit"
            form="edit-patient-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
