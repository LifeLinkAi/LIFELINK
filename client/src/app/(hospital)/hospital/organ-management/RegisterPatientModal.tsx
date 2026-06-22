'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X, Upload, FileText, CheckCircle2, Loader2, AlertCircle, User,
  Stethoscope, ClipboardList, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const ORGAN_OPTIONS = [
  'Kidney', 'Liver Segment', 'Cornea', 'Heart', 'Lung', 'Pancreas', 'Bone Marrow',
] as const;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const URGENCY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const schema = z.object({
  // Patient Profile
  fullName:  z.string().min(2, 'Full name is required'),
  age:       z.coerce.number({ invalid_type_error: 'Age must be a number' }).min(0).max(120),
  gender:    z.enum(['Male', 'Female', 'Other'], { required_error: 'Select a gender' }),
  contact:   z.string().min(5, 'Contact is required'),

  // Clinical
  requiredOrgan: z.enum(ORGAN_OPTIONS, { required_error: 'Select an organ' }),
  bloodGroup:    z.enum(BLOOD_GROUPS,  { required_error: 'Select a blood group' }),

  // Medical file — validated on the FileList object
  medicalCertificate: z
    .custom<FileList>(v => v instanceof FileList, 'Please upload a file')
    .refine(fl => fl.length > 0,       'Medical certificate is required')
    .refine(fl => fl[0].size <= MAX_FILE_BYTES, 'File must be ≤ 10 MB')
    .refine(fl => ACCEPTED_TYPES.includes(fl[0].type), 'Only PDF, JPG, or PNG accepted'),

  // Medical Summary
  medicalHistory: z.string().max(2000).default(''),
  comorbidities:  z.string().max(1000).default(''),

  // Urgency
  urgency: z.enum(URGENCY_LEVELS, { required_error: 'Select urgency level' }),
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
  open:       boolean;
  onClose:    () => void;
  onCreated:  () => void;  // triggers parent list refresh
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

// ─────────────────────────────────────────────
// UPLOAD STEP INDICATOR
// ─────────────────────────────────────────────

type UploadStep = 'idle' | 'signing' | 'uploading' | 'saving' | 'done' | 'error';

const STEP_LABELS: Record<UploadStep, string> = {
  idle:      'Submit Registration',
  signing:   'Getting credentials…',
  uploading: 'Uploading certificate…',
  saving:    'Saving record…',
  done:      'Registered!',
  error:     'Retry',
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function RegisterPatientModal({ open, onClose, onCreated }: Props) {
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [previewName, setPreviewName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender:    'Male',
      urgency:   'Medium',
      medicalHistory: '',
      comorbidities:  '',
    },
  });

  // Show filename preview
  const watchedFile = watch('medicalCertificate');
  useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      setPreviewName(watchedFile[0].name);
    } else {
      setPreviewName(null);
    }
  }, [watchedFile]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      reset();
      setUploadStep('idle');
      setPreviewName(null);
    }
  }, [open, reset]);

  // ── SUBMIT HANDLER ──────────────────────────────────────────
  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      // Step 1 — Fetch signed upload credentials
      setUploadStep('signing');
      const sigRes = await api.get<{ success: boolean; data: CloudinarySignature }>(
        '/organ-waitlist/upload-signature',
      );
      const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data.data;

      // Step 2 — Direct upload to Cloudinary
      setUploadStep('uploading');
      const file = values.medicalCertificate[0];
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

      // Step 3 — POST complete payload to our API
      setUploadStep('saving');
      await api.post('/organ-waitlist', {
        fullName:              values.fullName,
        age:                   values.age,
        gender:                values.gender,
        contact:               values.contact,
        requiredOrgan:         values.requiredOrgan,
        bloodGroup:            values.bloodGroup,
        urgency:               values.urgency,
        medicalCertificateUrl: secure_url,
        medicalHistory:        values.medicalHistory,
        comorbidities:         values.comorbidities,
      });

      setUploadStep('done');
      toast.success('Patient registered successfully!');
      onCreated();

      // Auto-close after brief success display
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setUploadStep('error');
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      toast.error(msg);
    }
  }, [onClose, onCreated]);

  if (!open) return null;

  const isSubmitting = ['signing', 'uploading', 'saving'].includes(uploadStep);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/80 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <User size={16} />
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                Register Transplant Patient
              </h2>
              <p className="text-xs text-slate-500">Add patient to the organ waitlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="register-patient-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-5 flex flex-col gap-6"
          >

            {/* ── Section 1: Patient Profile ── */}
            <section>
              <SectionHeading icon={<User size={14} />} title="Patient Profile" />
              <div className="grid grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="col-span-2">
                  <label htmlFor="fullName" className={labelCls}>Full Name *</label>
                  <input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="e.g. Ravi Kumar"
                    className={cn(inputCls, errors.fullName && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  />
                  <FieldError msg={errors.fullName?.message} />
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className={labelCls}>Age *</label>
                  <input
                    id="age"
                    type="number"
                    min={0}
                    max={120}
                    {...register('age')}
                    placeholder="35"
                    className={cn(inputCls, errors.age && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  />
                  <FieldError msg={errors.age?.message} />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className={labelCls}>Gender *</label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className={cn(inputCls, errors.gender && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <FieldError msg={errors.gender?.message} />
                </div>

                {/* Contact */}
                <div className="col-span-2">
                  <label htmlFor="contact" className={labelCls}>Contact Number *</label>
                  <input
                    id="contact"
                    {...register('contact')}
                    placeholder="+91 98400 00000"
                    className={cn(inputCls, errors.contact && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  />
                  <FieldError msg={errors.contact?.message} />
                </div>
              </div>
            </section>

            {/* ── Section 2: Clinical Data ── */}
            <section>
              <SectionHeading icon={<Stethoscope size={14} />} title="Clinical Data" />
              <div className="grid grid-cols-2 gap-4">

                {/* Required Organ */}
                <div>
                  <label htmlFor="requiredOrgan" className={labelCls}>Required Organ *</label>
                  <select
                    id="requiredOrgan"
                    {...register('requiredOrgan')}
                    className={cn(inputCls, errors.requiredOrgan && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  >
                    <option value="">Select organ…</option>
                    {ORGAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <FieldError msg={errors.requiredOrgan?.message} />
                </div>

                {/* Blood Group */}
                <div>
                  <label htmlFor="bloodGroup" className={labelCls}>Blood Group *</label>
                  <select
                    id="bloodGroup"
                    {...register('bloodGroup')}
                    className={cn(inputCls, errors.bloodGroup && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400')}
                  >
                    <option value="">Select group…</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <FieldError msg={errors.bloodGroup?.message} />
                </div>
              </div>
            </section>

            {/* ── Section 3: Medical Documentation ── */}
            <section>
              <SectionHeading icon={<FileText size={14} />} title="Medical Documentation" />

              <Controller
                name="medicalCertificate"
                control={control}
                render={({ field: { onChange, ref } }) => (
                  <div>
                    <label className={labelCls}>Medical Certificate * <span className="text-slate-400 font-normal lowercase tracking-normal">(pdf, jpg, png — max 10 mb)</span></label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                        errors.medicalCertificate
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
                          <p className="text-sm text-slate-700 font-medium">Click to upload certificate</p>
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
                    <FieldError msg={errors.medicalCertificate?.message as string | undefined} />
                  </div>
                )}
              />
            </section>

            {/* ── Section 4: Medical Summary ── */}
            <section>
              <SectionHeading icon={<ClipboardList size={14} />} title="Medical Summary" />
              <div className="flex flex-col gap-4">

                <div>
                  <label htmlFor="medicalHistory" className={labelCls}>Medical History</label>
                  <textarea
                    id="medicalHistory"
                    {...register('medicalHistory')}
                    rows={3}
                    placeholder="Summarize the patient's relevant medical history…"
                    className={cn(
                      inputCls,
                      'resize-none',
                      errors.medicalHistory && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400',
                    )}
                  />
                  <FieldError msg={errors.medicalHistory?.message} />
                </div>

                <div>
                  <label htmlFor="comorbidities" className={labelCls}>Comorbidities</label>
                  <textarea
                    id="comorbidities"
                    {...register('comorbidities')}
                    rows={2}
                    placeholder="List any comorbid conditions (e.g. Diabetes Type 2, Hypertension)…"
                    className={cn(
                      inputCls,
                      'resize-none',
                      errors.comorbidities && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400',
                    )}
                  />
                  <FieldError msg={errors.comorbidities?.message} />
                </div>
              </div>
            </section>

            {/* ── Section 5: Urgency ── */}
            <section>
              <SectionHeading icon={<AlertTriangle size={14} />} title="Urgency Level" />
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-4 gap-2">
                    {URGENCY_LEVELS.map(level => {
                      const config = {
                        Critical: { bg: 'bg-rose-50',    border: 'border-rose-300',   text: 'text-rose-700'    },
                        High:     { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
                        Medium:   { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-700'  },
                        Low:      { bg: 'bg-emerald-50',  border: 'border-emerald-300',  text: 'text-emerald-700'  },
                      }[level];
                      const isSelected = field.value === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={cn(
                            'py-2 rounded-md border text-xs font-semibold transition-all',
                            isSelected
                              ? `${config.bg} ${config.border} ${config.text} shadow-sm ring-1 ring-inset ring-${config.border.split('-')[1]}-200`
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                          )}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError msg={errors.urgency?.message} />
            </section>

          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200/80 bg-slate-50 flex-shrink-0 rounded-b-xl">

          {/* Upload progress indicator */}
          {isSubmitting && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 size={14} className="animate-spin text-slate-900" />
              <span>{STEP_LABELS[uploadStep]}</span>
            </div>
          )}
          {uploadStep === 'done' && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 size={14} /> Registered successfully!
            </div>
          )}
          {!isSubmitting && uploadStep !== 'done' && <div />}

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-patient-form"
              disabled={isSubmitting || uploadStep === 'done'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-all shadow-sm',
                uploadStep === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-50',
              )}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {STEP_LABELS[uploadStep]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
