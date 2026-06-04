'use client';
import { useState } from 'react';
import { Droplets, MapPin, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// -- Types ------------------------------------------------
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type Urgency    = 'low' | 'medium' | 'high' | 'critical';
type FormStep   = 'form' | 'confirming' | 'submitted';

interface BloodRequestForm {
  bloodGroup: BloodGroup | '';
  units: number;
  urgency: Urgency;
  hospital: string;
  reason: string;
  contactPhone: string;
}

// -- Data -------------------------------------------------
const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const URGENCY_OPTIONS: { key: Urgency; label: string; desc: string; color: string; bg: string }[] = [
  { key: 'critical', label: 'Critical',  desc: 'Life-threatening, needed now',    color: '#CC0000', bg: '#FFE5E5' },
  { key: 'high',     label: 'High',      desc: 'Required within a few hours',     color: '#B86E00', bg: '#FFF3E0' },
  { key: 'medium',   label: 'Medium',    desc: 'Required within 24 hours',        color: '#1A5FAA', bg: '#E3F0FF' },
  { key: 'low',      label: 'Low',       desc: 'Scheduled or elective procedure', color: '#2B6B0A', bg: '#E8F5E0' },
];

const HOSPITALS = [
  'LifeLink Main Campus',
  'Kozhikode Medical College',
  'Baby Memorial Hospital',
  'MIMS Hospital',
  'Aster MIMS',
];

const RECENT_REQUESTS = [
  { id: 'BR-2041', bloodGroup: 'O-', units: 2, urgency: 'critical' as Urgency, status: 'MATCHING',   date: '2 hrs ago'  },
  { id: 'BR-2028', bloodGroup: 'O-', units: 1, urgency: 'medium'   as Urgency, status: 'COMPLETED',  date: '3 days ago' },
];

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: '#B86E00', bg: '#FFF3E0' },
  MATCHING:    { label: 'Matching...',  color: '#5B21B6', bg: '#EDE8FF' },
  DONOR_FOUND: { label: 'Donor Found', color: '#1A5FAA', bg: '#E3F0FF' },
  IN_PROGRESS: { label: 'In Progress', color: '#0369a1', bg: '#E0F2FE' },
  COMPLETED:   { label: 'Completed',   color: '#2B6B0A', bg: '#E8F5E0' },
  CANCELLED:   { label: 'Cancelled',   color: '#6B7280', bg: '#F3F4F6' },
};

// -- Page -------------------------------------------------
export default function RequestBloodPage() {
  const [step, setStep] = useState<FormStep>('form');
  const [form, setForm] = useState<BloodRequestForm>({
    bloodGroup: '', units: 1, urgency: 'high',
    hospital: '', reason: '', contactPhone: '',
  });
  const [requestId, setRequestId] = useState('');

  const isValid = form.bloodGroup !== '' && form.hospital !== '' && form.contactPhone !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    setStep('confirming');
  };

  const handleConfirm = () => {
    setRequestId(`BR-${Math.floor(2000 + Math.random() * 999)}`);
    setStep('submitted');
  };

  const handleNew = () => {
    setForm({ bloodGroup: '', units: 1, urgency: 'high', hospital: '', reason: '', contactPhone: '' });
    setStep('form');
  };

  // -- Submitted state -----------------------------------
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
              Your blood request has been broadcast. Matching donors will be notified immediately.
            </p>
          </div>
          <div className="w-full bg-[#F5F2E8] rounded-xl p-4 text-left flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7A5A]">Request ID</span>
              <span className="font-semibold text-[#1a2e0a]">{requestId}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7A5A]">Blood Group</span>
              <span className="font-semibold text-[#1a2e0a]">{form.bloodGroup}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7A5A]">Units Needed</span>
              <span className="font-semibold text-[#1a2e0a]">{form.units}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7A5A]">Urgency</span>
              <span className="font-semibold capitalize" style={{ color: URGENCY_OPTIONS.find(u => u.key === form.urgency)?.color }}>
                {form.urgency}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7A5A]">Hospital</span>
              <span className="font-semibold text-[#1a2e0a]">{form.hospital}</span>
            </div>
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

  // -- Confirm state -------------------------------------
  if (step === 'confirming') {
    const urg = URGENCY_OPTIONS.find(u => u.key === form.urgency)!;
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Confirm Request</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Review your blood request before broadcasting.</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-4">
          {form.urgency === 'critical' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
              <span className="text-[12.5px] font-semibold text-red-700">
                Critical request - all nearby compatible donors will be alerted immediately.
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Blood Group',  value: form.bloodGroup },
              { label: 'Units',        value: `${form.units} unit${form.units > 1 ? 's' : ''}` },
              { label: 'Hospital',     value: form.hospital },
              { label: 'Contact',      value: form.contactPhone },
            ].map(r => (
              <div key={r.label} className="bg-[#F5F2E8] rounded-lg p-3">
                <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium">{r.label}</p>
                <p className="text-[14px] font-semibold text-[#1a2e0a] mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F2E8] rounded-lg p-3">
            <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium">Urgency</p>
            <span className="text-[13px] font-semibold px-2.5 py-1 rounded-full inline-block mt-1"
              style={{ color: urg.color, background: urg.bg }}>
              {urg.label} - {urg.desc}
            </span>
          </div>
          {form.reason && (
            <div className="bg-[#F5F2E8] rounded-lg p-3">
              <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium">Reason</p>
              <p className="text-[13px] text-[#3A4A2A] mt-0.5">{form.reason}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] rounded-xl transition-colors flex items-center justify-center gap-2">
              <Droplets size={16} /> Confirm & Broadcast
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

  // -- Form state ----------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Request Blood</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Submit a blood request. Matching donors will be notified instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-5">

          {/* Blood group */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
              Blood Group Required <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button key={bg}
                  onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                  className={cn(
                    'py-2.5 rounded-lg border-2 text-[14px] font-bold transition-all',
                    form.bloodGroup === bg
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-[#E8E4D8] text-[#3A4A2A] hover:border-red-300'
                  )}>
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">Units Needed</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, units: Math.max(1, f.units - 1) }))}
                className="w-9 h-9 rounded-lg border border-[#D0CCBC] text-[18px] font-bold text-[#3A4A2A] hover:border-red-400 transition-colors flex items-center justify-center"
              >-</button>
              <span className="text-[22px] font-bold text-[#1a2e0a] w-8 text-center">{form.units}</span>
              <button
                onClick={() => setForm(f => ({ ...f, units: Math.min(10, f.units + 1) }))}
                className="w-9 h-9 rounded-lg border border-[#D0CCBC] text-[18px] font-bold text-[#3A4A2A] hover:border-red-400 transition-colors flex items-center justify-center"
              >+</button>
              <span className="text-[12.5px] text-[#8A9A7A]">unit{form.units > 1 ? 's' : ''} (max 10)</span>
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
                    <p className="text-[12.5px] font-semibold" style={{ color: form.urgency === u.key ? u.color : '#1a2e0a' }}>
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
              className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors text-[#3A4A2A]"
            >
              <option value="">Select hospital...</option>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
              Contact Phone <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.contactPhone}
              onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
              Reason <span className="text-[#8A9A7A] font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of medical condition..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={cn(
              'w-full py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2',
              isValid
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#E8E4D8] text-[#8A9A7A] cursor-not-allowed'
            )}
          >
            <Droplets size={16} />
            {isValid ? 'Review & Submit Request' : 'Fill required fields'}
          </button>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Compatibility info */}
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-4">
            <p className="text-[12.5px] font-semibold text-[#1a2e0a] mb-3 flex items-center gap-1.5">
              <Search size={13} /> Compatible Donors Nearby
            </p>
            {form.bloodGroup ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[12px] font-bold text-red-700">
                    {form.bloodGroup}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a2e0a]">~12 donors found</p>
                    <p className="text-[11px] text-[#8A9A7A]">within 15 km</p>
                  </div>
                </div>
                <div className="h-px bg-[#E8E4D8]" />
                <p className="text-[11.5px] text-[#6B7A5A]">
                  Donors will be notified in waves of 3 until your request is fulfilled.
                </p>
              </div>
            ) : (
              <p className="text-[12.5px] text-[#8A9A7A]">Select a blood group to see nearby donors.</p>
            )}
          </div>

          {/* Recent requests */}
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-4">
            <p className="text-[12.5px] font-semibold text-[#1a2e0a] mb-3 flex items-center gap-1.5">
              <Clock size={13} /> Recent Requests
            </p>
            <div className="flex flex-col gap-2">
              {RECENT_REQUESTS.map(r => {
                const sc = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#F0EDE3] last:border-0">
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#1a2e0a]">{r.id}</p>
                      <p className="text-[11px] text-[#8A9A7A]">{r.bloodGroup} - {r.units}u - {r.date}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <a href="/patient/request-status"
              className="block text-center text-[12px] font-medium text-red-600 hover:underline mt-2">
              View all requests -&gt;
            </a>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex items-start gap-2.5">
            <MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-[#1a2e0a]">Your Location</p>
              <p className="text-[11.5px] text-[#6B7A5A] mt-0.5">Kozhikode Medical College Rd, Kerala</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
