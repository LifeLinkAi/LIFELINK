'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, CheckCircle2, Loader2, AlertCircle, Calendar, User, ShieldCheck, FileSignature
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { OrganMatch } from './ReviewMatchModal';

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const schema = z.object({
  signatures: z.object({
    donor: z.boolean().refine(v => v === true, 'Donor consent is required'),
    recipient: z.boolean().refine(v => v === true, 'Recipient waiver is required'),
    hospitalRep: z.boolean().refine(v => v === true, 'Hospital Representative signature is required'),
    ethicsCommittee: z.boolean().refine(v => v === true, 'Ethics Committee clearance is required'),
  }),
  surgeryDetails: z.object({
    date: z.string().min(1, 'Surgery date is required'),
    operatingRoom: z.string().min(1, 'Operating room is required'),
    leadSurgeon: z.string().min(1, 'Lead surgeon name is required'),
  }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  match: OrganMatch;
  onClose: () => void;
  onCompleted: () => void;
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

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/80">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

const inputCls = `
  w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md
  outline-none transition-colors placeholder:text-slate-400
  focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
  disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
`.trim();

const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5';

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function LegalConsentModal({ match, onClose, onCompleted }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      signatures: {
        donor: false,
        recipient: false,
        hospitalRep: false,
        ethicsCommittee: false,
      },
      surgeryDetails: {
        date: '',
        operatingRoom: '',
        leadSurgeon: '',
      },
    },
  });

  const sigs = watch('signatures');
  const allSigned = sigs.donor && sigs.recipient && sigs.hospitalRep && sigs.ethicsCommittee;

  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await api.post(`/organ-waitlist/matches/${match.id}/legal-consent`, values);
      setDone(true);
      toast.success('Legal consent granted. Transplant successfully scheduled.');
      onCompleted();
      setTimeout(onClose, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to submit legal consent.');
      setIsSubmitting(false);
    }
  }, [match.id, onCompleted, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Legal & Ethics Clearance
              </h2>
              <p className="text-xs text-slate-500">Final approval for {match.patient?.fullName}</p>
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

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="legal-consent-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-5 flex flex-col gap-6"
          >
            {/* ── Section 1: Digital Signatures ── */}
            <section>
              <SectionHeading icon={<FileSignature size={14} />} title="Mandatory Signatures" />
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('signatures.donor')}
                    className="mt-0.5 w-4 h-4 text-slate-900 border-slate-300 rounded-sm focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Donor Consent Signed</span>
                    <span className="block text-xs text-slate-500">Donor has agreed to proceed</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('signatures.recipient')}
                    className="mt-0.5 w-4 h-4 text-slate-900 border-slate-300 rounded-sm focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Recipient Waiver Signed</span>
                    <span className="block text-xs text-slate-500">Recipient has accepted risks</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('signatures.hospitalRep')}
                    className="mt-0.5 w-4 h-4 text-slate-900 border-slate-300 rounded-sm focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Hospital Rep Signed</span>
                    <span className="block text-xs text-slate-500">Hospital administrative clearance</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('signatures.ethicsCommittee')}
                    className="mt-0.5 w-4 h-4 text-slate-900 border-slate-300 rounded-sm focus:ring-slate-900"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Ethics Committee Cleared</span>
                    <span className="block text-xs text-slate-500">Independent board approval</span>
                  </div>
                </label>
              </div>
              <div className="mt-2">
                <FieldError msg={
                  errors.signatures?.donor?.message || 
                  errors.signatures?.recipient?.message || 
                  errors.signatures?.hospitalRep?.message || 
                  errors.signatures?.ethicsCommittee?.message
                } />
              </div>
            </section>

            {/* ── Section 2: Surgery Scheduling ── */}
            <section className={cn('transition-opacity duration-300', !allSigned ? 'opacity-50 pointer-events-none' : 'opacity-100')}>
              <div className={cn(!allSigned ? 'bg-slate-100/50 border border-slate-200 rounded-lg p-4' : '')}>
                <SectionHeading icon={<Calendar size={14} />} title="Surgery Scheduling Block" />
                
                {!allSigned && (
                  <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-md border border-rose-100 flex items-center gap-2">
                    <AlertCircle size={14} />
                    You must collect all 4 signatures before scheduling the surgery.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="date" className={labelCls}>Surgery Date & Time *</label>
                    <input
                      id="date"
                      type="datetime-local"
                      disabled={!allSigned}
                      {...register('surgeryDetails.date')}
                      className={cn(inputCls, errors.surgeryDetails?.date && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                    />
                    <FieldError msg={errors.surgeryDetails?.date?.message} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="operatingRoom" className={labelCls}>Operating Room *</label>
                    <input
                      id="operatingRoom"
                      placeholder="e.g. OR-4"
                      disabled={!allSigned}
                      {...register('surgeryDetails.operatingRoom')}
                      className={cn(inputCls, errors.surgeryDetails?.operatingRoom && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                    />
                    <FieldError msg={errors.surgeryDetails?.operatingRoom?.message} />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="leadSurgeon" className={labelCls}>Lead Surgeon *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="leadSurgeon"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        disabled={!allSigned}
                        {...register('surgeryDetails.leadSurgeon')}
                        className={cn(inputCls, 'pl-9', errors.surgeryDetails?.leadSurgeon && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                      />
                    </div>
                    <FieldError msg={errors.surgeryDetails?.leadSurgeon?.message} />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200/80 bg-slate-50 flex-shrink-0 rounded-b-xl">
          {isSubmitting ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 size={14} className="animate-spin text-slate-900" />
              <span>Submitting final approval...</span>
            </div>
          ) : done ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 size={14} /> Clearance Granted!
            </div>
          ) : <div />}

          <button
            type="submit"
            form="legal-consent-form"
            disabled={isSubmitting || done || !allSigned}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Schedule Surgery
          </button>
        </div>
      </div>
    </div>
  );
}
