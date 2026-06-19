"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { OrganPreferenceSelector } from "@/components/donor/OrganPreferenceSelector";
import { useUpdateDonorProfile } from "@/hooks/useUpdateDonorProfile";

interface ProfileData {
  id: string;
  bloodType: string;
  organsWillingToDonate: string[];
  isSetupComplete: boolean;
  status: string;
  isAvailable: boolean;
  details: string;
}

export default function OrganDonation() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftOrgans, setDraftOrgans] = useState<string[]>([]);
  const { update, isLoading: isSaving } = useUpdateDonorProfile();
  
  // Custom Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Step 2 Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<string>("O-");
  const [certificateUrl, setCertificateUrl] = useState<string>("");
  const [certificateName, setCertificateName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Health checklist states
  const [chronicIllness, setChronicIllness] = useState<boolean | null>(null);
  const [infectiousDisease, setIninfectiousDisease] = useState<boolean | null>(null);
  const [lifestyleHabits, setLifestyleHabits] = useState<boolean | null>(null);

  // Patient Matches State
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [interestedRequestIds, setInterestedRequestIds] = useState<string[]>([]);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const isBloodCompatible = (donorBlood: string, patientBlood: string): boolean => {
    const d = donorBlood.toUpperCase();
    const p = patientBlood.toUpperCase();
    if (d === "O-") return true;
    if (d === "O+") return ["O+", "A+", "B+", "AB+"].includes(p);
    if (d === "A-") return ["A-", "A+", "AB-", "AB+"].includes(p);
    if (d === "A+") return ["A+", "AB+"].includes(p);
    if (d === "B-") return ["B-", "B+", "AB-", "AB+"].includes(p);
    if (d === "B+") return ["B+", "AB+"].includes(p);
    if (d === "AB-") return ["AB-", "AB+"].includes(p);
    if (d === "AB+") return p === "AB+";
    return false;
  };

  const fetchPatients = async (organs: string[], bloodType: string, donorUserId: string) => {
    try {
      setLoadingPatients(true);
      const res = await api.get("/requests?type=Organ");
      const allRequests = res.data.data || [];
      
      const compatible = allRequests.filter((r: any) => {
        if (r.type !== "Organ") return false;
        
        // Active match-finding states
        const activeStates = ["PENDING", "Pending", "Matching", "Awaiting Match", "PENDING_DONOR_ACCEPT"];
        if (!activeStates.includes(r.status)) return false;
        
        // Match organ type
        if (!r.organType || !organs.includes(r.organType)) return false;
        
        // Match blood type
        if (!r.bloodGroup || !isBloodCompatible(bloodType, r.bloodGroup)) return false;
        
        return true;
      });

      setPatients(compatible);

      // Track requests where this donor has already sent interest
      const interestSentIds = compatible
        .filter((r: any) => 
          r.targetDonorId === donorUserId || 
          (r.matchedDonors && r.matchedDonors.some((m: any) => m.donorId === donorUserId || m.status === "ACCEPTED"))
        )
        .map((r: any) => r.id || r._id);
      setInterestedRequestIds(interestSentIds);
    } catch (err) {
      console.error("Error fetching compatible patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadProfile = () => {
    api.get("/donors/me").then((res) => {
      const data = res.data;
      const parsedProfile: ProfileData = {
        id: data.id,
        bloodType: data.bloodType ?? "O-",
        organsWillingToDonate: data.organsWillingToDonate ?? [],
        isSetupComplete: data.isSetupComplete ?? false,
        status: data.status ?? "Pending",
        isAvailable: data.isAvailable ?? false,
        details: data.details ?? "",
      };
      setProfile(parsedProfile);
      setDraftOrgans(parsedProfile.organsWillingToDonate);
      
      // Preset modal fields if profile has existing values
      setSelectedOrgans(parsedProfile.organsWillingToDonate);
      setSelectedBloodType(parsedProfile.bloodType);

      if (parsedProfile.isAvailable && parsedProfile.organsWillingToDonate.length > 0) {
        fetchPatients(parsedProfile.organsWillingToDonate, parsedProfile.bloodType, parsedProfile.id);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSavePreferences = async () => {
    const result = await update({ organsWillingToDonate: draftOrgans });
    if (result) {
      setProfile((p) => p ? { ...p, organsWillingToDonate: draftOrgans } : p);
      setEditing(false);
      showToast("✓ Organ preferences updated successfully.");
      if (profile) {
        fetchPatients(draftOrgans, profile.bloodType, profile.id);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setCertificateName(file.name);
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCertificateUrl(res.data.url);
    } catch (err: any) {
      setUploadError("Failed to upload document. Please upload a valid image/PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReadinessSubmit = async () => {
    if (selectedOrgans.length === 0) {
      alert("Please select at least one organ to register your willingness.");
      return;
    }
    if (!certificateUrl) {
      alert("Please upload your medical fitness certificate first.");
      return;
    }
    if (chronicIllness === null || infectiousDisease === null || lifestyleHabits === null) {
      alert("Please answer all screening checksheets.");
      return;
    }

    const serializedDetails = JSON.stringify({
      certificateUrl,
      certificateName,
      healthChecklist: {
        chronicIllness,
        infectiousDisease,
        lifestyleHabits,
      },
    });

    const payload = {
      organsWillingToDonate: selectedOrgans,
      bloodType: selectedBloodType,
      isAvailable: true,
      details: serializedDetails,
    };

    const result = await update(payload);
    if (result) {
      setIsModalOpen(false);
      showToast("✓ Your readiness profile has been submitted successfully!");
      loadProfile();
    }
  };

  const handleCancelAvailability = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel your organ donation availability? This will hide your profile from matching patients.");
    if (!confirmCancel) return;

    const payload = {
      isAvailable: false,
      organsWillingToDonate: [],
    };

    const result = await update(payload);
    if (result) {
      showToast("✓ Availability cancelled successfully.");
      loadProfile();
    }
  };

  const handleSendInterest = async (requestId: string) => {
    try {
      const res = await api.post(`/requests/${requestId}/interest`);
      if (res.data.success) {
        setInterestedRequestIds((prev) => [...prev, requestId]);
        showToast("✓ Interest sent! The hospital has been notified.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? "Failed to log interest.";
      showToast(`❌ ${msg}`);
    }
  };

  const isUserAvailable = profile && profile.isAvailable && profile.organsWillingToDonate.length > 0;

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto relative">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#eef4e2] border border-[#d2e4c0] rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold text-[#3b5e2b] shadow-xl animate-fade-in-down">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Organ Donation Portal</h2>
          <p className="text-sm text-gray-500">Confirm your donor availability, manage your willingness details, and express interest to transplant patients.</p>
        </div>
        {isUserAvailable && (
          <>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-5 py-2.5 hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Update Preferences
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraftOrgans(profile?.organsWillingToDonate ?? []);
                  }}
                  className="text-xs font-bold text-gray-500 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="text-xs font-bold bg-[#3b5e2b] text-white rounded-full px-5 py-2 hover:bg-[#2d4721] transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Save Preferences
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Status / Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Onboarding Mode: CTA Banner */}
          {!isUserAvailable && profile !== null && (
            <div className="bg-gradient-to-br from-[#f1f7e8] to-[#ffffff] border border-[#e1ead2] rounded-[2rem] p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#cbf275] opacity-25 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#cbf275] flex items-center justify-center shadow-sm border border-[#bce366] mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d3a24" strokeWidth="2.5">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Begin Your Organ Donation Registry</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Verify your clinical willingness, upload your medical clearance certificate, and answer our baseline health questionnaire to match with patients in urgent need.
                </p>
                <button
                  onClick={() => {
                    setModalStep(1);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-[#3b5e2b] text-white font-bold rounded-full hover:bg-[#2d4721] transition-all shadow-md text-xs tracking-wider uppercase font-dmsans"
                >
                  I Am Ready to Donate
                </button>
              </div>
            </div>
          )}

          {/* Active Registry Status */}
          {isUserAvailable && (
            <div className="bg-gradient-to-br from-[#f1f7e8] to-[#ffffff] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#cbf275] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#bce366]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3a24" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">Registry Status</h3>
                </div>

                <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-flex items-center gap-1.5 border border-[#bce366]">
                  <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full" />Active Available Donor
                </span>
                
                <h4 className="text-2xl font-bold text-gray-900 mb-3 mt-2">
                  {profile.organsWillingToDonate.length} Organ{profile.organsWillingToDonate.length !== 1 ? "s" : ""} Willing to Donate
                </h4>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.organsWillingToDonate.map((organ) => (
                    <span key={organ} className="bg-white border border-[#d2e4c0] text-[#3b5e2b] text-xs font-bold px-3 py-1 rounded-full">
                      {organ}
                    </span>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Blood Type", val: profile.bloodType },
                    { label: "Organs Selected", val: String(profile.organsWillingToDonate.length) },
                    { label: "Registry Type", val: "LifeLink National" },
                    { label: "Account Status", val: "Available" },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{f.label}</div>
                      <div className="text-xs font-bold text-gray-800">{f.val}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6 flex justify-end">
                  <button
                    onClick={handleCancelAvailability}
                    disabled={isSaving}
                    className="text-xs font-bold text-red-600 border border-red-200 rounded-full px-5 py-2.5 hover:bg-red-50 transition-colors bg-white shadow-sm flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Cancel Availability
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Organ Preference Editor */}
          {editing && isUserAvailable && (
            <div className="bg-white border border-[#d2e4c0] rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5">
                  <circle cx="12" cy="10" r="4" />
                  <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                </svg>
                <h3 className="text-lg font-serif font-bold text-gray-900">Select Willing Organs</h3>
              </div>
              <OrganPreferenceSelector selected={draftOrgans} onChange={setDraftOrgans} />
              <p className="text-[11px] text-gray-400 mt-4">
                {draftOrgans.length === 0 ? "No organs selected." : `${draftOrgans.length} organ${draftOrgans.length !== 1 ? "s" : ""} selected.`}
              </p>
            </div>
          )}

          {/* Patients Awaiting Transplants List */}
          {isUserAvailable && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h3 className="text-xl font-serif font-bold text-gray-900">Patients Awaiting Transplants</h3>
                </div>
                <span className="text-xs text-gray-400 font-semibold">{patients.length} Match{patients.length !== 1 ? "es" : ""}</span>
              </div>

              {loadingPatients ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-6 animate-pulse space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-8 bg-gray-100 rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : patients.length > 0 ? (
                <div className="space-y-4">
                  {patients.map((patient) => {
                    const isInterested = interestedRequestIds.includes(patient.id || patient._id);
                    return (
                      <div key={patient.id || patient._id} className="border border-gray-100 rounded-2xl p-6 hover:border-[#d2e4c0] transition-colors relative bg-slate-50/30">
                        <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                          <div>
                            <span className="text-[10px] bg-[#eef4e2] text-[#3b5e2b] font-bold px-2 py-0.5 rounded mr-2 font-label-caps uppercase">
                              {patient.organType}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-label-caps uppercase ${
                              patient.urgency === "Critical" ? "bg-red-50 text-red-600 border border-red-100" :
                              patient.urgency === "High" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                              "bg-green-50 text-green-600 border border-green-100"
                            }`}>
                              {patient.urgency} Urgency
                            </span>
                            <h4 className="text-base font-bold text-gray-900 mt-2">
                              Recipient: {patient.gender}, {patient.age} yrs
                            </h4>
                          </div>

                          <button
                            onClick={() => handleSendInterest(patient.id || patient._id)}
                            disabled={isInterested}
                            className={`text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition-all ${
                              isInterested
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-[#3b5e2b] text-white hover:bg-[#2d4721]"
                            }`}
                          >
                            {isInterested ? "Interest Sent" : "Send Interest"}
                          </button>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1.5 mt-2">
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                            Hospital: <span className="font-semibold text-gray-700">{patient.facility || "Coordinating Medical Center"}</span>
                          </p>
                          {patient.notes && (
                            <p className="italic text-gray-400 mt-2 bg-white p-3 rounded-xl border border-gray-100">
                              &ldquo;{patient.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mb-4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <h4 className="font-bold text-gray-900 mb-2">No Matches Found</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                    No patients currently registered in the database match your compatible blood type and organ willingness filters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Legal Workflow */}
          {isUserAvailable && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <h3 className="text-lg font-serif font-bold text-gray-900">Legal Approval Workflow</h3>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-100 bg-[#fbfdf9] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#eef4e2] flex items-center justify-center flex-shrink-0 border border-[#d2e4c0]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">Initial Consent Directive</h4>
                      <p className="text-[11px] text-gray-500">Digitally signed &amp; notarized</p>
                    </div>
                  </div>
                  <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1 rounded uppercase">Valid</span>
                </div>
                <div className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">Next of Kin Acknowledgment</h4>
                      <p className="text-[11px] text-gray-500">Awaiting designated contact review</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-gray-600 uppercase hover:text-gray-900">Remind</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Medical & Scheduling */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medical Eligibility */}
          <div className="bg-[#fcfdfa] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif font-bold text-gray-900">Medical Eligibility</h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2">
                <path d="M14 2v4a2 2 0 0 0 2 2h4l-4-4z" />
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              </svg>
            </div>
            <div className="relative pl-6 border-l-2 border-[#d2e4c0] space-y-8">
              {[
                { label: "Basic Health Screening", sub: "Cleared on registration", done: true },
                { label: "HLA Tissue Typing", sub: "Profile completed & banked", done: isUserAvailable },
                { label: "In-Depth Organ Viability", sub: "Pending clinical matches", done: false },
              ].map(s => (
                <div key={s.label} className="relative">
                  <div className={`absolute -left-[35px] top-0.5 w-6 h-6 ${s.done ? "bg-[#5b8a3e]" : "bg-[#f8f9fa]"} rounded-full border-[3px] border-white flex items-center justify-center shadow-sm`}>
                    {s.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      : <div className="w-2.5 h-2.5 rounded-full border-2 border-[#3b5e2b]" />}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">{s.label}</h4>
                  <p className="text-xs text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 className="text-lg font-serif font-bold text-gray-900">Scheduling &amp; Updates</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#5b8a3e]" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mb-4">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <h4 className="font-bold text-gray-900 mb-2">Standby Status</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
                {interestedRequestIds.length > 0
                  ? "Interest submitted. Awaiting hospital review to schedule clinical evaluation."
                  : "No active procurement procedures scheduled. Submit your readiness questionnaire to get matched."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: DONOR READINESS POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-[#d2e4c0] shadow-2xl max-w-lg w-full p-8 relative flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            {/* Modal Title */}
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-gray-950">Intake Questionnaire</h3>
              <p className="text-xs text-gray-500">Step {modalStep} of 3: Provide your medical readiness details.</p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {modalStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Organ Selection
                    </label>
                    <p className="text-[11px] text-gray-400 mb-3">Select all organs you are willing to donate.</p>
                    <OrganPreferenceSelector selected={selectedOrgans} onChange={setSelectedOrgans} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Blood Group
                    </label>
                    <select
                      value={selectedBloodType}
                      onChange={(e) => setSelectedBloodType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                    >
                      {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Medical Fitness Certificate
                    </label>
                    <p className="text-[11px] text-gray-400 mb-4">Upload a signed fitness certificate from a medical practitioner (PDF, JPG, PNG).</p>
                    
                    <div className="border-2 border-dashed border-[#d2e4c0] rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="material-symbols-outlined text-[36px] text-gray-400 group-hover:text-[#3b5e2b] transition-colors mb-2">
                        cloud_upload
                      </span>
                      {certificateName ? (
                        <div>
                          <p className="text-xs font-bold text-gray-800 break-all px-4">{certificateName}</p>
                          {isUploading ? (
                            <p className="text-[10px] text-[#3b5e2b] font-semibold mt-1">Uploading file...</p>
                          ) : (
                            <p className="text-[10px] text-[#5b8a3e] font-semibold mt-1">✓ Uploaded successfully</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-gray-700">Drag &amp; Drop or Browse</p>
                          <p className="text-[10px] text-gray-400 mt-1">Accepts images and PDF up to 10MB</p>
                        </div>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-500 font-semibold mt-2">{uploadError}</p>
                    )}
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Health Checklist Questionnaire
                    </label>
                    <p className="text-[11px] text-gray-400 mb-4">Provide honest information regarding your medical history.</p>
                    
                    <div className="space-y-4">
                      {[
                        {
                          label: "Chronic Illness History",
                          desc: "Do you have a history of diabetes, hypertension, or active cancers?",
                          state: chronicIllness,
                          setter: setChronicIllness
                        },
                        {
                          label: "Infectious Diseases",
                          desc: "Have you ever tested positive for HIV, Hepatitis B/C, or Tuberculosis?",
                          state: infectiousDisease,
                          setter: setIninfectiousDisease
                        },
                        {
                          label: "Lifestyle Habits",
                          desc: "Do you smoke regularly or consume alcohol frequently?",
                          state: lifestyleHabits,
                          setter: setLifestyleHabits
                        }
                      ].map((item, index) => (
                        <div key={index} className="border border-gray-100 rounded-2xl p-4 bg-slate-50/30">
                          <h4 className="text-xs font-bold text-gray-900 leading-tight mb-1">{item.label}</h4>
                          <p className="text-[11px] text-gray-400 leading-normal mb-3">{item.desc}</p>
                          
                          <div className="flex gap-4">
                            <button
                              onClick={() => item.setter(true)}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                                item.state === true
                                  ? "bg-red-50 border-red-300 text-red-600 shadow-sm"
                                  : "bg-white border-gray-200 text-gray-500 hover:border-red-200"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => item.setter(false)}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                                item.state === false
                                  ? "bg-green-50 border-green-300 text-green-600 shadow-sm"
                                  : "bg-white border-gray-200 text-gray-500 hover:border-green-200"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between gap-4">
              {modalStep > 1 ? (
                <button
                  onClick={() => setModalStep((prev) => prev - 1)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {modalStep < 3 ? (
                <button
                  onClick={() => {
                    if (modalStep === 1 && selectedOrgans.length === 0) {
                      alert("Please select at least one organ.");
                      return;
                    }
                    if (modalStep === 2 && !certificateUrl) {
                      alert("Please upload your Medical Certificate.");
                      return;
                    }
                    setModalStep((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 text-xs font-bold bg-[#3b5e2b] text-white rounded-full hover:bg-[#2d4721] transition-colors shadow-sm ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleReadinessSubmit}
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 text-xs font-bold bg-[#3b5e2b] text-white rounded-full hover:bg-[#2d4721] transition-colors shadow-sm ml-auto disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSaving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}