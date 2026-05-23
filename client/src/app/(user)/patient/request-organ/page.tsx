'use client';
import { useState } from 'react';
import { Heart, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// -- Types ------------------------------------------------
type BloodGroup  = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type Urgency     = 'low' | 'medium' | 'high' | 'critical';
type FormStep    = 'form' | 'confirming' | 'submitted';

interface OrganRequestForm {
  organType: string;
  bloodGroup: BloodGroup | '';
  urgency: Urgency;
  hospital: string;
  medicalCondition: string;
  contactPhone: string;
  hasConsent: boolean;
}

// -- Data -------------------------------------------------
const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ORGAN_TYPES = [
  { key: 'Kidney',   icon: 'Kid', desc: 'Most common transplant'         },
  { key: 'Liver',    icon: 'Liv', desc: 'Partial or full transplant'     },
  { key: 'Heart',    icon: 'Hrt', desc: 'Cardiac transplant'             },
  { key: 'Lung',     icon: 'Lng', desc: 'Single or double lung'          },
  { key: 'Pancreas', icon: 'Pan', desc: 'For diabetes/pancreatic disease'},
  { key: 'Cornea',   icon: 'Eye', desc: 'Restores vision'                },
];

const URGENCY_OPTIONS: { key: Urgency; label: string; desc: string; color: string; bg: string }[] = [
  { key: 'critical', label: 'Critical',  desc: 'Immediate - days to live',       color: '#CC0000', bg: '#FFE5E5' },
  { key: 'high',     label: 'High',      desc: 'Urgent - weeks remaining',       color: '#B86E00', bg: '#FFF3E0' },
  { key: 'medium',   label: 'Medium',    desc: 'Moderate - stable but waiting',  color: '#1A5FAA', bg: '#E3F0FF' },
  { key: 'low',      label: 'Low',       desc: 'Elective - long-term waitlist',  color: '#2B6B0A', bg: '#E8F5E0' },
];

const HOSPITALS = [
  'LifeLink Main Campus',
  'Kozhikode Medical College',
  'Baby Memorial Hospital',
  'MIMS Hospital',
  'Aster MIMS',
];

const WORKFLOW_STEPS = [
  { label: 'Request Submitted',    icon: '1' },
  { label: 'AI Matching',          icon: '2' },
  { label: 'Donor Found',          icon: '3' },
  { label: 'Medical Verification', icon: '4' },
  { label: 'Legal Clearance',      icon: '5' },
  { label: 'Surgery Scheduled',    icon: '6' },
];

// -- Page -------------------------------------------------
export default function RequestOrganPage() {
  const [step, setStep] = useState<FormStep>('form');
  const [form, setForm] = useState<OrganRequestForm>({
    organType: '', bloodGroup: '', urgency: 'high',
    hospital: '', medicalCondition: '', contactPhone: '',
    hasConsent: false,
  });
  const [requestId, setRequestId] = useState('');

  const isValid = form.organType !== '' &&
    form.bloodGroup !== '' &&
    form.hospital !== '' &&
    form.medicalCondition !== '' &&
    form.contactPhone !== '' &&
    form.hasConsent;

  const handleSubmit = () => { if (isValid) setStep('confirming'); };

  const handleConfirm = () => {
    setRequestId(`ORG-${Math.floor(400 + Math.random() * 99)}`);
    setStep('submitted');
  };

  const handleNew = () => {
    setForm({ organType: '', bloodGroup: '', urgency: 'high', hospital: '', medicalCondition: '', contactPhone: '', hasConsent: false });
    setStep('form');
  };

  // -- Submitted -----------------------------------------
  if (step === 'submitted') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E4D8] p-10 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-[#1a2e0a]">Request Submitted</p>
            <p className="text-[13.5px] text-[#6B7A5A] mt-2">
              Your organ request is now in the AI matching queue. You will be notified when a compatible donor is found.
            </p>
          </div>

          {/* Workflow preview */}
          <div className="w-full bg-[#F5F2E8] rounded-xl p-4">
            <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-3 text-left">
              What happens next
            </p>
            <div className="flex flex-col gap-2">
              {WORKFLOW_STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[13px] flex-shrink-0',
                    i === 0 ? 'bg-green-100' : 'bg-white border border-[#E8E4D8]'
                  )}>
                    {i === 0 ? '✓' : s.icon}
                  </div>
                  <span className={cn(
                    'text-[12.5px]',
                    i === 0 ? 'font-semibold text-green-700' :
                    i === 1 ? 'font-semibold text-[#5B21B6]' : 'text-[#6B7A5A]'
                  )}>
                    {s.label}
                    {i === 1 && <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">In Progress</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full bg-[#F5F2E8] rounded-xl p-4 text-left flex flex-col gap-2">
            {[
              { label: 'Request ID', value: requestId },
              { label: 'Organ',      value: form.organType },
              { label: 'Blood Group',value: form.bloodGroup },
              { label: 'Hospital',   value: form.hospital },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-[13px]">
                <span className="text-[#6B7A5A]">{r.label}</span>
                <span className="font-semibold text-[#1a2e0a]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 w-full">
            <a href="/patient/request-status"
              className="flex-1 py-2.5 bg-[#1a2e0a] text-white text-[13px] font-medium rounded-lg text-center hover:bg-[#2B4A18] transition-colors">
              Track Request -&gt;
            </a>
            <button onClick={handleNew}
              className="flex-1 py-2.5 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[13px] font-medium rounded-lg hover:border-[#7AB648] transition-colors">
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Confirm -------------------------------------------
  if (step === 'confirming') {
    const urg = URGENCY_OPTIONS.find(u => u.key === form.urgency)!;
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Confirm Request</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Review your organ request before submitting.</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span className="text-[12.5px] text-amber-700">
              Organ requests undergo medical and legal verification before proceeding to surgery.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Organ Type',  value: `${ORGAN_TYPES.find(o => o.key === form.organType)?.icon} ${form.organType}` },
              { label: 'Blood Group', value: form.bloodGroup },
              { label: 'Hospital',    value: form.hospital },
              { label: 'Contact',     value: form.contactPhone },
            ].map(r => (
              <div key={r.label} className="bg-[#F5F2E8] rounded-lg p-3">
                <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium">{r.label}</p>
                <p className="text-[14px] font-semibold text-[#1a2e0a] mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F2E8] rounded-lg p-3">
            <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium mb-1">Urgency</p>
            <span className="text-[13px] font-semibold px-2.5 py-1 rounded-full inline-block"
              style={{ color: urg.color, background: urg.bg }}>
              {urg.label}
            </span>
          </div>
          <div className="bg-[#F5F2E8] rounded-lg p-3">
            <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium mb-1">Medical Condition</p>
            <p className="text-[13px] text-[#3A4A2A]">{form.medicalCondition}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleConfirm}
              className="flex-1 py-3 bg-[#1a2e0a] hover:bg-[#2B4A18] text-white font-bold text-[14px] rounded-xl transition-colors flex items-center justify-center gap-2">
              <Heart size={16} /> Confirm & Submit
            </button>
            <button onClick={() => setStep('form')}
              className="px-5 py-3 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[13px] font-medium rounded-xl hover:border-red-300 transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Form ----------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Request Organ</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">
          AI-powered matching connects you with compatible donors. Requires medical verification.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-[12.5px] text-amber-700">
          Organ donation involves legal and medical clearance. Your hospital coordinator will
          guide you through the verification process after submission.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-6">

        {/* Organ type */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-3">
            Organ Required <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ORGAN_TYPES.map(o => (
              <button key={o.key}
                onClick={() => setForm(f => ({ ...f, organType: o.key }))}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  form.organType === o.key
                    ? 'border-[#1a2e0a] bg-[#f3f9ea]'
                    : 'border-[#E8E4D8] hover:border-[#7AB648]'
                )}>
                <span className="text-[16px] font-bold text-[#1a2e0a]">{o.icon}</span>
                <span className="text-[12.5px] font-semibold text-[#1a2e0a]">{o.key}</span>
                <span className="text-[10.5px] text-[#8A9A7A] text-center">{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blood group */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Blood Group <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button key={bg}
                onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                className={cn(
                  'py-2.5 rounded-lg border-2 text-[14px] font-bold transition-all',
                  form.bloodGroup === bg
                    ? 'border-[#1a2e0a] bg-[#f3f9ea] text-[#1a2e0a]'
                    : 'border-[#E8E4D8] text-[#3A4A2A] hover:border-[#7AB648]'
                )}>
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Urgency <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {URGENCY_OPTIONS.map(u => (
              <button key={u.key}
                onClick={() => setForm(f => ({ ...f, urgency: u.key }))}
                className={cn(
                  'flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                  form.urgency === u.key
                    ? 'border-2'
                    : 'border-[#E8E4D8] hover:border-gray-300'
                )}
                style={form.urgency === u.key ? { borderColor: u.color, background: u.bg } : {}}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: u.color }} />
                <div>
                  <p className="text-[12.5px] font-semibold"
                    style={{ color: form.urgency === u.key ? u.color : '#1a2e0a' }}>
                    {u.label}
                  </p>
                  <p className="text-[11px] text-[#8A9A7A] mt-0.5">{u.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hospital */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Hospital <span className="text-red-600">*</span>
          </label>
          <select
            value={form.hospital}
            onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
            className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors text-[#3A4A2A]"
          >
            <option value="">Select hospital...</option>
            {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {/* Medical condition */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Medical Condition <span className="text-red-600">*</span>
          </label>
          <textarea rows={3}
            placeholder="Describe your diagnosis and why you need this organ..."
            value={form.medicalCondition}
            onChange={e => setForm(f => ({ ...f, medicalCondition: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors resize-none"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Contact Phone <span className="text-red-600">*</span>
          </label>
          <input type="tel"
            placeholder="+91 98765 43210"
            value={form.contactPhone}
            onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
            className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-[#7AB648] transition-colors"
          />
        </div>

        {/* Medical reports note */}
        <div className="flex items-start gap-2.5 bg-[#F5F2E8] rounded-lg px-4 py-3">
          <FileText size={14} className="text-[#6B7A5A] mt-0.5 flex-shrink-0" />
          <p className="text-[12.5px] text-[#6B7A5A]">
            Medical reports and documents can be uploaded after submission from your request status page.
          </p>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox"
            checked={form.hasConsent}
            onChange={e => setForm(f => ({ ...f, hasConsent: e.target.checked }))}
            className="mt-0.5 w-4 h-4 accent-[#1a2e0a] flex-shrink-0"
          />
          <span className="text-[12.5px] text-[#6B7A5A]">
            I consent to sharing my medical information with matched donors and hospital coordinators
            for the purpose of organ transplant coordination. <span className="text-red-600">*</span>
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            'w-full py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2',
            isValid
              ? 'bg-[#1a2e0a] hover:bg-[#2B4A18] text-white'
              : 'bg-[#E8E4D8] text-[#8A9A7A] cursor-not-allowed'
          )}
        >
          <Heart size={16} />
          {isValid ? 'Review & Submit Request' : 'Fill all required fields'}
        </button>
      </div>
    </div>
  );
}
