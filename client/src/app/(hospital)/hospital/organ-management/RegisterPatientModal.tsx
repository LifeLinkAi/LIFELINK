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

// ─────────────────────────────────────────────
// UPLOAD STEP INDICATOR
// ─────────────────────────────────────────────

type UploadStep = 'idle' | 'signing' | 'uploading' | 'saving' | 'done' | 'error';

const STEP_LABELS: Record<UploadStep, string> = {
  idle:      'Submit Registration',
  signing:   'Getting upload credentials…',
  uploading: 'Uploading certificate…',
  saving:    'Saving patient record…',
  done:      'Patient Registered!',
  error:     'Submission Failed — Retry',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4D8] bg-[#FAFAF7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <User size={18} />
            </div>
            <div>
              <h2 id="modal-title" className="text-[16px] font-bold text-[#1a2e0a]">
                Register Transplant Patient
              </h2>
              <p className="text-[11.5px] text-[#8A9A7A]">Add patient to the organ waitlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A9A7A] hover:bg-[#F0EDE3] hover:text-[#1a2e0a] transition-colors disabled:opacity-40"
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
            className="p-6 flex flex-col gap-7"
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
                    className={cn(inputCls, errors.fullName && 'border-red-400')}
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
                    className={cn(inputCls, errors.age && 'border-red-400')}
                  />
                  <FieldError msg={errors.age?.message} />
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className={labelCls}>Gender *</label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className={cn(inputCls, errors.gender && 'border-red-400')}
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
                    className={cn(inputCls, errors.contact && 'border-red-400')}
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
                    className={cn(inputCls, errors.requiredOrgan && 'border-red-400')}
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
                    className={cn(inputCls, errors.bloodGroup && 'border-red-400')}
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
                    <label className={labelCls}>Medical Certificate * <span className="text-[#8A9A7A] font-normal">(PDF, JPG, PNG — max 10 MB)</span></label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                        errors.medicalCertificate
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
                          <p className="text-[12.5px] text-[#4A5A3A] font-medium">Click to upload certificate</p>
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
                      'h-auto py-2.5 resize-none',
                      errors.medicalHistory && 'border-red-400',
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
                      'h-auto py-2.5 resize-none',
                      errors.comorbidities && 'border-red-400',
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
                        Critical: { bg: 'bg-red-50',    border: 'border-red-400',   text: 'text-red-700',    activeBg: 'bg-red-100'    },
                        High:     { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', activeBg: 'bg-orange-100' },
                        Medium:   { bg: 'bg-amber-50',  border: 'border-amber-400',  text: 'text-amber-700',  activeBg: 'bg-amber-100'  },
                        Low:      { bg: 'bg-green-50',  border: 'border-green-400',  text: 'text-green-700',  activeBg: 'bg-green-100'  },
                      }[level];
                      const isSelected = field.value === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={cn(
                            'py-2.5 rounded-xl border-2 text-[12.5px] font-semibold transition-all',
                            isSelected
                              ? `${config.activeBg} ${config.border} ${config.text} shadow-sm scale-[1.02]`
                              : 'bg-white border-[#E8E4D8] text-[#6B7A5A] hover:border-[#D0CCBC]',
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
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E8E4D8] bg-[#FAFAF7] flex-shrink-0">

          {/* Upload progress indicator */}
          {isSubmitting && (
            <div className="flex items-center gap-2 text-[12px] text-[#6B7A5A]">
              <Loader2 size={13} className="animate-spin text-[#7AB648]" />
              <span>{STEP_LABELS[uploadStep]}</span>
            </div>
          )}
          {uploadStep === 'done' && (
            <div className="flex items-center gap-2 text-[12px] text-green-700">
              <CheckCircle2 size={13} /> Registered successfully!
            </div>
          )}
          {!isSubmitting && uploadStep !== 'done' && <div />}

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-[#D0CCBC] bg-white text-[13px] font-medium text-[#3A4A2A] hover:border-[#7AB648] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-patient-form"
              disabled={isSubmitting || uploadStep === 'done'}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all',
                uploadStep === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#1a2e0a] hover:bg-[#2B4A18] disabled:opacity-60',
              )}
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              {STEP_LABELS[uploadStep]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
