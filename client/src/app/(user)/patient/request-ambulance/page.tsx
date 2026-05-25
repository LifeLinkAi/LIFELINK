'use client';
import { useState, useEffect } from 'react';
import { Ambulance, MapPin, Phone, CheckCircle, Clock, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

type Urgency  = 'emergency' | 'urgent' | 'routine';
type FormStep = 'form' | 'confirming' | 'submitted' | 'tracking';

interface AmbulanceForm {
  urgency: Urgency;
  pickupAddress: string;
  destinationHospital: string;
  patientCondition: string;
  contactPhone: string;
  requiresOxygen: boolean;
  requiresStretcher: boolean;
}

const URGENCY_OPTIONS: {
  key: Urgency; label: string; desc: string;
  color: string; bg: string; border: string; eta: string;
}[] = [
  { key: 'emergency', label: '🚨 Emergency',  desc: 'Life-threatening — lights & sirens', color: '#CC0000', bg: '#FFE5E5', border: '#FCA5A5', eta: '4–8 min'   },
  { key: 'urgent',    label: '⚠️ Urgent',     desc: 'Serious but stable condition',       color: '#B86E00', bg: '#FFF3E0', border: '#FCD34D', eta: '10–15 min' },
  { key: 'routine',   label: '🏥 Routine',    desc: 'Scheduled or non-emergency',         color: '#1A5FAA', bg: '#E3F0FF', border: '#93C5FD', eta: '20–30 min' },
];

const HOSPITALS = [
  'LifeLink Main Campus',
  'Kozhikode Medical College',
  'Baby Memorial Hospital',
  'MIMS Hospital',
  'Aster MIMS',
];

const TRACKING_STEPS = [
  { label: 'Request Received',   done: true,  active: false },
  { label: 'Driver Assigned',    done: true,  active: false },
  { label: 'En Route to You',    done: false, active: true  },
  { label: 'Patient Picked Up',  done: false, active: false },
  { label: 'Arrived at Hospital',done: false, active: false },
];

export default function RequestAmbulancePage() {
  const [step, setStep]         = useState<FormStep>('form');
  const [requestId, setRequestId] = useState('');
  const [eta, setEta]           = useState(6);
  const [form, setForm]         = useState<AmbulanceForm>({
    urgency: 'emergency', pickupAddress: '',
    destinationHospital: '', patientCondition: '',
    contactPhone: '', requiresOxygen: false, requiresStretcher: false,
  });

  // Simulate ETA countdown when tracking
  useEffect(() => {
    if (step !== 'tracking') return;
    if (eta <= 0) return;
    const t = setTimeout(() => setEta(e => e - 1), 60000);
    return () => clearTimeout(t);
  }, [step, eta]);

  // Simulate location detection
  useEffect(() => {
    const t = setTimeout(() =>
      setForm(f => ({ ...f, pickupAddress: 'Kozhikode Medical College Rd, Kerala' })), 1200);
    return () => clearTimeout(t);
  }, []);

  const isValid = form.pickupAddress !== '' &&
    form.destinationHospital !== '' &&
    form.contactPhone !== '';

  const handleSubmit  = () => { if (isValid) setStep('confirming'); };
  const handleConfirm = () => {
    setRequestId(`AMB-${Math.floor(100 + Math.random() * 899)}`);
    setStep('tracking');
  };

  const urg = URGENCY_OPTIONS.find(u => u.key === form.urgency)!;

  // ── Tracking state ─────────────────────────────────
  if (step === 'tracking') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Ambulance Dispatched</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Track your ambulance in real time.</p>
        </div>

        {/* ETA card */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[14px] font-bold text-red-700">{requestId} — En Route</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-red-200 bg-red-50 flex flex-col items-center justify-center">
              <span className="text-[32px] font-bold text-red-700">{eta}</span>
              <span className="text-[11px] text-red-500 font-medium">MIN ETA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#6B7A5A] bg-[#F5F2E8] px-4 py-2.5 rounded-lg w-full">
            <MapPin size={13} className="text-red-600 flex-shrink-0" />
            <span>Pickup: {form.pickupAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#6B7A5A] bg-[#F5F2E8] px-4 py-2.5 rounded-lg w-full">
            <Navigation size={13} className="text-blue-600 flex-shrink-0" />
            <span>Destination: {form.destinationHospital}</span>
          </div>
        </div>

        {/* Driver info */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f3f9ea] border border-[#E8E4D8] flex items-center justify-center text-[18px] flex-shrink-0">
            🚑
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold text-[#1a2e0a]">Paramedic: J. Davis</p>
            <p className="text-[12px] text-[#8A9A7A]">Unit AMB-12 · Verified Driver</p>
          </div>
          <a href="tel:+919876543210"
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-[12.5px] font-medium rounded-lg hover:bg-green-700 transition-colors">
            <Phone size={13} /> Call
          </a>
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <p className="text-[12px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-4">
            Trip Progress
          </p>
          <div className="flex flex-col gap-0">
            {TRACKING_STEPS.map((s, i) => (
              <div key={s.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    s.done   ? 'bg-green-100'  :
                    s.active ? 'bg-red-100'    : 'bg-[#F5F2E8]'
                  )}>
                    {s.done
                      ? <CheckCircle size={16} className="text-green-600" />
                      : s.active
                      ? <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                      : <Clock size={14} className="text-[#C0CCBC]" />
                    }
                  </div>
                  {i < TRACKING_STEPS.length - 1 && (
                    <div className={cn(
                      'w-0.5 h-8 my-1',
                      s.done ? 'bg-green-200' : 'bg-[#E8E4D8]'
                    )} />
                  )}
                </div>
                <div className="pb-2 pt-1.5">
                  <p className={cn(
                    'text-[13px] font-medium',
                    s.done   ? 'text-green-700'  :
                    s.active ? 'text-red-700 font-semibold' : 'text-[#8A9A7A]'
                  )}>
                    {s.label}
                    {s.active && (
                      <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep('form')}
          className="w-full py-3 bg-white border border-[#D0CCBC] text-[#CC0000] text-[13px] font-medium rounded-xl hover:border-red-300 transition-colors"
        >
          Cancel Request
        </button>
      </div>
    );
  }

  // ── Confirm state ───────────────────────────────────
  if (step === 'confirming') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Confirm Request</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">Review before dispatching.</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border"
            style={{ background: urg.bg, borderColor: urg.border }}>
            <Ambulance size={16} style={{ color: urg.color }} className="flex-shrink-0" />
            <div>
              <p className="text-[13px] font-bold" style={{ color: urg.color }}>{urg.label}</p>
              <p className="text-[11.5px]" style={{ color: urg.color }}>Estimated arrival: {urg.eta}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Pickup',      value: form.pickupAddress,       icon: <MapPin size={13} className="text-red-500" />    },
              { label: 'Destination', value: form.destinationHospital, icon: <Navigation size={13} className="text-blue-500" /> },
              { label: 'Contact',     value: form.contactPhone,        icon: <Phone size={13} className="text-green-600" />   },
            ].map(r => (
              <div key={r.label} className="flex items-start gap-2.5 bg-[#F5F2E8] rounded-lg p-3">
                <div className="mt-0.5 flex-shrink-0">{r.icon}</div>
                <div>
                  <p className="text-[11px] text-[#8A9A7A] uppercase tracking-wide font-medium">{r.label}</p>
                  <p className="text-[13px] font-semibold text-[#1a2e0a] mt-0.5">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
          {(form.requiresOxygen || form.requiresStretcher) && (
            <div className="flex gap-2 flex-wrap">
              {form.requiresOxygen   && <span className="text-[12px] bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">🫁 Oxygen required</span>}
              {form.requiresStretcher && <span className="text-[12px] bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">🛏 Stretcher required</span>}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] rounded-xl transition-colors flex items-center justify-center gap-2">
              <Ambulance size={16} /> Dispatch Ambulance
            </button>
            <button onClick={() => setStep('form')}
              className="px-5 py-3 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[13px] font-medium rounded-xl transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Request Ambulance</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">
          Nearest available ambulance will be dispatched immediately.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4D8] p-6 flex flex-col gap-6">

        {/* Urgency */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-3">
            Emergency Type <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {URGENCY_OPTIONS.map(u => (
              <button key={u.key}
                onClick={() => setForm(f => ({ ...f, urgency: u.key }))}
                className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={form.urgency === u.key
                  ? { borderColor: u.color, background: u.bg }
                  : { borderColor: '#E8E4D8', background: 'white' }
                }>
                <div className="flex-1">
                  <p className="text-[13.5px] font-bold" style={{ color: form.urgency === u.key ? u.color : '#1a2e0a' }}>
                    {u.label}
                  </p>
                  <p className="text-[11.5px] text-[#8A9A7A] mt-0.5">{u.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-[#8A9A7A]">ETA</p>
                  <p className="text-[13px] font-bold" style={{ color: u.color }}>{u.eta}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  form.urgency === u.key ? 'border-current' : 'border-[#D0CCBC]'
                )} style={{ borderColor: form.urgency === u.key ? u.color : undefined }}>
                  {form.urgency === u.key && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: u.color }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pickup */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Pickup Location <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
            <input type="text"
              value={form.pickupAddress}
              onChange={e => setForm(f => ({ ...f, pickupAddress: e.target.value }))}
              placeholder="Detecting your location..."
              className="w-full h-10 pl-8 pr-4 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors"
            />
          </div>
          <p className="text-[11.5px] text-[#8A9A7A] mt-1.5">📍 Auto-detected · tap to edit</p>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Destination Hospital <span className="text-red-600">*</span>
          </label>
          <select
            value={form.destinationHospital}
            onChange={e => setForm(f => ({ ...f, destinationHospital: e.target.value }))}
            className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors text-[#3A4A2A]"
          >
            <option value="">Select hospital...</option>
            {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Patient Condition <span className="text-[#8A9A7A] font-normal">(optional)</span>
          </label>
          <textarea rows={2}
            placeholder="Brief description of the condition..."
            value={form.patientCondition}
            onChange={e => setForm(f => ({ ...f, patientCondition: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors resize-none"
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
            className="w-full h-10 px-3 text-[13px] bg-white border border-[#E8E4D8] rounded-lg outline-none focus:border-red-400 transition-colors"
          />
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2e0a] mb-2">
            Equipment Needed
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={form.requiresOxygen}
                onChange={e => setForm(f => ({ ...f, requiresOxygen: e.target.checked }))}
                className="w-4 h-4 accent-[#1a2e0a]"
              />
              <span className="text-[13px] text-[#3A4A2A]">🫁 Oxygen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={form.requiresStretcher}
                onChange={e => setForm(f => ({ ...f, requiresStretcher: e.target.checked }))}
                className="w-4 h-4 accent-[#1a2e0a]"
              />
              <span className="text-[13px] text-[#3A4A2A]">🛏 Stretcher</span>
            </label>
          </div>
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
          <Ambulance size={16} />
          {isValid ? 'Request Ambulance' : 'Fill required fields'}
        </button>
      </div>
    </div>
  );
}
