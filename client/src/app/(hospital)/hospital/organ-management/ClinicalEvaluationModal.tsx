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
    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-red-600">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#F0EDE3]">
      <span className="text-[#7AB648]">{icon}</span>
      <h3 className="text-[13px] font-semibold text-[#1a2e0a] uppercase tracking-wide">{title}</h3>
    </div>
  );
}

const inputCls = `
  w-full h-10 px-3 text-[13px] bg-white border border-[#D0CCBC] rounded-lg
  outline-none transition-colors placeholder:text-[#C0CCBC]
  focus:border-[#7AB648] focus:ring-1 focus:ring-[#7AB648]/30
`.trim();

const labelCls = 'block text-[12px] font-semibold text-[#4A5A3A] mb-1';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4D8] bg-[#FAFAF7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <FlaskConical size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1a2e0a]">
                Clinical Lab Evaluation
              </h2>
              <p className="text-[11.5px] text-[#8A9A7A]">Record lab results for {match.patient?.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9A7A] hover:bg-[#F0EDE3] hover:text-[#1a2e0a] transition-colors disabled:opacity-40"
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
            className="p-6 flex flex-col gap-7"
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
                    className={cn(inputCls, errors.bloodCrossmatch && 'border-red-400')}
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
                    className={cn(inputCls, errors.hlaMatchScore && 'border-red-400')}
                  />
                  <FieldError msg={errors.hlaMatchScore?.message} />
                </div>

                <div>
                  <label htmlFor="organFunctionStatus" className={labelCls}>Organ Function Status *</label>
                  <select
                    id="organFunctionStatus"
                    {...register('organFunctionStatus')}
                    className={cn(inputCls, errors.organFunctionStatus && 'border-red-400')}
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
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-[13px] font-semibold text-[#1a2e0a]">Serology Clear</span>
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
                    <label className={labelCls}>Upload Official Report * <span className="text-[#8A9A7A] font-normal">(PDF, JPG, PNG — max 10 MB)</span></label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                        errors.labReport
                          ? 'border-red-300 bg-red-50'
                          : previewName
                          ? 'border-[#7AB648] bg-[#F5FAF0]'
                          : 'border-[#D0CCBC] bg-[#FAFAF7] hover:border-[#7AB648] hover:bg-[#F5FAF0]',
                      )}
                    >
                      {previewName ? (
                        <>
                          <CheckCircle2 size={22} className="text-[#7AB648]" />
                          <p className="text-[12.5px] font-medium text-[#2B6B0A] max-w-xs truncate px-4">{previewName}</p>
                          <p className="text-[11px] text-[#8A9A7A]">Click to replace</p>
                        </>
                      ) : (
                        <>
                          <Upload size={22} className="text-[#8A9A7A]" />
                          <p className="text-[12.5px] text-[#4A5A3A] font-medium">Click to upload report</p>
                          <p className="text-[11px] text-[#8A9A7A]">PDF, JPG, PNG up to 10 MB</p>
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
                    'h-auto py-2.5 resize-none',
                    errors.notes && 'border-red-400',
                  )}
                />
                <FieldError msg={errors.notes?.message} />
              </div>
            </section>

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E8E4D8] bg-[#FAFAF7] flex-shrink-0">

          {isSubmitting && (
            <div className="flex items-center gap-2 text-[12px] text-[#6B7A5A]">
              <Loader2 size={13} className="animate-spin text-[#7AB648]" />
              <span>{STEP_LABELS[uploadStep]}</span>
            </div>
          )}
          {uploadStep === 'done' && (
            <div className="flex items-center gap-2 text-[12px] text-green-700">
              <CheckCircle2 size={13} /> Evaluation Saved!
            </div>
          )}
          {!isSubmitting && uploadStep !== 'done' && <div />}

          <div className="flex gap-2 ml-auto">
            <button
              type="submit"
              form="clinical-evaluation-form"
              onClick={() => setSubmitDecision('FAIL_CLINICAL_MATCH')}
              disabled={isSubmitting || uploadStep === 'done'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-200 text-red-700 hover:bg-red-50 text-[13px] font-bold transition-colors disabled:opacity-40"
            >
              Fail Match
            </button>
            <button
              type="submit"
              form="clinical-evaluation-form"
              onClick={() => setSubmitDecision('APPROVE_SURGERY')}
              disabled={isSubmitting || uploadStep === 'done' || !canApprove}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1a2e0a] hover:bg-[#2B4A18] text-[13px] font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
