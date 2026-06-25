'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Heart, Droplet, Activity, MapPin, Search, Plus, CheckCircle2, AlertTriangle, FileText, UploadCloud, Loader2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type ActiveView = 'loading' | 'intake' | 'discovery' | 'tracker';

export default function DonorOrganPortal() {
  const { user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<ActiveView>('loading');
  
  // Profile State
  const [profile, setProfile] = useState<any>(null);
  
  // Intake Form
  const [organ, setOrgan] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [illnesses, setIllnesses] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Discovery Feed
  const [matches, setMatches] = useState<any[]>([]);
  const [fetchingMatches, setFetchingMatches] = useState(false);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);

  // Tracker
  const [activeRequest, setActiveRequest] = useState<any>(null);

  const fetchState = async () => {
    try {
      // 1. Check for active organ request (interest sent or accepted) — highest priority
      const reqRes = await api.get('/donor/organ/active-request');
      if (reqRes.data.data) {
        setActiveRequest(reqRes.data.data);
        setView('tracker');
        return;
      }

      // 2. No active request — check if donor has a profile and fetch matches
      try {
        const matchRes = await api.get('/donor/organ/matches');
        if (matchRes.data.data && matchRes.data.data.length > 0) {
          setMatches(matchRes.data.data);
          setView('discovery');
          return;
        }
        // Profile exists but no matches right now — show discovery feed (empty)
        // Only show intake if the matches endpoint explicitly returned an empty array
        // (means profile exists but no compatible patients)
        setView('discovery');
      } catch {
        // Matches endpoint failed (profile likely doesn't exist) — show intake
        setView('intake');
      }
    } catch {
      setView('intake');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'ml_default');

    try {
      setUploading(true);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setCertUrl(data.secure_url);
      toast.success('Certificate uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const submitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organ || !bloodType) return toast.error('Organ and Blood Type are required');
    
    try {
      setSubmitting(true);
      await api.post('/donor/organ/profile', {
        organSelection: organ,
        bloodGroup: bloodType,
        healthChecklist: { chronicIllnesses: illnesses, lifestyleHabits: lifestyle },
        medicalCertificateUrl: certUrl
      });
      toast.success('Profile created successfully');
      fetchState();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const sendInterest = async (waitlistId: string, hospitalId: string) => {
    try {
      setSendingInterest(waitlistId);
      await api.post('/donor/organ/express-interest', { waitlistId, hospitalId });
      toast.success('Interest sent successfully!');
      fetchState();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setSendingInterest(null);
    }
  };

  if (view === 'loading') {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-500" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
          <Heart size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organ Donor Command Center</h1>
          <p className="text-sm text-slate-500">Collaborative volunteer portal for organ donation matching and tracking.</p>
        </div>
      </div>

      {/* VIEW A: INTAKE */}
      {view === 'intake' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6">
            <h2 className="text-xl font-bold">Donor Intake Verification</h2>
            <p className="text-sm text-slate-400 mt-1">Complete your profile to unlock the discovery feed.</p>
          </div>
          <form onSubmit={submitIntake} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Organ Selection</label>
                <select value={organ} onChange={e => setOrgan(e.target.value)} required className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400">
                  <option value="">Select Organ</option>
                  {['Kidney', 'Liver', 'Cornea', 'Bone Marrow', 'Lung'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                <select value={bloodType} onChange={e => setBloodType(e.target.value)} required className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400 font-mono">
                  <option value="">Select Type</option>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chronic Illnesses</label>
              <textarea value={illnesses} onChange={e => setIllnesses(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400" rows={2} placeholder="E.g., Hypertension, Diabetes (or None)"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Fitness Certificate</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
                {uploading ? (
                  <Loader2 className="animate-spin text-slate-500" />
                ) : certUrl ? (
                  <div className="flex flex-col items-center text-emerald-600">
                    <CheckCircle2 size={32} className="mb-2" />
                    <span className="text-sm font-medium">Uploaded Successfully</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <UploadCloud size={32} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload document</span>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full h-12 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" /> : 'Complete Verification & Proceed'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}

      {/* VIEW B: DISCOVERY FEED */}
      {view === 'discovery' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <h2 className="font-bold">Active Patient Matches</h2>
              <p className="text-sm text-slate-400">Patients matching your exact vitals.</p>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-400">{matches.length}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(m => (
              <div key={m._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-700 uppercase">
                      Urgency: {m.urgency}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">{m.bloodGroup}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 truncate">{m.fullName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                    <MapPin size={14} />
                    <span className="truncate">{m.hospitalId?.name || 'Local Hospital'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Heart size={14} />
                    <span>Requires {m.requiredOrgan}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => sendInterest(m._id, m.hospitalId?._id)}
                    disabled={sendingInterest === m._id}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingInterest === m._id ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                    Send Direct Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW C: LIVE TELEMETRY TRACKER */}
      {view === 'tracker' && activeRequest && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Active Donation Tracker</h2>
                <p className="text-sm text-slate-400 mt-0.5">Patient: {activeRequest.waitlistId?.fullName ?? 'Awaiting match confirmation'}</p>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                {activeRequest.status === 'PENDING_HOSPITAL' ? 'UNDER REVIEW' : activeRequest.status.replace(/_/g, ' ')}
              </div>
            </div>
            
            <div className="p-8">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                
                {/* Step 1 — Interest Sent (always completed in tracker view) */}
                <div className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-emerald-500 rounded-full border-4 border-white left-[-13px] top-0 shadow-sm flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">Interest Sent</h3>
                  <p className="text-sm text-slate-500 mt-1">Hospital notified of your willingness to donate.</p>
                </div>

                {/* Step 1.5 — Awaiting Hospital Review (animated pulse, only visible for PENDING_HOSPITAL) */}
                {activeRequest.status === 'PENDING_HOSPITAL' && (
                  <div className="relative pl-8">
                    <div className="absolute w-6 h-6 rounded-full border-4 border-white left-[-13px] top-0 shadow-sm bg-amber-400 flex items-center justify-center animate-pulse">
                      <Activity size={10} className="text-white" />
                    </div>
                    <h3 className="font-bold text-amber-700">Awaiting Hospital Review</h3>
                    <p className="text-sm text-slate-500 mt-1">The hospital is reviewing your interest. You will be notified once they respond.</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                      Pending response
                    </div>
                  </div>
                )}

                {/* Step 2 — Lab Test Scheduled */}
                <div className="relative pl-8">
                  <div className={cn("absolute w-6 h-6 rounded-full border-4 border-white left-[-13px] top-0 shadow-sm flex items-center justify-center", 
                    ['CLINICAL_TESTING', 'PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'bg-emerald-500' : 'bg-slate-200')}>
                    {['CLINICAL_TESTING', 'PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <h3 className={cn("font-bold", ['CLINICAL_TESTING', 'PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'text-slate-900' : 'text-slate-400')}>Lab Test Scheduled</h3>
                  
                  {activeRequest.status === 'CLINICAL_TESTING' && activeRequest.clinicalEvaluation?.scheduledTestDate && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                        <Activity size={16} className="text-emerald-500" />
                        Appointment Confirmed
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</p>
                          <p className="font-mono mt-0.5">{new Date(activeRequest.clinicalEvaluation.scheduledTestDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Facility</p>
                          <p className="mt-0.5">{activeRequest.clinicalEvaluation.testingFacility}</p>
                        </div>
                      </div>
                      {activeRequest.clinicalEvaluation.donorInstructions && (
                        <div className="mt-4 pt-3 border-t border-slate-200 text-sm">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Instructions</p>
                          <p className="text-slate-700 italic">{activeRequest.clinicalEvaluation.donorInstructions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 3 — Legal Consent */}
                <div className="relative pl-8">
                  <div className={cn("absolute w-6 h-6 rounded-full border-4 border-white left-[-13px] top-0 shadow-sm flex items-center justify-center", 
                    ['PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'bg-emerald-500' : 'bg-slate-200')}>
                  </div>
                  <h3 className={cn("font-bold", ['PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'text-slate-900' : 'text-slate-400')}>Legal Consent Verified</h3>
                </div>

                {/* Step 4 — Surgery */}
                <div className="relative pl-8">
                  <div className={cn("absolute w-6 h-6 rounded-full border-4 border-white left-[-13px] top-0 shadow-sm flex items-center justify-center", 
                    ['TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'bg-emerald-500' : 'bg-slate-200')}>
                  </div>
                  <h3 className={cn("font-bold", ['TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'COMPLETED'].includes(activeRequest.status) ? 'text-slate-900' : 'text-slate-400')}>Surgery Scheduled</h3>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
