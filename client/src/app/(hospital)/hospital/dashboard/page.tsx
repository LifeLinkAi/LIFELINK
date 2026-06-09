'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { 
  AlertTriangle, Droplets, Users, Heart,
  TrendingUp, TrendingDown, Activity, CheckCircle, Award, ShieldAlert, FileText, UploadCloud, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  time: string;
  title: string;
  desc: string;
  urgent: boolean;
}

interface BloodLevel {
  type: string;
  units: number;
  max: number;
  status: 'critical' | 'low' | 'adequate' | 'optimal';
}

interface HospitalProfileData {
  id: string;
  name: string;
  email: string;
  governmentLicenseId: string;
  city: string;
  location: string;
  logo: string;
  specialties: string[];
  status: string;
  patientCount: number;
  rating: number | string;
  bloodHealthStatus: 'Critical' | 'Stable' | 'Optimal';
  isSetupComplete: boolean;
  phone: string;
  website: string;
  accreditation: string;
  hospitalLicenseUrl: string;
  kidneyTransplantLicenseUrl: string;
  liverTransplantLicenseUrl: string;
  heartTransplantLicenseUrl: string;
  lungTransplantLicenseUrl: string;
  contactPerson: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
}
// New dashboard data interfaces
interface DashboardMetrics {
  icuCapacity: number;
  erWaitTime: number;
  onCallStaff: number;
  organRequests: number;
  icuTrend?: string;
  staffTrend?: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  bloodLevels: BloodLevel[];
  activity: ActivityItem[];
}

// Keep fallback arrays intact so the UI never crashes if data is loading
const BLOOD_LEVELS: BloodLevel[] = [
  { type: 'O Negative', units: 12, max: 80, status: 'critical' },
  { type: 'A Positive', units: 84, max: 120, status: 'adequate' },
  { type: 'B Negative', units: 45, max: 80, status: 'optimal' },
  { type: 'AB Positive', units: 22, max: 80, status: 'low' },
];

const ACTIVITY: ActivityItem[] = [
  { time: 'JUST NOW',    title: 'Critical Blood Request',    desc: 'O-Negative request escalated. Donor matching wave 2 started.', urgent: true  },
  { time: '12 MINS AGO', title: 'Organ Verification Updated',  desc: 'Kidney donor medical review moved to legal clearance.',       urgent: false },
  { time: '28 MINS AGO', title: 'Blood Request Fulfilled',     desc: 'O-Negative units transferred to OR-2 for ongoing surgery.',   urgent: false },
  { time: '1 HR AGO',    title: 'ICU Bed Alert',               desc: 'Capacity reached 90%. Elective admissions deferred.',         urgent: false },
];

const STATUS_COLORS = {
  critical: { bar: '#CC0000', text: 'text-red-700' },
  low: { bar: '#D97706', text: 'text-amber-700' },
  adequate: { bar: '#3d6b1e', text: 'text-green-700' },
  optimal: { bar: '#16a34a', text: 'text-green-700' },
};

export default function HospitalDashboard() {
  const [profile, setProfile] = useState<HospitalProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic state for your live metrics
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: { icuCapacity: 92, erWaitTime: 45, onCallStaff: 142, organRequests: 4 },
    bloodLevels: BLOOD_LEVELS,
    activity: ACTIVITY
  });

  // Multi-step Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Details
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2: Capabilities & Certifications
  const [specialties, setSpecialties] = useState<string[]>(['General']);
  const [kidneyTransplantLicenseUrl, setKidneyTransplantLicenseUrl] = useState('');
  const [liverTransplantLicenseUrl, setLiverTransplantLicenseUrl] = useState('');
  const [heartTransplantLicenseUrl, setHeartTransplantLicenseUrl] = useState('');
  const [lungTransplantLicenseUrl, setLungTransplantLicenseUrl] = useState('');

  // Step 3: Licensing & Contact Person
  const [governmentLicenseId, setGovernmentLicenseId] = useState('');
  const [hospitalLicenseUrl, setHospitalLicenseUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Simulated upload states
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      // Fire requests concurrently using Promise.all
      const [profileRes, dashboardRes] = await Promise.all([
        api.get('/hospitals/me'),
        api.get('/hospitals/dashboard').catch(err => {
          console.warn("Dashboard metrics endpoint not fully deployed yet. Using fallbacks.", err);
          return null; // Safe degradation if endpoint is still being pushed
        })
      ]);

      // Set Profile Data
      setProfile(profileRes.data);
      if (profileRes.data) {
        setCity(profileRes.data.city || '');
        setAddress(profileRes.data.location || '');
        setPhone(profileRes.data.phone || '');
        setWebsite(profileRes.data.website || '');
        setSpecialties(profileRes.data.specialties || ['General']);
        setGovernmentLicenseId(profileRes.data.governmentLicenseId || '');
        setHospitalLicenseUrl(profileRes.data.hospitalLicenseUrl || '');
        setKidneyTransplantLicenseUrl(profileRes.data.kidneyTransplantLicenseUrl || '');
        setLiverTransplantLicenseUrl(profileRes.data.liverTransplantLicenseUrl || '');
        setHeartTransplantLicenseUrl(profileRes.data.heartTransplantLicenseUrl || '');
        setLungTransplantLicenseUrl(profileRes.data.lungTransplantLicenseUrl || '');
        if (profileRes.data.contactPerson) {
          setContactName(profileRes.data.contactPerson.name || '');
          setContactDesignation(profileRes.data.contactPerson.designation || '');
          setContactEmail(profileRes.data.contactPerson.email || '');
          setContactPhone(profileRes.data.contactPerson.phone || '');
        }
      }

      // Set Dashboard live metrics if the backend returned data successfully
      if (dashboardRes && dashboardRes.data?.success) {
        setDashboardData(dashboardRes.data.data);
      } else if (dashboardRes && dashboardRes.data) {
        setDashboardData(dashboardRes.data); // fallback to raw response object if not nested
      }

    } catch (error) {
      console.error('Error fetching hospital environment profile:', error);
      toast.error('Failed to load facility configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = (docType: string) => {
    if (typeof window === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB.');
        return;
      }

      try {
        setUploadingDoc(docType);
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedUrl = res.data.url;
        if (docType === 'hospital') setHospitalLicenseUrl(uploadedUrl);
        if (docType === 'kidney') setKidneyTransplantLicenseUrl(uploadedUrl);
        if (docType === 'liver') setLiverTransplantLicenseUrl(uploadedUrl);
        if (docType === 'heart') setHeartTransplantLicenseUrl(uploadedUrl);
        if (docType === 'lung') setLungTransplantLicenseUrl(uploadedUrl);

        toast.success(`${file.name} uploaded successfully!`);
      } catch (err: any) {
        console.error('File upload error:', err);
        const errMsg = err.response?.data?.message || 'Failed to upload file to Cloudinary.';
        toast.error(errMsg);
      } finally {
        setUploadingDoc(null);
      }
    };
    input.click();
  };

  const handleRemoveDoc = (docType: string) => {
    if (docType === 'hospital') setHospitalLicenseUrl('');
    if (docType === 'kidney') setKidneyTransplantLicenseUrl('');
    if (docType === 'liver') setLiverTransplantLicenseUrl('');
    if (docType === 'heart') setHeartTransplantLicenseUrl('');
    if (docType === 'lung') setLungTransplantLicenseUrl('');
    toast.success('Certificate removed.');
  };

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter(s => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!city || !address || !phone) {
        toast.error('Please enter city, physical address, and contact phone.');
        return;
      }
    }
    if (currentStep === 2) {
      // Validate conditional certifications
      if (specialties.includes('Kidney Transplant') && !kidneyTransplantLicenseUrl) {
        toast.error('Kidney Transplant Certification license is required.');
        return;
      }
      if (specialties.includes('Liver Transplant') && !liverTransplantLicenseUrl) {
        toast.error('Liver Transplant Certification license is required.');
        return;
      }
      if (specialties.includes('Heart Transplant') && !heartTransplantLicenseUrl) {
        toast.error('Heart Transplant Certification license is required.');
        return;
      }
      if (specialties.includes('Lung Transplant') && !lungTransplantLicenseUrl) {
        toast.error('Lung Transplant Certification license is required.');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!governmentLicenseId || !hospitalLicenseUrl || !contactName || !contactEmail || !contactPhone) {
      toast.error('Government License ID, Compulsory Hospital License Certificate, and Contact Info are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        city,
        address,
        phone,
        website,
        specialties,
        governmentLicenseId,
        hospitalLicenseUrl,
        kidneyTransplantLicenseUrl,
        liverTransplantLicenseUrl,
        heartTransplantLicenseUrl,
        lungTransplantLicenseUrl,
        contactPerson: {
          name: contactName,
          designation: contactDesignation,
          email: contactEmail,
          phone: contactPhone,
        }
      };

      const res = await api.put('/hospitals/setup-complete', payload);
      setProfile(res.data);
      toast.success('Institutional setup profile submitted for audit!');
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to submit setup parameters.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3d6b1e] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-syne text-[#3d6b1e] font-bold text-sm tracking-wider uppercase">Loading Overview...</p>
        </div>
      </div>
    );
  }

  const isPendingAudit = profile && profile.isSetupComplete && (profile.status === 'Pending' || profile.status === 'Verified'); // wait until status shifts to Active
  const isSetupIncomplete = profile && !profile.isSetupComplete;

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      {/* SETUP WIZARD INTERCEPT BLURRED OVERLAY */}
      {isSetupIncomplete && (
        <div className="fixed inset-0 z-50 bg-[#0b120c]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-neutral-100 shadow-2xl relative my-8 animate-scale-in">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 border-b border-outline-variant/30 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#3d6b1e]">Institutional setup</span>
                <h2 className="font-syne font-bold text-xl text-gray-900 mt-1">Configure Hospital Node</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border', currentStep >= 1 ? 'bg-[#3d6b1e] text-white border-[#3d6b1e]' : 'text-gray-400 border-gray-200')}>1</span>
                <span className="w-4 h-[1px] bg-gray-200" />
                <span className={cn('text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border', currentStep >= 2 ? 'bg-[#3d6b1e] text-white border-[#3d6b1e]' : 'text-gray-400 border-gray-200')}>2</span>
                <span className="w-4 h-[1px] bg-gray-200" />
                <span className={cn('text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border', currentStep >= 3 ? 'bg-[#3d6b1e] text-white border-[#3d6b1e]' : 'text-gray-400 border-gray-200')}>3</span>
              </div>
            </div>

            {/* STEP 1: Hospital Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Provide official contact, physical address parameters, and location details.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">City Location</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      placeholder="e.g. San Francisco" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">ZIP Code</label>
                    <input 
                      type="text" 
                      value={zip} 
                      onChange={(e) => setZip(e.target.value)} 
                      placeholder="e.g. 94103" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Physical Location Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="e.g. 101 Innovation Dr, Suite A" 
                    className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Official Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="e.g. +1 (555) 012-4567" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Official Website URL</label>
                    <input 
                      type="url" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                      placeholder="e.g. https://hopemedical.org" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-[#3d6b1e] text-white rounded-xl text-xs font-bold hover:brightness-115 transition-all shadow-sm"
                  >
                    Next: Clinical Capabilities
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Medical Capabilities & Specific Certificates */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Select Transplant Capabilities & Specializations</h4>
                  <p className="text-xs text-gray-500">Enable certifications. Note: Each selected transplant specialty requires a validation license certificate upload.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-100 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="kidneyCheck" 
                        checked={specialties.includes('Kidney Transplant')}
                        onChange={() => toggleSpecialty('Kidney Transplant')}
                        className="rounded text-[#3d6b1e] focus:ring-[#3d6b1e]"
                      />
                      <label htmlFor="kidneyCheck" className="text-xs font-bold text-gray-700 cursor-pointer">Kidney Transplant Unit</label>
                    </div>
                    {specialties.includes('Kidney Transplant') && (
                      <div className="pt-1">
                        <UploadField 
                          docUrl={kidneyTransplantLicenseUrl} 
                          docName="Kidney Cert" 
                          onUpload={() => handleUpload('kidney')} 
                          onRemove={() => handleRemoveDoc('kidney')} 
                          uploading={uploadingDoc === 'kidney'}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="liverCheck" 
                        checked={specialties.includes('Liver Transplant')}
                        onChange={() => toggleSpecialty('Liver Transplant')}
                        className="rounded text-[#3d6b1e] focus:ring-[#3d6b1e]"
                      />
                      <label htmlFor="liverCheck" className="text-xs font-bold text-gray-700 cursor-pointer">Liver Transplant Unit</label>
                    </div>
                    {specialties.includes('Liver Transplant') && (
                      <div className="pt-1">
                        <UploadField 
                          docUrl={liverTransplantLicenseUrl} 
                          docName="Liver Cert" 
                          onUpload={() => handleUpload('liver')} 
                          onRemove={() => handleRemoveDoc('liver')} 
                          uploading={uploadingDoc === 'liver'}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="heartCheck" 
                        checked={specialties.includes('Heart Transplant')}
                        onChange={() => toggleSpecialty('Heart Transplant')}
                        className="rounded text-[#3d6b1e] focus:ring-[#3d6b1e]"
                      />
                      <label htmlFor="heartCheck" className="text-xs font-bold text-gray-700 cursor-pointer">Heart Transplant Unit</label>
                    </div>
                    {specialties.includes('Heart Transplant') && (
                      <div className="pt-1">
                        <UploadField 
                          docUrl={heartTransplantLicenseUrl} 
                          docName="Heart Cert" 
                          onUpload={() => handleUpload('heart')} 
                          onRemove={() => handleRemoveDoc('heart')} 
                          uploading={uploadingDoc === 'heart'}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-gray-100 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="lungCheck" 
                        checked={specialties.includes('Lung Transplant')}
                        onChange={() => toggleSpecialty('Lung Transplant')}
                        className="rounded text-[#3d6b1e] focus:ring-[#3d6b1e]"
                      />
                      <label htmlFor="lungCheck" className="text-xs font-bold text-gray-700 cursor-pointer">Lung Transplant Unit</label>
                    </div>
                    {specialties.includes('Lung Transplant') && (
                      <div className="pt-1">
                        <UploadField 
                          docUrl={lungTransplantLicenseUrl} 
                          docName="Lung Cert" 
                          onUpload={() => handleUpload('lung')} 
                          onRemove={() => handleRemoveDoc('lung')} 
                          uploading={uploadingDoc === 'lung'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button 
                    onClick={prevStep}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-neutral-50"
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-[#3d6b1e] text-white rounded-xl text-xs font-bold hover:brightness-115"
                  >
                    Next: Licensing & Audits
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Compulsory Hospital Certificate & Contact Details */}
            {currentStep === 3 && (
              <form onSubmit={handleWizardSubmit} className="space-y-4">
                <p className="text-sm text-gray-500">Upload your compulsory general hospital license certificate and enter contact details.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Government License ID</label>
                    <input 
                      type="text" 
                      value={governmentLicenseId} 
                      onChange={(e) => setGovernmentLicenseId(e.target.value)} 
                      placeholder="e.g. GOV-HOSP-94812" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Accreditation (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Joint Commission" 
                      className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                    />
                  </div>
                </div>

                {/* Compulsory Certificate Upload */}
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-[#fcfcf9]">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="text-gray-400 mb-2" size={32} />
                    <span className="text-xs font-bold text-gray-700">Compulsory Hospital License Certificate</span>
                    <p className="text-[10px] text-gray-400 mt-1 mb-3">Upload your state authority operating license PDF. Without this, activation is restricted.</p>
                    
                    {hospitalLicenseUrl ? (
                      <div className="flex items-center gap-2 bg-[#f3f9ea] border border-[#e1ead2] px-4 py-2 rounded-xl">
                        <span className="text-xs font-semibold text-[#3d6b1e] truncate max-w-[250px]">{hospitalLicenseUrl}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveDoc('hospital')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        disabled={uploadingDoc === 'hospital'}
                        onClick={() => handleUpload('hospital')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3d6b1e] hover:bg-[#2d4721] text-white text-xs font-bold rounded-xl transition"
                      >
                        {uploadingDoc === 'hospital' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <UploadCloud size={14} /> Upload License PDF
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Contact Person */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Primary Contact Person</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Full Name</label>
                      <input 
                        type="text" 
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)} 
                        placeholder="e.g. Dr. Arthur Pendelton" 
                        className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Designation / Role</label>
                      <input 
                        type="text" 
                        value={contactDesignation} 
                        onChange={(e) => setContactDesignation(e.target.value)} 
                        placeholder="e.g. Chief Medical Officer" 
                        className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Official Email</label>
                      <input 
                        type="email" 
                        value={contactEmail} 
                        onChange={(e) => setContactEmail(e.target.value)} 
                        placeholder="e.g. contact@hopemedical.org" 
                        className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Direct Phone</label>
                      <input 
                        type="tel" 
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)} 
                        placeholder="e.g. +1 (555) 012-9988" 
                        className="w-full bg-neutral-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#3d6b1e]" 
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-neutral-50"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#3d6b1e] hover:bg-[#2d4721] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Submit Setup Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* PENDING ADMIN AUDIT LOCK OVERLAY SCREEN */}
      {isPendingAudit && (
        <div className="fixed inset-0 z-50 bg-[#0b120c]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-neutral-100 shadow-2xl text-center relative animate-scale-in">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-200">
              <Award size={32} />
            </div>
            
            <h2 className="font-syne font-bold text-2xl text-gray-900 mb-2">Institutional Audit Awaiting Verification</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your hospital node details and licensing certificates have been submitted successfully. An administrator is currently auditing your credentials.
            </p>

            <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-gray-100 text-left space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <ShieldAlert size={14} className="text-amber-500" />
                Network Restriction Active
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                To protect network legitimacy, organ match searches and donor registers are disabled until the administrator approves and activates your node. We will email you once audited.
              </p>
            </div>

            <button 
              onClick={fetchProfile}
              className="px-6 py-3 bg-[#3d6b1e] hover:bg-[#2d4721] text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition"
            >
              ✓ Refresh Audit Status
            </button>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD CONTENT */}
      <div className={cn("flex flex-col gap-6", (isSetupIncomplete || isPendingAudit) && "blur-md select-none pointer-events-none")}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Overview</h1>
            <p className="text-[13.5px] text-[#6B7A5A] mt-1">Live hospital operations and resource monitoring.</p>
          </div>
        </div>

        {/* Stat cards (dynamic) */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            title="ICU Capacity" 
            subtitle="Critical beds" 
            value={String(dashboardData.metrics.icuCapacity)} 
            suffix="%" 
            tag={dashboardData.metrics.icuCapacity > 90 ? "NEAR CAPACITY" : "OPTIMAL"} 
            tagVariant={dashboardData.metrics.icuCapacity > 90 ? "warn" : "ok"} 
            icon={<AlertTriangle size={18} />} 
            trend={dashboardData.metrics.icuTrend || "+2%"} 
            trendUp={false} 
          />
          <StatCard 
            title="ER Wait Time" 
            subtitle="Average today" 
            value={String(dashboardData.metrics.erWaitTime)} 
            suffix="min" 
            tag={dashboardData.metrics.erWaitTime > 30 ? "LEVEL 1 — ELEVATED" : "NORMAL"} 
            tagVariant={dashboardData.metrics.erWaitTime > 30 ? "critical" : "ok"} 
            icon={<Activity size={18} />} 
          />
          <StatCard 
            title="On-Call Staff" 
            subtitle="Active shift" 
            value={String(dashboardData.metrics.onCallStaff)} 
            suffix="total" 
            tag="✓ Optimal coverage" 
            tagVariant="ok" 
            icon={<Users size={18} />} 
            trend={dashboardData.metrics.staffTrend || "+8"} 
            trendUp={true} 
          />
          <StatCard 
            title="Organ Requests" 
            subtitle="Pending reviews" 
            value={String(dashboardData.metrics.organRequests)} 
            suffix="active" 
            tag={`${dashboardData.metrics.organRequests} to verify`} 
            tagVariant="warn" 
            icon={<Heart size={18} />} 
          />
        </div>

        {/* Blood bank card */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#4a5940]">
              <Droplets size={16} />
              <span className="text-[14px] font-semibold text-[#1a2e0a]">Blood Bank Levels</span>
            </div>
            <a href="/hospital/blood-stock" className="text-[12px] font-medium text-[#3d6b1e] hover:underline">Manage stock →</a>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {dashboardData.bloodLevels.map(b => <BloodLevelBar key={b.type} item={b} />)}
          </div>
        </div>

        {/* Live Activity */}
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-[#6B7A5A]" />
            <span className="text-[14px] font-semibold text-[#1a2e0a]">Live Activity</span>
          </div>
          <div className="flex flex-col">
            {dashboardData.activity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0 w-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0', item.urgent ? 'bg-red-500' : 'bg-[#3d6b1e]')} />
                  {i < dashboardData.activity.length - 1 && <div className="w-px flex-1 bg-[#E8E4D8] my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-[10.5px] font-semibold text-[#8A9A7A] tracking-wide mb-0.5">{item.time}</p>
                  <p className="text-[13px] font-semibold text-[#1a2e0a]">{item.title}</p>
                  <p className="text-[12px] text-[#6B7A5A] leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type TagVariant = 'critical' | 'warn' | 'ok';

function StatCard({ title, subtitle, value, suffix, tag, tagVariant, icon, trend, trendUp }: {
  title: string;
  subtitle: string;
  value: string;
  suffix?: string;
  tag: string;
  tagVariant: TagVariant;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  const tagColors: Record<TagVariant, string> = {
    critical: 'text-red-700 bg-red-50 border border-red-200',
    warn: 'text-amber-700 bg-amber-50 border border-amber-200',
    ok: 'text-green-700 bg-green-50 border border-green-200',
  };
  return (
    <div className="bg-white rounded-xl border border-[#E8E4D8] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-medium text-[#6B7A5A] uppercase tracking-wide">{title}</p>
          <p className="text-[11.5px] text-[#8A9A7A] mt-0.5">{subtitle}</p>
        </div>
        <div className="w-9 h-9 bg-[#f3f9ea] rounded-lg flex items-center justify-center text-[#3d6b1e]">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-bold text-[#1a2e0a] leading-none">{value}</span>
        {suffix && <span className="text-[15px] text-[#8A9A7A]">{suffix}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', tagColors[tagVariant])}>{tag}</span>
        {trend && (
          <span className={cn('flex items-center gap-1 text-[12px] font-medium', trendUp ? 'text-green-600' : 'text-red-600')}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function BloodLevelBar({ item }: { item: BloodLevel }) {
  const pct = Math.round((item.units / item.max) * 100);
  const color = STATUS_COLORS[item.status];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12.5px] font-medium text-[#4a5940]">{item.type}</span>
        <span className={cn('text-[11.5px] font-semibold', color.text)}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)} ({item.units})</span>
      </div>
      <div className="h-1.5 bg-[#F0EDE3] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color.bar }} />
      </div>
    </div>
  );
}

function UploadField({ docUrl, docName, onUpload, onRemove, uploading }: {
  docUrl: string;
  docName: string;
  onUpload: () => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  return (
    <div className="p-3 border border-dashed border-gray-200 rounded-xl bg-white">
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{docName}</span>
        </div>
        {docUrl ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#3d6b1e] font-bold bg-[#f3f9ea] px-2 py-0.5 rounded border border-[#e1ead2]">Uploaded ✓</span>
            <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700">
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            disabled={uploading} 
            onClick={onUpload}
            className="px-2.5 py-1 bg-white border border-[#3d6b1e] text-[#3d6b1e] hover:bg-[#f3f9ea] text-[10px] font-bold rounded-lg transition"
          >
            {uploading ? 'Uploading...' : '+ Upload PDF'}
          </button>
        )}
      </div>
    </div>
  );
}
