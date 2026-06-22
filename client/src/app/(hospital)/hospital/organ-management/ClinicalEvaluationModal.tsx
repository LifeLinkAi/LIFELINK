'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, Upload, FileText, CheckCircle2, Loader2, AlertCircle, Check, XCircle,
  Stethoscope, ClipboardList, AlertTriangle, FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { OrganMatch } from './ReviewMatchModal';

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const schema = z.object({
  bloodCrossmatch: z.enum(['COMPATIBLE_NEGATIVE', 'INCOMPATIBLE_POSITIVE', 'PENDING'], {
    required_error: 'Select blood crossmatch result',
  }),
  hlaMatchScore: z.coerce.number().min(0).max(6),
  serologyClear: z.boolean(),
  organFunctionStatus: z.enum(['OPTIMAL', 'MARGINAL', 'UNSATISFACTORY'], {
    required_error: 'Select organ function status',
  }),
  notes: z.string().max(2000).default(''),
  labReport: z
    .custom<FileList>(v => v instanceof FileList, 'Please upload a lab report')
    .refine(fl => fl.length > 0, 'Lab report is required')
    .refine(fl => fl[0].size <= MAX_FILE_BYTES, 'File must be ≤ 10 MB')
    .refine(fl => ACCEPTED_TYPES.includes(fl[0].type), 'Only PDF, JPG, or PNG accepted'),
});

type FormValues = z.infer<typeof schema>;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder:    string;
  cloudName: string;
  apiKey:    string;
}

interface Props {
  match:      OrganMatch;
  onClose:    () => void;
  onEvaluated: () => void;
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
`.trim();

const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5';

type UploadStep = 'idle' | 'signing' | 'uploading' | 'saving' | 'done' | 'error';

const STEP_LABELS: Record<UploadStep, string> = {
  idle:      'Submit Evaluation',
  signing:   'Getting credentials…',
  uploading: 'Uploading report…',
  saving:    'Saving evaluation…',
  done:      'Evaluation Completed!',
  error:     'Submission Failed — Retry',
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function ClinicalEvaluationModal({ match, onClose, onEvaluated }: Props) {
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [submitDecision, setSubmitDecision] = useState<'APPROVE_SURGERY' | 'FAIL_CLINICAL_MATCH' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bloodCrossmatch: 'PENDING',
      hlaMatchScore: 0,
      serologyClear: false,
      notes: '',
    },
  });

  // Show filename preview
  const watchedFile = watch('labReport');
  useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      setPreviewName(watchedFile[0].name);
    } else {
      setPreviewName(null);
    }
  }, [watchedFile]);

  // ── SUBMIT HANDLER ──────────────────────────────────────────
  const onSubmit = useCallback(async (values: FormValues) => {
    if (!submitDecision) return;

    try {
      setUploadStep('signing');
      const sigRes = await api.get<{ success: boolean; data: CloudinarySignature }>(
        '/organ-waitlist/upload-signature',
      );
      const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data.data;

      setUploadStep('uploading');
      const file = values.labReport[0];
      const fd = new FormData();
      fd.append('file',      file);
      fd.append('api_key',   apiKey);
      fd.append('timestamp', String(timestamp));
      fd.append('signature', signature);
      fd.append('folder',    folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: fd },
      );
      if (!cloudRes.ok) {
        const err = await cloudRes.json();
        throw new Error(err?.error?.message ?? 'Cloudinary upload failed');
      }
      const { secure_url } = await cloudRes.json() as { secure_url: string };

      setUploadStep('saving');
      await api.post(`/organ-waitlist/matches/${match.id}/evaluation`, {
        bloodCrossmatch: values.bloodCrossmatch,
        hlaMatchScore: values.hlaMatchScore,
        serologyClear: values.serologyClear,
        organFunctionStatus: values.organFunctionStatus,
        notes: values.notes,
        labReportUrl: secure_url,
        decision: submitDecision,
      });

      setUploadStep('done');
      toast.success(
        submitDecision === 'APPROVE_SURGERY'
          ? 'Clinical test passed. Transplant scheduled!'
          : 'Clinical test failed. Match rejected.'
      );
      onEvaluated();
      
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setUploadStep('error');
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Evaluation submission failed.';
      toast.error(msg);
    }
  }, [match.id, submitDecision, onClose, onEvaluated]);

  const isSubmitting = ['signing', 'uploading', 'saving'].includes(uploadStep);
  
  // Real-time validation warning for approval
  const currentBlood = watch('bloodCrossmatch');
  const currentSerology = watch('serologyClear');
  const canApprove = currentBlood === 'COMPATIBLE_NEGATIVE' && currentSerology;

  // ── RENDER ───────────────────────────────────────────────────
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
              <FlaskConical size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Clinical Lab Evaluation
              </h2>
              <p className="text-xs text-slate-500">Record lab results for {match.patient?.fullName}</p>
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
            id="clinical-evaluation-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-5 flex flex-col gap-6"
          >

            {/* ── Section 1: Lab Results ── */}
            <section>
              <SectionHeading icon={<Stethoscope size={14} />} title="Lab Results" />
              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <label htmlFor="bloodCrossmatch" className={labelCls}>Blood Crossmatch *</label>
                  <select
                    id="bloodCrossmatch"
                    {...register('bloodCrossmatch')}
                    className={cn(inputCls, errors.bloodCrossmatch && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPATIBLE_NEGATIVE">Compatible (Negative Crossmatch)</option>
                    <option value="INCOMPATIBLE_POSITIVE">Incompatible (Positive Crossmatch)</option>
                  </select>
                  <FieldError msg={errors.bloodCrossmatch?.message} />
                </div>

                <div>
                  <label htmlFor="hlaMatchScore" className={labelCls}>HLA Match Score (0-6) *</label>
                  <input
                    id="hlaMatchScore"
                    type="number"
                    min={0}
                    max={6}
                    {...register('hlaMatchScore')}
                    className={cn(inputCls, errors.hlaMatchScore && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  />
                  <FieldError msg={errors.hlaMatchScore?.message} />
                </div>

                <div>
                  <label htmlFor="organFunctionStatus" className={labelCls}>Organ Function Status *</label>
                  <select
                    id="organFunctionStatus"
                    {...register('organFunctionStatus')}
                    className={cn(inputCls, errors.organFunctionStatus && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  >
                    <option value="">Select status…</option>
                    <option value="OPTIMAL">Optimal</option>
                    <option value="MARGINAL">Marginal</option>
                    <option value="UNSATISFACTORY">Unsatisfactory</option>
                  </select>
                  <FieldError msg={errors.organFunctionStatus?.message} />
                </div>

                <div className="flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('serologyClear')}
                      className="w-4 h-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-900">Serology Clear</span>
                  </label>
                  <FieldError msg={errors.serologyClear?.message} />
                </div>

              </div>
            </section>

            {/* ── Section 2: Lab Report Upload ── */}
            <section>
              <SectionHeading icon={<FileText size={14} />} title="Lab Report" />

              <Controller
                name="labReport"
                control={control}
                render={({ field: { onChange, ref } }) => (
                  <div>
                    <label className={labelCls}>Upload Official Report * <span className="text-slate-400 font-normal lowercase tracking-normal">(pdf, jpg, png — max 10 mb)</span></label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                        errors.labReport
                          ? 'border-rose-300 bg-rose-50'
                          : previewName
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
                      )}
                    >
                      {previewName ? (
                        <>
                          <CheckCircle2 size={20} className="text-slate-900" />
                          <p className="text-xs font-mono text-slate-900 max-w-xs truncate px-4">{previewName}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Click to replace</p>
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="text-slate-400" />
                          <p className="text-sm text-slate-700 font-medium">Click to upload report</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">PDF, JPG, PNG up to 10 MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      ref={el => {
                        ref(el);
                        (fileInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                      }}
                      onChange={e => onChange(e.target.files)}
                    />
                    <FieldError msg={errors.labReport?.message as string | undefined} />
                  </div>
                )}
              />
            </section>

            {/* ── Section 3: Notes ── */}
            <section>
              <SectionHeading icon={<ClipboardList size={14} />} title="Clinical Notes" />
              <div>
                <label htmlFor="notes" className={labelCls}>Additional Notes</label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  placeholder="Any extra observations or requirements for surgery…"
                  className={cn(
                    inputCls,
                    'resize-none',
                    errors.notes && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400',
                  )}
                />
                <FieldError msg={errors.notes?.message} />
              </div>
            </section>

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200/80 bg-slate-50 flex-shrink-0 rounded-b-xl">

          {isSubmitting && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 size={14} className="animate-spin text-slate-900" />
              <span>{STEP_LABELS[uploadStep]}</span>
            </div>
          )}
          {uploadStep === 'done' && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 size={14} /> Evaluation Saved!
            </div>
          )}
          {!isSubmitting && uploadStep !== 'done' && <div />}

          <div className="flex gap-2 ml-auto">
            <button
              type="submit"
              form="clinical-evaluation-form"
              onClick={() => setSubmitDecision('FAIL_CLINICAL_MATCH')}
              disabled={isSubmitting || uploadStep === 'done'}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium transition-colors disabled:opacity-40 shadow-sm"
            >
              Fail Match
            </button>
            <button
              type="submit"
              form="clinical-evaluation-form"
              onClick={() => setSubmitDecision('APPROVE_SURGERY')}
              disabled={isSubmitting || uploadStep === 'done' || !canApprove}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title={!canApprove ? "Requires Compatible crossmatch and clear serology" : ""}
            >
              Approve for Surgery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
