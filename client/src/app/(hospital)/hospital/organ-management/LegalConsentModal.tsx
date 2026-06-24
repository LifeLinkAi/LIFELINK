'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, CheckCircle2, Loader2, AlertCircle, Calendar, User, ShieldCheck, FileSignature, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { OrganMatch } from './ReviewMatchModal';

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const schema = z.object({
  recipientSignatureName: z.string().min(1, 'Recipient signature name is required'),
  hospitalSignatureName: z.string().min(1, 'Hospital Representative name is required'),
  ethicsCommitteeCleared: z.boolean().refine(v => v === true, 'Ethics Committee clearance is required'),
  surgeryDetails: z.object({
    date: z.string().min(1, 'Surgery date is required'),
    operatingRoom: z.string().min(1, 'Operating room is required'),
    leadSurgeon: z.string().min(1, 'Lead surgeon name is required'),
  }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  match: OrganMatch & {
    legalAgreement?: {
      donorSigned: boolean;
      donorSignatureName?: string;
      donorSignatureDate?: string | Date;
      donorSignatureData?: string;
      recipientSigned: boolean;
      recipientSignatureName?: string;
      recipientSignatureDate?: string | Date;
      recipientSignatureData?: string;
      hospitalSigned: boolean;
      hospitalSignatureName?: string;
      hospitalSignedAt?: string | Date;
      ethicsCommitteeCleared: boolean;
      ethicsCommitteeClearedAt?: string | Date;
    };
  };
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

function SignatureDisplay({ name, data }: { name: string; data?: string }) {
  if (!data) return <span className="font-serif italic font-semibold text-slate-700">{name}</span>;
  if (data.startsWith('TEXT:')) {
    return (
      <div className="border border-slate-200 bg-slate-50 px-4 py-2 rounded-xl font-serif italic text-lg text-slate-800 text-center select-none font-medium">
        {data.substring(5)}
      </div>
    );
  }
  return (
    <img
      src={data}
      alt={`${name} Signature`}
      className="h-10 border border-slate-200 bg-white p-1 rounded max-w-[150px]"
    />
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

  // Recipient Signature States
  const [recipientSigMode, setRecipientSigMode] = useState<'type' | 'draw'>('type');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const isDonorSigned = match.legalAgreement?.donorSigned;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipientSignatureName: '',
      hospitalSignatureName: '',
      ethicsCommitteeCleared: false,
      surgeryDetails: {
        date: '',
        operatingRoom: '',
        leadSurgeon: '',
      },
    },
  });

  const isClearedChecked = watch('ethicsCommitteeCleared');
  const recipientSigName = watch('recipientSignatureName');
  const hospitalSigName = watch('hospitalSignatureName');

  const allSigned = isDonorSigned && recipientSigName && hospitalSigName && isClearedChecked;

  useEffect(() => {
    if (isDonorSigned && recipientSigMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isDonorSigned, recipientSigMode]);

  // Canvas Handlers
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      let recipientSignatureData = '';
      if (recipientSigMode === 'type') {
        recipientSignatureData = `TEXT:${values.recipientSignatureName}`;
      } else {
        const canvas = canvasRef.current;
        if (!canvas) {
          toast.error('Recipient signature pad not found.');
          setIsSubmitting(false);
          return;
        }
        // Check if blank
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (canvas.toDataURL() === blank.toDataURL()) {
          toast.error('Please draw the recipient signature first.');
          setIsSubmitting(false);
          return;
        }
        recipientSignatureData = canvas.toDataURL('image/png');
      }

      const payload = {
        recipientSignatureName: values.recipientSignatureName,
        recipientSignatureData,
        hospitalSignatureName: values.hospitalSignatureName,
        ethicsCommitteeCleared: values.ethicsCommitteeCleared,
        surgeryDetails: values.surgeryDetails,
      };

      await api.post(`/organ-waitlist/matches/${match.id}/legal-consent`, payload);
      setDone(true);
      toast.success('Legal consent granted. Transplant successfully scheduled.');
      onCompleted();
      setTimeout(onClose, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to submit legal consent.');
      setIsSubmitting(false);
    }
  }, [match.id, onCompleted, onClose, recipientSigMode]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Tripartite Legal Clearance
              </h2>
              <p className="text-xs text-slate-500">Regulatory validation for patient {match.patient?.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {!isDonorSigned ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 text-rose-600">
                <span className="material-symbols-outlined text-[32px] animate-pulse">warning</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 uppercase">Pending Donor Signature</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed font-semibold">
                The donor has not signed the legal consent deed yet. The donor must review and digitally sign the deed from their portal before the hospital compliance officers can execute Recipient/Representative signatures.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 border border-slate-200 rounded-full hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <form
              id="legal-consent-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="p-5 flex flex-col gap-6"
            >
              {/* Donor Signature Audit Display */}
              <section className="bg-[#fcfdfa] border border-[#e1ead2] rounded-xl p-4">
                <SectionHeading icon={<ShieldCheck size={14} className="text-green-600" />} title="Verified Donor Signature" />
                <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Donor Name: {match.donor?.name || match.legalAgreement?.donorSignatureName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Signed On: {match.legalAgreement?.donorSignatureDate ? new Date(match.legalAgreement.donorSignatureDate).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <SignatureDisplay 
                    name={match.legalAgreement?.donorSignatureName || ''} 
                    data={match.legalAgreement?.donorSignatureData} 
                  />
                </div>
              </section>

              {/* Recipient Signature Input */}
              <section className="space-y-4">
                <SectionHeading icon={<FileSignature size={14} />} title="Recipient (Patient) Waiver & Signature" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="recipientSignatureName" className={labelCls}>Recipient Full Legal Name *</label>
                    <input
                      id="recipientSignatureName"
                      placeholder="e.g. Robert Smith"
                      {...register('recipientSignatureName')}
                      className={cn(inputCls, errors.recipientSignatureName && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                    />
                    <FieldError msg={errors.recipientSignatureName?.message} />
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex border-b border-slate-200 mb-3">
                    <button
                      type="button"
                      onClick={() => setRecipientSigMode('type')}
                      className={cn(
                        "pb-2 px-3 text-xs font-bold border-b-2 transition-all",
                        recipientSigMode === 'type' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'
                      )}
                    >
                      Type Waiver Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientSigMode('draw')}
                      className={cn(
                        "pb-2 px-3 text-xs font-bold border-b-2 transition-all",
                        recipientSigMode === 'draw' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'
                      )}
                    >
                      Draw Waiver Signature
                    </button>
                  </div>

                  {recipientSigMode === 'type' ? (
                    recipientSigName && (
                      <div className="border border-dashed border-slate-200 p-4 rounded-lg bg-white flex flex-col items-center justify-center select-none">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Cursive Preview</span>
                        <div className="font-serif italic text-2xl text-slate-900 font-semibold tracking-wide">
                          {recipientSigName}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <div className="relative border border-slate-200 rounded-lg bg-white overflow-hidden h-32 w-full">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-full cursor-crosshair touch-none"
                        />
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="absolute bottom-2 right-2 bg-white hover:bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[10px] font-bold text-slate-600 transition-colors shadow-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Hospital Representative & Ethics Committee */}
              <section className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="hospitalSignatureName" className={labelCls}>Hospital Representative Name *</label>
                  <input
                    id="hospitalSignatureName"
                    placeholder="e.g. Dr. Arthur Pendelton"
                    {...register('hospitalSignatureName')}
                    className={cn(inputCls, errors.hospitalSignatureName && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  />
                  <FieldError msg={errors.hospitalSignatureName?.message} />
                </div>

                <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer h-[38px]">
                    <input
                      type="checkbox"
                      {...register('ethicsCommitteeCleared')}
                      className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">Ethics Board Cleared</span>
                    </div>
                  </label>
                  <FieldError msg={errors.ethicsCommitteeCleared?.message} />
                </div>
              </section>

              {/* Surgery Scheduling Block */}
              <section className={cn('transition-opacity duration-300', !allSigned ? 'opacity-50 pointer-events-none' : 'opacity-100')}>
                <div className={cn(!allSigned ? 'bg-slate-100/50 border border-slate-200 rounded-lg p-4' : '')}>
                  <SectionHeading icon={<Calendar size={14} />} title="Surgery Scheduling Block" />
                  
                  {!allSigned && (
                    <div className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-md border border-rose-100 flex items-center gap-2">
                      <AlertCircle size={14} />
                      You must collect all signatures and approvals before scheduling surgery.
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
          )}
        </div>

        {/* Footer */}
        {isDonorSigned && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200/80 bg-slate-50 flex-shrink-0">
            {isSubmitting ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 size={14} className="animate-spin text-slate-900" />
                <span>Scheduling procedure and filing signatures...</span>
              </div>
            ) : done ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 size={14} /> Clearances Logged!
              </div>
            ) : <div />}

            <button
              type="submit"
              form="legal-consent-form"
              disabled={isSubmitting || done || !allSigned}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Schedule Surgery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
