'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, MapPin, Clock, CheckCircle, AlertTriangle, Search, Activity, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
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

const URGENCY_OPTIONS: { key: Urgency; label: string; desc: string; color: string; border: string; bg: string }[] = [
  { key: 'critical', label: 'Critical',  desc: 'Life-threatening, needed now',     color: 'text-rose-600', border: 'border-rose-400', bg: 'bg-rose-50/80' },
  { key: 'high',     label: 'High',      desc: 'Required within a few hours',      color: 'text-orange-600', border: 'border-orange-400', bg: 'bg-orange-50/80' },
  { key: 'medium',   label: 'Medium',    desc: 'Required within 24 hours',         color: 'text-blue-600', border: 'border-blue-400', bg: 'bg-blue-50/80' },
  { key: 'low',      label: 'Low',       desc: 'Scheduled or elective procedure', color: 'text-emerald-600', border: 'border-emerald-400', bg: 'bg-emerald-50/80' },
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
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLocLoading, setIsLocLoading] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [hospitalsList, setHospitalsList] = useState<{id: string, name: string}[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [hospRes, reqRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/requests/my-history')
        ]);
        if (!mounted) return;
        setHospitalsList(hospRes.data || []);
        if (reqRes.data?.data) {
          setRecentRequests(reqRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const isValid = form.bloodGroup !== '' && form.hospital !== '' && form.contactPhone !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    setStep('confirming');
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const requestBody = {
      patientName: user?.name || 'Patient',
      facility: hospitalsList.find(h => h.id === form.hospital)?.name || form.hospital,
      hospitalId: form.hospital,
      age: typeof age === 'number' ? age : undefined,
      gender: gender || undefined,
      organType: '',
      bloodGroup: form.bloodGroup,
      units: form.units,
      urgency: form.urgency,
      facilityType: 'Hospital',
      notes: form.reason || '',
      contactPhone: form.contactPhone,
      location: coordinates ? { type: 'Point', coordinates } : undefined,
      type: 'Blood',
    };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.post('/requests/patient', requestBody, { headers });

      if (response.status === 201 && response.data?.success && response.data?.data) {
        toast.success('Blood request submitted successfully.');
        const targetId = response.data.data.id || response.data.data._id;
        setRequestId(targetId);
        router.push(`/patient/select-donors?requestId=${targetId}`);
      } else {
        throw new Error('Unexpected response configuration from server.');
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to submit blood request. Please try again.';
      toast.error(errorMessage);
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setForm({ bloodGroup: '', units: 1, urgency: 'high', hospital: '', reason: '', contactPhone: '' });
    setStep('form');
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setCoordinates([lng, lat]);
        toast.success('Location captured.');
        setIsLocLoading(false);
      },
      err => {
        setIsLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow location access.');
        } else {
          toast.error('Failed to get location: ' + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // -- Submitted state -----------------------------------
  if (step === 'submitted') {
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-12 flex flex-col items-center gap-6 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle size={48} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Request Dispatched</p>
              <p className="text-[15px] text-slate-500 font-medium mt-2">
                Your request has been broadcast securely. Matching donors are being alerted immediately.
              </p>
            </div>
            <div className="w-full bg-white/50 backdrop-blur border border-white rounded-3xl p-6 text-left flex flex-col gap-4 shadow-inner">
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Request ID</span>
                <span className="font-bold text-slate-800">{requestId}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Blood Group</span>
                <span className="font-bold text-rose-600">{form.bloodGroup}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Units Needed</span>
                <span className="font-bold text-slate-800">{form.units}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Urgency</span>
                <span className="font-bold capitalize text-slate-800">{form.urgency}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Hospital</span>
                <span className="font-bold text-slate-800">{hospitalsList.find(h => h.id === form.hospital)?.name || form.hospital}</span>
              </div>
            </div>
            <div className="flex gap-4 w-full mt-4">
              <a href="/patient/request-status"
                className="flex-1 py-4 bg-slate-900 text-white text-[14px] font-bold rounded-2xl text-center hover:bg-slate-800 transition-colors shadow-lg">
                Track Live Status
              </a>
              <button onClick={handleNew}
                className="flex-1 py-4 bg-white/60 backdrop-blur border border-white text-slate-700 text-[14px] font-bold rounded-2xl hover:bg-white transition-colors shadow-sm">
                New Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- Confirm state -------------------------------------
  if (step === 'confirming') {
    const urg = URGENCY_OPTIONS.find(u => u.key === form.urgency)!;
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-400/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Confirm Dispatch</h1>
            <p className="text-[15px] font-medium text-slate-500 mt-2">Verify the operational details before broadcasting.</p>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6">
            {form.urgency === 'critical' && (
              <div className="flex items-center gap-3 bg-rose-50/80 backdrop-blur border border-rose-200 rounded-2xl px-6 py-4 shadow-inner">
                <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 animate-pulse" />
                <span className="text-[14px] font-bold text-rose-700 leading-tight">
                  CRITICAL REQUEST — Priority dispatch protocols will engage. All nearby compatible donors will be alerted immediately.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Target Blood Group', value: form.bloodGroup },
                { label: 'Payload',            value: `${form.units} unit${form.units > 1 ? 's' : ''}` },
                { label: 'Destination',        value: hospitalsList.find(h => h.id === form.hospital)?.name || form.hospital },
                { label: 'Emergency Contact',  value: form.contactPhone },
              ].map(r => (
                <div key={r.label} className="bg-white/50 backdrop-blur border border-white rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{r.label}</p>
                  <p className="text-[15px] font-bold text-slate-800 break-words">{r.value || '—'}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/50 backdrop-blur border border-white rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Medical Brief (Optional)</p>
              <p className="text-[14px] font-medium text-slate-700 whitespace-pre-wrap">{form.reason || 'No additional brief provided.'}</p>
            </div>

            <div className="flex gap-4 mt-2">
              <button onClick={() => setStep('form')}
                className="py-4 px-8 rounded-2xl bg-white/60 backdrop-blur border border-white text-[14px] font-bold text-slate-700 hover:bg-white transition-all shadow-sm">
                Edit Intel
              </button>
              <button onClick={handleConfirm} disabled={isSubmitting}
                className="flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[14px] font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Activity size={18} className="animate-spin" /> Broadcasting...</>
                ) : (
                  <><ShieldCheck size={18} /> Broadcast Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- Form state ----------------------------------------
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Ambient Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Left Column: Form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Request Blood</h1>
            <p className="text-[15px] font-medium text-slate-500 mt-2">Find compatible donors quickly and securely.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-8">
            
            {/* Blood Group */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Blood Group Needed <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-4 gap-3">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                    className={cn(
                      'py-3 rounded-2xl text-[14px] font-bold transition-all border shadow-sm',
                      form.bloodGroup === bg
                        ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-transparent shadow-[0_4px_20px_rgba(225,29,72,0.4)] scale-105'
                        : 'bg-white/50 text-slate-700 border-white hover:border-rose-300 hover:bg-white'
                    )}>
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Units */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Units Needed</label>
              <div className="flex items-center gap-4 bg-white/40 p-2 rounded-[2rem] border border-white w-max shadow-sm">
                <button onClick={() => setForm(f => ({ ...f, units: Math.max(1, f.units - 1) }))}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 border border-white text-slate-700 hover:bg-white transition-all shadow-sm">
                  -
                </button>
                <div className="w-16 h-12 flex flex-col items-center justify-center bg-transparent rounded-2xl">
                  <span className="text-[20px] font-extrabold text-slate-900 leading-none">{form.units}</span>
                </div>
                <button onClick={() => setForm(f => ({ ...f, units: Math.min(10, f.units + 1) }))}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 border border-white text-slate-700 hover:bg-white transition-all shadow-sm">
                  +
                </button>
                <span className="text-[12px] font-bold text-slate-400 pr-4">unit{form.units > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Urgency <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {URGENCY_OPTIONS.map(u => (
                  <button key={u.key}
                    onClick={() => setForm(f => ({ ...f, urgency: u.key }))}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-2xl border text-left transition-all',
                      form.urgency === u.key
                        ? cn('border-2', u.border, u.bg, 'scale-[1.02] shadow-sm')
                        : 'border-white bg-white/50 hover:bg-white hover:border-slate-300 shadow-sm'
                    )}>
                    <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-inner", form.urgency === u.key ? `bg-${u.color.split('-')[1]}-500` : "bg-slate-300")} />
                    <div>
                      <p className={cn("text-[14px] font-bold", form.urgency === u.key ? u.color : "text-slate-800")}>{u.label}</p>
                      <p className={cn("text-[12px] mt-1 font-medium", form.urgency === u.key ? u.color.replace('600', '700/70') : "text-slate-500")}>{u.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hospital & Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Hospital <span className="text-rose-500">*</span></label>
                <select
                  value={form.hospital}
                  onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                  className="w-full h-14 px-4 text-[14px] font-medium bg-white/50 backdrop-blur border border-white rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all text-slate-800 shadow-sm"
                >
                  <option value="">Select hospital...</option>
                  {hospitalsList.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Contact Phone <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.contactPhone}
                  onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                  className="w-full h-14 px-4 text-[14px] font-medium bg-white/50 backdrop-blur border border-white rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all text-slate-800 shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Reason <span className="text-slate-400 normal-case tracking-normal">(optional)</span></label>
              <textarea
                rows={3}
                placeholder="Brief description of medical condition..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full p-4 text-[14px] font-medium bg-white/50 backdrop-blur border border-white rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all resize-none text-slate-800 shadow-sm placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={cn(
                'w-full py-4 rounded-[1.5rem] font-bold text-[15px] transition-all flex items-center justify-center gap-3',
                isValid
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-[1.01]'
                  : 'bg-white/50 border border-white text-slate-400 cursor-not-allowed shadow-sm'
              )}
            >
              <Droplets size={18} />
              {isValid ? 'Review & Submit Request' : 'Fill required fields to continue'}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Compatibility Info Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-[0_8px_30px_rgba(15,23,42,0.4)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
            <h3 className="text-[14px] font-bold text-slate-300 flex items-center gap-2 mb-6 uppercase tracking-wider">
              <Search size={16} className="text-rose-400" /> Target Network
            </h3>
            
            {form.bloodGroup ? (
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-[18px] font-extrabold text-white shadow-lg shadow-rose-500/30">
                    {form.bloodGroup}
                  </div>
                  <div>
                    <p className="text-[18px] font-extrabold text-white">~12 potential</p>
                    <p className="text-[13px] font-medium text-slate-400">matching donors nearby</p>
                  </div>
                </div>
                <div className="h-px bg-slate-700" />
                <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                  Upon dispatch, compatible donors within 15 km will be alerted in priority waves until your payload requirements are met.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center py-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center">
                  <Activity size={20} className="text-slate-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-400">Awaiting Blood Group target to calculate network availability.</p>
              </div>
            )}
          </div>

          {/* Recent requests */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-wider">
              <Clock size={16} className="text-blue-500" /> Recent Missions
            </h3>
            
            <div className="flex flex-col gap-3">
              {recentRequests.length === 0 ? (
                <p className="text-[13px] font-medium text-slate-500 text-center py-4">No recent history.</p>
              ) : (
                recentRequests.map(r => {
                  const reqStatus = r.status?.toUpperCase() || 'PENDING';
                  const conf = STATUS_CONFIG[reqStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                  return (
                    <div key={r.id} className="p-4 rounded-2xl bg-white/50 border border-white shadow-sm transition-all hover:bg-white/80 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[13px] font-bold text-slate-800">{r.type} req {r.id.slice(-4).toUpperCase()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-inner"
                          style={{ background: conf.bg, color: conf.color }}>
                          {conf.label}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={10} /> {r.facility}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Your Location</p>
                <p className="text-[12px] font-medium text-slate-500 mt-1">
                  {coordinates ? `Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}` : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocLoading}
                className="w-full md:flex-1 py-3 rounded-xl bg-white border border-white text-slate-700 text-[13px] font-bold hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
              >
                {isLocLoading ? 'Detecting…' : '📍 Use My Current Location'}
              </button>
              {coordinates && (
                <button
                  onClick={() => { setCoordinates(null); toast('Location cleared'); }}
                  className="w-full py-3 px-4 bg-white/50 border border-white text-slate-500 rounded-xl md:w-auto hover:text-rose-600 font-bold text-[13px] transition-colors"
                >Clear</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}