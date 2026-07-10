"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { OrganPreferenceSelector } from "@/components/donor/OrganPreferenceSelector";
import { useUpdateDonorProfile } from "@/hooks/useUpdateDonorProfile";
import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { IncomingRequest } from "@/services/incomingRequestService";
import { useRequestResponse } from "@/hooks/useRequestResponse";
import { RequestActions } from "@/components/donor/RequestActions";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";

interface ProfileData {
  id: string;
  donorProfileId: string;
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
  const lastUpdated = useAppSelector(state => state.notifications.lastUpdated);
  
  // Incoming Requests & Responses Hooks/States (from theirs branch)
  const { requests, isLoading: isLoadingRequests, error: requestsError, refetch } = useIncomingRequests("Organ");
  const { respond } = useRequestResponse();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);
  
  // Custom Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Completed donation & certificate states
  const [pastDonations, setPastDonations] = useState<any[]>([]);
  const [previewCertificateId, setPreviewCertificateId] = useState<string | null>(null);

  // Wellness Tracker states
  const [activeTab, setActiveTab] = useState<'certificate' | 'wellness'>('certificate');
  const [wellnessLogs, setWellnessLogs] = useState<any[]>([]);
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<'1_MONTH' | '6_MONTH' | '1_YEAR' | '2_YEAR' | 'UNSCHEDULED'>('UNSCHEDULED');
  const [submittingWellness, setSubmittingWellness] = useState(false);
  const [metricsForm, setMetricsForm] = useState({
    creatinine: '',
    gfr: '',
    alt: '',
    ast: '',
    bilirubin: '',
    systolicBP: '',
    diastolicBP: '',
    energyLevel: 5,
    notes: '',
  });
  const [wellnessReportUrl, setWellnessReportUrl] = useState('');
  const [wellnessReportName, setWellnessReportName] = useState('');
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  // Check cooldown status
  const getCooldownStatus = () => {
    if (!pastDonations || pastDonations.length === 0) {
      return { active: false, remainingDays: 0, cooldownEnd: null, lastDonation: null };
    }
    
    // Find the latest completed donation
    const completed = pastDonations.filter(d => d.status === 'TRANSPLANT_SUCCESSFUL');
    if (completed.length === 0) {
      return { active: false, remainingDays: 0, cooldownEnd: null, lastDonation: null };
    }
    
    // Sort to get the latest one
    const sorted = [...completed].sort((a, b) => {
      const dateA = new Date(a.surgicalOutcome?.surgeryCompletedAt || a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.surgicalOutcome?.surgeryCompletedAt || b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
    
    const latest = sorted[0];
    const compDate = new Date(latest.surgicalOutcome?.surgeryCompletedAt || latest.updatedAt || latest.createdAt);
    const cooldownEnd = new Date(compDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const active = now < cooldownEnd;
    const remainingDays = active ? Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    return {
      active,
      remainingDays,
      cooldownEnd,
      lastDonation: latest
    };
  };

  const cooldown = getCooldownStatus();

  // Step 2 Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<string>("O-");
  const [certificateUrl, setCertificateUrl] = useState<string>("");
  const [certificateName, setCertificateName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Guidelines & Legal Consent States
  const [isGuidelinesAccepted, setIsGuidelinesAccepted] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);

  // Health checklist states
  const [chronicIllness, setChronicIllness] = useState<boolean | null>(null);
  const [infectiousDisease, setIninfectiousDisease] = useState<boolean | null>(null);
  const [lifestyleHabits, setLifestyleHabits] = useState<boolean | null>(null);

  // Patient Matches State
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [interestedRequestIds, setInterestedRequestIds] = useState<string[]>([]);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  // Active Match Journey states
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [loadingActiveRequest, setLoadingActiveRequest] = useState(true);
  const [activeDrawerStage, setActiveDrawerStage] = useState<number | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

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

  const fetchPatients = async (organs: string[], bloodType: string, donorUserId: string, donorProfileId: string) => {
    try {
      const res = await api.get("/requests?type=Organ");
      const allRequests = res.data.data || [];
      
      const compatible = allRequests.filter((r: any) => {
        if (r.type !== "Organ") return false;
        
        // Active match-finding states
        const activeStates = ["PENDING", "Pending", "Matching", "Awaiting Match", "PENDING_DONOR_ACCEPT", "Waitlisted", "Waitlist", "WAITLISTED", "WAITLIST", "Searching", "SEARCHING"];
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
          (r.matchedDonors && r.matchedDonors.some((m: any) => m.donorId === donorProfileId || m.donorId === donorUserId || m.status === "ACCEPTED"))
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
        donorProfileId: data.donorProfileId ?? "",
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
        fetchPatients(parsedProfile.organsWillingToDonate, parsedProfile.bloodType, parsedProfile.id, parsedProfile.donorProfileId);
      }
    }).catch(() => {});
  };

  const fetchActiveRequest = useCallback(() => {
    api.get("/donor/organ/active-request")
      .then((res) => {
        if (res.data.success) {
          setPastDonations(res.data.pastDonations || []);
          if (res.data.data) {
            const reqDoc = res.data.data;
            const acceptedStatuses = ['CLINICAL_TESTING', 'PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS', 'TRANSPLANT_SUCCESSFUL'];
            if (acceptedStatuses.includes(reqDoc.status)) {
              setActiveRequest(reqDoc);
            } else {
              setActiveRequest(null);
            }
          } else {
            setActiveRequest(null);
          }
        } else {
          setActiveRequest(null);
          setPastDonations([]);
        }
      })
      .catch(() => {
        setActiveRequest(null);
        setPastDonations([]);
      })
      .finally(() => {
        setLoadingActiveRequest(false);
      });
  }, []);

  const fetchWellnessLogs = useCallback(() => {
    api.get("/donor/wellness/logs")
      .then((res) => {
        if (res.data.success) {
          setWellnessLogs(res.data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProfile();
    fetchActiveRequest();
    fetchWellnessLogs();
  }, [fetchActiveRequest, fetchWellnessLogs, lastUpdated]);

  const handleSavePreferences = async () => {
    const result = await update({ organsWillingToDonate: draftOrgans });
    if (result) {
      setProfile((p) => p ? { ...p, organsWillingToDonate: draftOrgans } : p);
      setEditing(false);
      showToast("✓ Organ preferences updated successfully.");
      if (profile) {
        fetchPatients(draftOrgans, profile.bloodType, profile.id, profile.donorProfileId);
      }
    }
  };

  const handleWellnessSubmit = async () => {
    const lastDonation = cooldown.lastDonation;
    if (!lastDonation) {
      alert("No completed donation found.");
      return;
    }

    const payload = {
      requestId: lastDonation._id || lastDonation.id,
      organType: lastDonation.organType,
      milestone: selectedMilestone,
      metrics: {
        creatinine: metricsForm.creatinine ? parseFloat(metricsForm.creatinine) : null,
        gfr: metricsForm.gfr ? parseFloat(metricsForm.gfr) : null,
        alt: metricsForm.alt ? parseFloat(metricsForm.alt) : null,
        ast: metricsForm.ast ? parseFloat(metricsForm.ast) : null,
        bilirubin: metricsForm.bilirubin ? parseFloat(metricsForm.bilirubin) : null,
        systolicBP: metricsForm.systolicBP ? parseInt(metricsForm.systolicBP) : null,
        diastolicBP: metricsForm.diastolicBP ? parseInt(metricsForm.diastolicBP) : null,
        energyLevel: metricsForm.energyLevel,
      },
      notes: metricsForm.notes,
      reportUrl: wellnessReportUrl,
      reportName: wellnessReportName,
    };

    setSubmittingWellness(true);
    try {
      const res = await api.post("/donor/wellness/log", payload);
      if (res.data.success) {
        toast.success("Wellness log entry saved successfully.");
        setIsWellnessModalOpen(false);
        // Reset form
        setMetricsForm({
          creatinine: '',
          gfr: '',
          alt: '',
          ast: '',
          bilirubin: '',
          systolicBP: '',
          diastolicBP: '',
          energyLevel: 5,
          notes: '',
        });
        setWellnessReportUrl('');
        setWellnessReportName('');
        fetchWellnessLogs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to log wellness metrics.");
    } finally {
      setSubmittingWellness(false);
    }
  };

  const handleWellnessReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setWellnessReportName(file.name);
    setIsUploadingReport(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        timeout: 60000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setWellnessReportUrl(res.data.url);
      toast.success("Lab report uploaded successfully.");
    } catch (err: any) {
      setWellnessReportName("");
      setWellnessReportUrl("");
      toast.error("Failed to upload lab report.");
    } finally {
      setIsUploadingReport(false);
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
        timeout: 60000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCertificateUrl(res.data.url);
    } catch (err: any) {
      setCertificateName("");
      setCertificateUrl("");
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
      showToast("Γ£ô Your readiness profile has been submitted successfully!");
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
      showToast("Γ£ô Availability cancelled successfully.");
      loadProfile();
    }
  };

  const handleRespond = useCallback(
    async (requestId: string, action: "ACCEPTED" | "DECLINED") => {
      setRespondingId(requestId);
      try {
        const res = await respond(requestId, action);
        if (res && res.success) {
          toast.success(`Request successfully ${action === "ACCEPTED" ? "accepted" : "declined"}!`);
        } else {
          toast.error("Failed to respond to request.");
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred.");
      } finally {
        refetch();
        setRespondingId(null);
      }
    },
    [respond, refetch]
  );

  const handleSendInterest = async (requestId: string) => {
    // Find the patient record to get waitlistId and hospitalId
    const patient = patients.find((p: any) => (p.id || p._id) === requestId);
    
    // Prefer the correct new endpoint that saves acceptedDonorId + donor identity
    const waitlistId = patient?.waitlistId;
    const hospitalId = patient?.hospitalId;

    try {
      if (waitlistId && hospitalId) {
        // Use the proper organ interest endpoint that sets acceptedDonorId + donorName/donorEmail
        const res = await api.post('/donor/organ/express-interest', { waitlistId, hospitalId });
        if (res.data.success) {
          setInterestedRequestIds((prev) => [...prev, requestId]);
          showToast("✅ Interest sent! The hospital has been notified.");
        }
      } else {
        // Fallback: old route for non-waitlist requests
        const res = await api.post(`/requests/${requestId}/interest`);
        if (res.data.success) {
          setInterestedRequestIds((prev) => [...prev, requestId]);
          showToast("✅ Interest sent! The hospital has been notified.");
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? "Failed to log interest.";
      showToast(`❌ ${msg}`);
    }
  };

  const isUserAvailable = profile && profile.isAvailable && profile.organsWillingToDonate.length > 0;

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Not scheduled yet";
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStepIndex = (status: string): number => {
    switch (status) {
      case "CLINICAL_TESTING":
        return 1;
      case "PENDING_LEGAL_APPROVAL":
        return 2;
      case "SURGERY_SCHEDULED":
        return 3;
      case "COMPLETED":
        return 4;
      default:
        return 0;
    }
  };

  const renderCooldownView = () => {
    const lastDonation = cooldown.lastDonation;
    const formattedCompDate = lastDonation ? new Date(lastDonation.surgicalOutcome?.surgeryCompletedAt || lastDonation.updatedAt || lastDonation.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "";

    const formattedCooldownEnd = cooldown.cooldownEnd ? cooldown.cooldownEnd.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "";

    const surgeryDate = lastDonation ? new Date(lastDonation.surgicalOutcome?.surgeryCompletedAt || lastDonation.updatedAt || lastDonation.createdAt) : new Date();
    const milestoneDates = {
      '1_MONTH': new Date(surgeryDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      '6_MONTH': new Date(surgeryDate.getTime() + 180 * 24 * 60 * 60 * 1000),
      '1_YEAR': new Date(surgeryDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      '2_YEAR': new Date(surgeryDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
    };

    const renderRecoveryGraph = () => {
      const isKidney = lastDonation?.organType === 'Kidney';
      const points = wellnessLogs
        .filter(log => isKidney ? (log.metrics?.gfr !== null) : (log.metrics?.alt !== null))
        .map((log) => ({
          date: new Date(log.loggedAt),
          val: isKidney ? log.metrics.gfr : log.metrics.alt,
        }));

      if (points.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-3xl text-center">
            <span className="material-symbols-outlined text-[32px] text-gray-400 mb-2">monitoring</span>
            <p className="text-xs text-gray-400 font-semibold">No recovery logs found for graph projection.</p>
            <p className="text-[10px] text-gray-400">Your health data points will populate a recovery curve here.</p>
          </div>
        );
      }

      // Viewport variables
      const svgW = 500;
      const svgH = 150;
      const padding = 20;

      // Max/min values for scaling
      const yMax = isKidney ? 120 : 100;
      const yMin = 0;
      
      const xCoords = points.map((_, i) => padding + (i * (svgW - 2 * padding)) / Math.max(1, points.length - 1));
      const yCoords = points.map(p => svgH - padding - ((p.val - yMin) * (svgH - 2 * padding)) / (yMax - yMin));

      let pathD = `M ${xCoords[0]} ${yCoords[0]}`;
      for (let i = 1; i < xCoords.length; i++) {
        pathD += ` L ${xCoords[i]} ${yCoords[i]}`;
      }

      return (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="text-[9px] bg-[#eef4e2] text-[#3b5e2b] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {isKidney ? "Kidney: GFR (mL/min/1.73m²)" : "Liver: ALT Panel (U/L)"}
              </span>
              <h4 className="text-xs font-bold text-slate-800 mt-1">Health Restoration Trend</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Timeline (logs chronologically)</span>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[320px] h-auto overflow-visible">
              {isKidney ? (
                <rect
                  x={padding}
                  y={svgH - padding - ((90 - yMin) * (svgH - 2 * padding)) / (yMax - yMin)}
                  width={svgW - 2 * padding}
                  height={((90 - yMin) * (svgH - 2 * padding)) / (yMax - yMin)}
                  fill="#10b981"
                  fillOpacity="0.04"
                />
              ) : (
                <rect
                  x={padding}
                  y={svgH - padding - ((56 - yMin) * (svgH - 2 * padding)) / (yMax - yMin)}
                  width={svgW - 2 * padding}
                  height={((56 - 7) * (svgH - 2 * padding)) / (yMax - yMin)}
                  fill="#10b981"
                  fillOpacity="0.04"
                />
              )}

              <line x1={padding} y1={padding} x2={svgW - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={svgH/2} x2={svgW - padding} y2={svgH/2} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={svgH - padding} x2={svgW - padding} y2={svgH - padding} stroke="#cbd5e1" strokeWidth="1.5" />

              <path d={pathD} fill="none" stroke="#3b5e2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={xCoords[idx]} cy={yCoords[idx]} r="5" fill="#3b5e2b" stroke="#ffffff" strokeWidth="2" />
                  <text x={xCoords[idx]} y={yCoords[idx] - 10} textAnchor="middle" className="text-[9px] fill-slate-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white p-1">
                    {p.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      );
    };

    return (
      <main className="p-6 lg:p-8 max-w-6xl mx-auto relative printable-content">
        <Toaster position="top-right" />
        
        {/* Style block for printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-certificate-container, .printable-certificate-container * {
              visibility: visible;
            }
            .printable-certificate-container {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) scale(1.1);
              width: 90%;
              max-width: 800px;
              margin: 0;
              padding: 40px;
              border: 12px double #d4af37;
              background-color: #fbf9f5;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Top Hero Banner of Gratitude */}
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-slate-800 rounded-[2rem] p-8 shadow-md relative overflow-hidden mb-8 text-white no-print">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-[#d4af37]/10 flex items-center justify-center shadow-lg border border-[#d4af37]/25 flex-shrink-0 animate-bounce animate-duration-3000">
              <span className="material-symbols-outlined text-[#d4af37] text-[40px]">workspace_premium</span>
            </div>
            <div>
              <span className="bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block border border-[#d4af37]/25">
                Altruism Registry Milestone
              </span>
              <h2 className="text-3xl font-serif font-bold tracking-tight mt-1">
                Thank You for Saving a Life
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mt-2 font-medium">
                Your selfless organ transplant surgery completed on <strong className="text-white">{formattedCompDate}</strong> at {lastDonation?.hospitalId?.name || lastDonation?.facility || "our coordinating medical facility"}. You have performed the ultimate act of humanity.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-8 no-print">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'certificate' ? 'border-[#3b5e2b] text-[#3b5e2b] font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Certificate of Honor
          </button>
          <button
            onClick={() => setActiveTab('wellness')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wellness' ? 'border-[#3b5e2b] text-[#3b5e2b] font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            Long-Term Wellness Tracker
          </button>
        </div>

        {activeTab === 'certificate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start no-print">
            {/* Left Column: Cooldown, History & Rules */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cooldown Progress Card */}
              <div className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 border border-amber-200">
                    <span className="material-symbols-outlined">hourglass_empty</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Registry Cooldown Period</h3>
                    <p className="text-[10px] text-gray-400">Post-transplant eligibility safety recovery timeline</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-amber-200/80 p-4 space-y-3 text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Remaining Cooldown Time</span>
                    <div className="text-4xl font-extrabold text-amber-900 tracking-tight">
                      {cooldown.remainingDays} <span className="text-sm font-bold text-amber-700">Days</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, (cooldown.remainingDays / (2 * 365)) * 100))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal pt-1">
                      Your next organ registry eligibility resets on <strong className="text-slate-800 font-bold">{formattedCooldownEnd}</strong>.
                    </p>
                  </div>

                  <div className="bg-[#fffbeb] border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-amber-700 mt-0.5">info</span>
                    <div>
                      <h5 className="text-xs font-bold text-amber-900 leading-none mb-1">Safety Lockouts & Rules</h5>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                        To protect living donor health, LifeLink enforces a mandatory 2-year recovery cooldown between separate organ donation registrations. 
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permanent Organ Lockout Directive */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-red-600 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Permanent Organ Exclusions</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Under transplant regulations, you are permanently excluded from selecting or donating the following organ types again:
                </p>
                <div className="space-y-2">
                  {pastDonations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50/50 border border-red-100 rounded-xl px-4 py-2.5">
                      <span className="text-xs font-bold text-red-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        {d.organType}
                      </span>
                      <span className="text-[9px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        Permanently Locked
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Completed Donations History */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Donation Legacy Logs</span>
                </h3>
                <div className="space-y-3">
                  {pastDonations.map((d, i) => {
                    const dDate = new Date(d.surgicalOutcome?.surgeryCompletedAt || d.updatedAt || d.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium"
                    });
                    return (
                      <div key={i} className="border border-slate-100 hover:border-slate-200 transition-colors p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{d.organType} Donation</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Surgery Completed on {dDate}</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Facility: {d.hospitalId?.name || d.facility}</p>
                        </div>
                        <button
                          onClick={() => setPreviewCertificateId(d._id || d.id)}
                          className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                          Certificate
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Printable Certificate Card */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {lastDonation && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      <span>Certificate of Honor</span>
                    </h3>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-[#3b5e2b] hover:bg-[#2d4721] text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      Print / Download Certificate
                    </button>
                  </div>
                  <div className={previewCertificateId ? "no-print" : "printable-certificate-container"}>
                    <CertificateOfHonor donation={lastDonation} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start no-print">
            {/* Left Column: Follow-up Timeline & Recovery Rules */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Follow-up Timeline */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3b5e2b]">event_repeat</span>
                    <span>Required Clinical Follow-ups</span>
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedMilestone('UNSCHEDULED');
                      setIsWellnessModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#3b5e2b]/10 hover:bg-[#3b5e2b]/20 text-[#3b5e2b] text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    Unscheduled Log
                  </button>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 ml-2">
                  {[
                    { key: '1_MONTH', label: '1 Month Check-up', desc: 'Incision check and baseline serum chemistry review.' },
                    { key: '6_MONTH', label: '6 Month Check-up', desc: 'Renal/Hepatic function adaptation tracking.' },
                    { key: '1_YEAR', label: '1 Year Assessment', desc: 'Annual comprehensive health check-up.' },
                    { key: '2_YEAR', label: '2 Year Assessment', desc: 'Final cooldown clearance review.' },
                  ].map((m) => {
                    const loggedEntry = wellnessLogs.find(log => log.milestone === m.key);
                    const targetDate = milestoneDates[m.key as keyof typeof milestoneDates];
                    const now = new Date();
                    const isOverdue = now > targetDate && !loggedEntry;

                    const prevMilestonesMap: Record<string, string> = {
                      '6_MONTH': '1_MONTH',
                      '1_YEAR': '6_MONTH',
                      '2_YEAR': '1_YEAR',
                    };
                    const prevKey = prevMilestonesMap[m.key];
                    const isLocked = prevKey ? !wellnessLogs.some(log => log.milestone === prevKey) : false;

                    return (
                      <div key={m.key} className="relative">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${
                          loggedEntry ? "bg-green-600" : isOverdue ? "bg-red-500 animate-pulse" : isLocked ? "bg-slate-200" : "bg-slate-300"
                        }`} />
                        
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span>{m.label}</span>
                              {loggedEntry ? (
                                <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-green-200">
                                  Logged
                                </span>
                              ) : isOverdue ? (
                                <span className="bg-red-50 text-red-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-red-200 animate-pulse">
                                  Overdue
                                </span>
                              ) : isLocked ? (
                                <span className="bg-slate-50 text-slate-400 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px] leading-none">lock</span> Locked
                                </span>
                              ) : (
                                <span className="bg-slate-50 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                                  Upcoming
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Target Date: {targetDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{m.desc}</p>

                            {/* Logged details preview */}
                            {loggedEntry && (
                              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px]">
                                {loggedEntry.metrics.gfr !== null && (
                                  <div>
                                    <span className="text-gray-400 font-bold block uppercase tracking-wider">eGFR</span>
                                    <span className="font-extrabold text-slate-800">{loggedEntry.metrics.gfr} mL/min</span>
                                  </div>
                                )}
                                {loggedEntry.metrics.creatinine !== null && (
                                  <div>
                                    <span className="text-gray-400 font-bold block uppercase tracking-wider">Creatinine</span>
                                    <span className="font-extrabold text-slate-800">{loggedEntry.metrics.creatinine} mg/dL</span>
                                  </div>
                                )}
                                {loggedEntry.metrics.alt !== null && (
                                  <div>
                                    <span className="text-gray-400 font-bold block uppercase tracking-wider">ALT</span>
                                    <span className="font-extrabold text-slate-800">{loggedEntry.metrics.alt} U/L</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-400 font-bold block uppercase tracking-wider">BP</span>
                                  <span className="font-extrabold text-slate-800">
                                    {loggedEntry.metrics.systolicBP || 'N/A'}/{loggedEntry.metrics.diastolicBP || 'N/A'}
                                  </span>
                                </div>
                                {loggedEntry.reportUrl && (
                                  <div className="col-span-2">
                                    <a
                                      href={loggedEntry.reportUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#3b5e2b] font-bold hover:underline flex items-center gap-1 mt-1.5"
                                    >
                                      <span className="material-symbols-outlined text-[12px]">description</span>
                                      View Lab Report
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {!loggedEntry && (
                            <button
                              disabled={isLocked}
                              onClick={() => {
                                if (isLocked) return;
                                setSelectedMilestone(m.key as any);
                                setIsWellnessModalOpen(true);
                              }}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all shadow-sm ${
                                isLocked 
                                  ? "bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed font-medium" 
                                  : "bg-white border border-[#d2e4c0] hover:bg-[#f8fbf4] text-[#3b5e2b] cursor-pointer"
                              }`}
                            >
                              Log Report
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recovery Rules Guidelines & Guidelines Box */}
              <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">health_and_safety</span>
                  <span>Post-Operative Recovery Guidelines</span>
                </h3>

                <div className="space-y-4 text-xs text-emerald-900 leading-relaxed font-sans">
                  <div className="flex gap-3 items-start bg-white/70 p-3.5 border border-emerald-50 rounded-2xl">
                    <span className="material-symbols-outlined text-emerald-600 mt-0.5">chair</span>
                    <div>
                      <h5 className="font-bold text-emerald-950 leading-none mb-1.5">1. Physical Activity Rest Limits</h5>
                      <p className="text-[11px] text-emerald-800">
                        Avoid heavy lifting (anything exceeding 10 lbs) for 6 to 8 weeks post-surgery to prevent abdominal hernias. Daily light walking is strongly encouraged to boost blood circulation.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-white/70 p-3.5 border border-emerald-50 rounded-2xl">
                    <span className="material-symbols-outlined text-emerald-600 mt-0.5">water_drop</span>
                    <div>
                      <h5 className="font-bold text-emerald-950 leading-none mb-1.5">2. High Hydration & Medication Rules</h5>
                      <p className="text-[11px] text-emerald-800">
                        Maintain 2 to 3 liters of water intake daily to flush your kidneys. <strong>Strict rule:</strong> Avoid NSAIDs (like Ibuprofen, Advil, Naproxen) as they strain your remaining kidney. Use Acetaminophen for pain if approved.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-white/70 p-3.5 border border-emerald-50 rounded-2xl">
                    <span className="material-symbols-outlined text-emerald-600 mt-0.5">clean_hands</span>
                    <div>
                      <h5 className="font-bold text-emerald-950 leading-none mb-1.5">3. Wound & Incision Management</h5>
                      <p className="text-[11px] text-emerald-800">
                        Keep the surgical incision site clean, dry, and exposed to air. Avoid tub baths, pools, or hot tubs until stitches are removed. Shower gently and pat the incision dry.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-red-50/50 p-3.5 border border-red-100 rounded-2xl">
                    <span className="material-symbols-outlined text-red-600 mt-0.5">warning</span>
                    <div>
                      <h5 className="font-bold text-red-950 leading-none mb-1.5 text-red-900">4. Red Flag Warning Symptoms</h5>
                      <p className="text-[11px] text-red-800">
                        Seek immediate emergency care if you notice: Fever above 101°F, sudden extreme pain, persistent vomiting, yellowing eyes/skin (jaundice), or reduced urine output.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: dynamic SVG graph recovery */}
            <div className="lg:col-span-6 space-y-6">
              {renderRecoveryGraph()}
              
              {/* Detailed tabular logged view */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                  <span>Health Parameters Journal</span>
                </h3>

                {wellnessLogs.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic text-center py-6">No wellness logs entered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Milestone</th>
                          <th className="py-2.5">eGFR/ALT</th>
                          <th className="py-2.5">BP</th>
                          <th className="py-2.5">Energy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {wellnessLogs.map((log, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="py-2.5">{new Date(log.loggedAt).toLocaleDateString(undefined, { dateStyle: 'short' })}</td>
                            <td className="py-2.5 text-[10px] text-slate-500 font-bold">{log.milestone.replace('_', ' ')}</td>
                            <td className="py-2.5 text-[#3b5e2b] font-bold">
                              {lastDonation?.organType === 'Kidney' ? `${log.metrics.gfr || 'N/A'} mL` : `${log.metrics.alt || 'N/A'} U/L`}
                            </td>
                            <td className="py-2.5">{log.metrics.systolicBP || 'N/A'}/{log.metrics.diastolicBP || 'N/A'}</td>
                            <td className="py-2.5 text-amber-600 font-bold">{log.metrics.energyLevel}/10</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wellness Modal */}
        {isWellnessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Close button */}
              <button
                onClick={() => setIsWellnessModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 border border-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="mb-6">
                <span className="bg-[#3b5e2b]/10 text-[#3b5e2b] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                  Wellness Journal Entry
                </span>
                <h3 className="text-xl font-serif font-black text-slate-900 mt-2">
                  {selectedMilestone === 'UNSCHEDULED' ? 'Unscheduled Health Log' : `Log ${selectedMilestone.replace('_', ' ')}`}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Enter your latest clinic parameters to trace your long-term restoration.
                </p>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 max-h-[60vh] pb-4">
                {/* Organ Specific Metrics */}
                {lastDonation?.organType === 'Kidney' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        eGFR (mL/min/1.73m²) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 95"
                        required
                        value={metricsForm.gfr}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, gfr: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Creatinine (mg/dL) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1.0"
                        required
                        value={metricsForm.creatinine}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, creatinine: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                  </div>
                ) : lastDonation?.organType === 'Liver' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        ALT (U/L) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 35"
                        required
                        value={metricsForm.alt}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, alt: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        AST (U/L) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        required
                        value={metricsForm.ast}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, ast: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Bilirubin (mg/dL) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 0.8"
                        required
                        value={metricsForm.bilirubin}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, bilirubin: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  // Generic / Other Organ
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        eGFR (mL/min/1.73m²)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={metricsForm.gfr}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, gfr: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Creatinine (mg/dL)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={metricsForm.creatinine}
                        onChange={(e) => setMetricsForm(prev => ({ ...prev, creatinine: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Blood Pressure */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={metricsForm.systolicBP}
                      onChange={(e) => setMetricsForm(prev => ({ ...prev, systolicBP: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={metricsForm.diastolicBP}
                      onChange={(e) => setMetricsForm(prev => ({ ...prev, diastolicBP: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                    />
                  </div>
                </div>

                {/* Energy Level Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Energy / Wellness Level
                    </label>
                    <span className="text-xs font-extrabold text-[#3b5e2b]">{metricsForm.energyLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={metricsForm.energyLevel}
                    onChange={(e) => setMetricsForm(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3b5e2b]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Recovery Notes & Symptoms
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter any notes on recovery, physical signs, or doctor feedback."
                    value={metricsForm.notes}
                    onChange={(e) => setMetricsForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#3b5e2b] transition-colors resize-none"
                  />
                </div>

                {/* Lab Report Upload */}
                <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Official Lab Report File (PDF/Image)
                  </span>
                  
                  {wellnessReportUrl ? (
                    <div className="flex items-center justify-between bg-[#f8fbf4] border border-[#d2e4c0] p-3 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-[#3b5e2b] flex-shrink-0 text-[18px]">verified_user</span>
                        <span className="text-xs font-bold text-slate-800 truncate">{wellnessReportName || 'report_uploaded.pdf'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWellnessReportUrl('');
                          setWellnessReportName('');
                        }}
                        className="text-[10px] text-red-600 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2.5 text-center">
                      <input
                        type="file"
                        id="wellness-report-file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleWellnessReportUpload}
                        disabled={isUploadingReport}
                      />
                      <label
                        htmlFor="wellness-report-file"
                        className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all flex items-center gap-1.5 ${
                          isUploadingReport
                            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-white border-[#d2e4c0] hover:bg-[#f8fbf4] text-[#3b5e2b]"
                        }`}
                      >
                        {isUploadingReport ? (
                          <>
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                            <span>Upload File</span>
                          </>
                        )}
                      </label>
                      <p className="text-[9px] text-slate-400 font-medium mt-2">
                        PDF or Images up to 10MB accepted
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-slate-100 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsWellnessModalOpen(false)}
                  className="w-1/2 px-5 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWellnessSubmit}
                  disabled={submittingWellness || isUploadingReport}
                  className="w-1/2 px-5 py-2.5 text-xs font-bold bg-[#3b5e2b] hover:bg-[#2d4721] text-white rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submittingWellness ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Log...</span>
                    </>
                  ) : (
                    <span>Submit Log</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  if (loadingActiveRequest) {
    return (
      <main className="p-6 lg:p-8 max-w-6xl mx-auto flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading your transplant journey...</p>
      </main>
    );
  }

  if (cooldown.active) {
    return renderCooldownView();
  }


  if (activeRequest) {
    const currentStep = getStepIndex(activeRequest.status);
    const hospital = activeRequest.hospitalId || {};
    const waitlist = activeRequest.waitlistId || {};

    const getDrawerContent = (stageNum: number) => {
      switch (stageNum) {
        case 1:
          return {
            title: "Step 1: Match Verified & Initiated",
            badge: "Verification Phase",
            badgeColor: "bg-[#eef4e2] text-[#3b5e2b]",
            overview: "In this initial stage, the transplant coordination committee matches your registered tissue typing and blood profile with a patient on the national organ transplant waitlist.",
            details: [
              {
                title: "HLA & Blood Compatibility",
                desc: "Medical teams verify that blood groups are fully compatible and analyze human leukocyte antigen (HLA) profiles to maximize the likelihood of long-term graft survival."
              },
              {
                title: "Transplant Case Manager Allocation",
                desc: "A dedicated Clinical Transplant Coordinator is assigned to manage your donor dossier, coordinate laboratory tests, and assist you with legal approvals."
              },
              {
                title: "Recipient Anonymity Protocols",
                desc: "To protect the privacy of both parties, the recipient's personal identity is kept confidential during initial matching stages, using waitlist identifiers."
              }
            ],
            faqs: [
              {
                q: "Can I know who the recipient is?",
                a: "During the initial phases, recipient details remain confidential. General compatibility information is shared, but full identifying details are protected."
              },
              {
                q: "What is my role at this stage?",
                a: "Your main role is to review matched parameters and confirm your interest in proceeding to clinical evaluation."
              }
            ]
          };
        case 2:
          return {
            title: "Step 2: Clinical & Laboratory Testing",
            badge: "Active Testing Phase",
            badgeColor: "bg-amber-100 text-amber-800",
            overview: "Comprehensive laboratory testing and physiological screening to ensure the transplant procedure is fully compatible and entirely safe for you.",
            details: [
              {
                title: "HLA Crossmatching & Tissue Matching",
                desc: "Your blood is mixed directly with the recipient's cells in a laboratory test to detect pre-existing antibodies that could cause immediate organ rejection."
              },
              {
                title: "Organ Specific Viability Screens",
                desc: "Includes imaging studies (ultrasound, MRI, CT scans) and functional indicators (e.g. kidney GFR, liver enzymes) to verify the donor organ is functioning optimally."
              },
              {
                title: "Cardiopulmonary & General Clearance",
                desc: "ECG, chest X-rays, and physical examinations are performed by independent medical experts to assure you are fit to undergo surgical procedures."
              }
            ],
            faqs: [
              {
                q: "Where do my clinical tests take place?",
                a: "All evaluations are scheduled at certified transplant centers or affiliated laboratories coordinated by your medical coordinator."
              },
              {
                q: "Who covers the cost of medical testing?",
                a: "All clinical test costs, checkups, and administrative evaluations are fully covered by the recipient's transplant fund or coordinating insurance."
              }
            ]
          };
        case 3:
          return {
            title: "Step 3: Ethical Board & Legal Approval",
            badge: "Regulatory Review Phase",
            badgeColor: "bg-purple-100 text-purple-800",
            overview: "Review by the State Authorization Committee and hospital ethics board to verify ethical compliance, altruistic intent, and legal consent directives.",
            details: [
              {
                title: "Independent Donor Advocacy",
                desc: "An independent advocate represents your interests during review panels to verify your decisions are made freely, with full knowledge, and without coercion."
              },
              {
                title: "Altruism & Voluntary Intent Verification",
                desc: "Ensures compliance with national laws. Organ donation must be entirely voluntary and altruistic; any commercial trade or financial exchange is strictly illegal."
              },
              {
                title: "Notarization of Final Documentation",
                desc: "All legal consent forms, medical release authorizations, and next-of-kin acknowledgments are notarized for regulatory clearance."
              }
            ],
            faqs: [
              {
                q: "Is a panel interview required?",
                a: "Yes, a brief interview is conducted by the ethics board to confirm that you fully understand the procedure and are proceeding voluntarily."
              },
              {
                q: "Can I withdraw my consent during this stage?",
                a: "Absolutely. You retain the unconditional legal right to withdraw your consent at any time prior to the actual surgery."
              }
            ]
          };
        case 4:
          return {
            title: "Step 4: Surgical Scheduling",
            badge: "Surgical Procurement Phase",
            badgeColor: "bg-blue-100 text-blue-800",
            overview: "Coordination of hospital operating rooms, procurement teams, transplant surgical units, and pre-surgical admission schedules.",
            details: [
              {
                title: "Admissions & Pre-op Instructions",
                desc: "Coordination of hospital room reservations, pre-operative dietary/fasting instructions, and isolation requirements to minimize infection risks."
              },
              {
                title: "Surgical Team Assembly",
                desc: "Coordinating separate surgical teams for organ procurement (donor) and transplantation (recipient) to ensure focus and medical safety."
              },
              {
                title: "Anesthesia Consultations",
                desc: "Final pre-surgical consultations with the anesthesiology team to review anesthesia choices and surgical pain-management plans."
              }
            ],
            faqs: [
              {
                q: "How long will I be hospitalized for the procedure?",
                a: "Donor hospital stays usually range from 2 to 5 days depending on the organ and surgical method (e.g. laparoscopic vs. open surgery)."
              },
              {
                q: "Can I bring a support person to the hospital?",
                a: "Yes, coordinating hospitals provide guest lodging and support services for a designated family member or support person."
              }
            ]
          };
        case 5:
          return {
            title: "Step 5: Post-Operative Care & Recovery",
            badge: "Recovery & Checkup Phase",
            badgeColor: "bg-emerald-100 text-emerald-800",
            overview: "Long-term monitoring of donor health, recovery milestone tracking, and hospital follow-up visits to ensure donor health remains excellent.",
            details: [
              {
                title: "Pain Management & Healing",
                desc: "Comprehensive outpatient follow-up care to manage post-surgical healing, surgical wound care, and physical recovery tracking."
              },
              {
                title: "Scheduled Recovery Checkups",
                desc: "Required clinical follow-ups scheduled at 1 month, 6 months, and 1 year to evaluate long-term physiological adaptation and donor wellness."
              },
              {
                title: "Independent Clinical Support",
                desc: "Continuous access to donor support networks, nutrition counseling, and physical therapy coordinates provided by LifeLink."
              }
            ],
            faqs: [
              {
                q: "How long does full recovery take?",
                a: "Most donors return to light desk activities within 2 weeks, and resume full physical activities and sports within 6 weeks."
              },
              {
                q: "Are there long-term health risks?",
                a: "Clinical statistics show that donor life expectancy is equivalent to the general population, but regular follow-ups are crucial to monitor adaptation."
              }
            ]
          };
        default:
          return null;
      }
    };

    const steps = [
      {
        title: "Match Verified & Initiated",
        desc: "Coordinating medical center verified matching criteria and initiated the transplantation path.",
        icon: "handshake",
        renderDetail: () => (
          <div className="text-[11px] text-gray-500 mt-1">
            Confirmed on {formatDate(activeRequest.createdAt || activeRequest.acceptedAt)}
          </div>
        )
      },
      {
        title: "Clinical & Laboratory Testing",
        desc: "Comprehensive cross-matching, HLA compatibility typing, and donor fitness evaluations.",
        icon: "biotech",
        renderDetail: () => {
          if (activeRequest.status === "CLINICAL_TESTING") {
            return (
              <div className="mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scheduled Test Date</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3b5e2b]">calendar_today</span>
                      {formatDate(activeRequest.clinicalEvaluation?.scheduledTestDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Testing Facility</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3b5e2b]">home_work</span>
                      {activeRequest.clinicalEvaluation?.testingFacility || hospital.name || "Coordinating Facility"}
                    </span>
                  </div>
                </div>
                {activeRequest.clinicalEvaluation?.donorInstructions && (
                  <div className="border-t border-slate-200/60 pt-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Special Instructions</span>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold mt-1 bg-white p-3 rounded-xl border border-slate-100">
                      {activeRequest.clinicalEvaluation.donorInstructions}
                    </p>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className="mt-2 p-4 bg-[#f1f7e8]/40 border border-[#e1ead2] rounded-2xl space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">HLA Match Score</span>
                    <span className="text-sm font-black text-[#3b5e2b] mt-0.5 block">
                      {activeRequest.clinicalEvaluation?.hlaMatchScore !== undefined ? `${activeRequest.clinicalEvaluation.hlaMatchScore} / 6` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Crossmatch Compatibility</span>
                    <span className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${
                      activeRequest.clinicalEvaluation?.bloodCrossmatch === 'COMPATIBLE_NEGATIVE' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {activeRequest.clinicalEvaluation?.bloodCrossmatch === 'COMPATIBLE_NEGATIVE' ? 'check_circle' : 'pending'}
                      </span>
                      {activeRequest.clinicalEvaluation?.bloodCrossmatch === 'COMPATIBLE_NEGATIVE' ? 'Compatible Negative' : 'Pending/Incompatible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Serology Clearance</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
                      {activeRequest.clinicalEvaluation?.serologyClear ? 'Cleared' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        }
      },
      {
        title: "Ethical Board & Legal Approval",
        desc: "Regulatory evaluation to verify voluntary altruistic intent and legal compliance.",
        icon: "gavel",
        renderDetail: () => {
          if (activeRequest.status === "PENDING_LEGAL_APPROVAL") {
            const hasSigned = activeRequest.legalAgreement?.donorSigned;
            return (
              <div className="mt-2 p-4 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 mt-0.5">gavel</span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">Ethics Panel Review & Legal Consent</h5>
                    <p className="text-[11px] text-amber-800 leading-normal mt-0.5">
                      The state authority requires a legally binding tripartite consent agreement signed by the donor, recipient, and the hospital.
                    </p>
                  </div>
                </div>
                
                {hasSigned ? (
                  <div className="border border-green-200 bg-green-50/40 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="bg-green-100 text-green-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                        Signed - Awaiting Hospital Verification
                      </span>
                      <p className="text-xs font-bold text-slate-800 mt-2">
                        Signed as: <span className="font-serif italic text-sm">{activeRequest.legalAgreement?.donorSignatureName}</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Date: {formatDate(activeRequest.legalAgreement?.donorSignatureDate)}
                      </p>
                    </div>
                    {activeRequest.legalAgreement?.donorSignatureData?.startsWith('data:image/') ? (
                      <img 
                        src={activeRequest.legalAgreement.donorSignatureData} 
                        alt="Donor Signature" 
                        className="h-10 border border-slate-200 bg-white p-1 rounded max-w-[120px]"
                      />
                    ) : (
                      <span className="text-xs font-serif italic border border-dashed border-slate-300 px-3 py-1 rounded bg-white font-semibold">
                        {activeRequest.legalAgreement?.donorSignatureName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSignModalOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_document</span>
                      Review & Sign Legal Consent Deed
                    </button>
                  </div>
                )}
              </div>
            );
          } else if (currentStep > 2) {
            return (
              <div className="mt-2 p-4 bg-[#f1f7e8]/40 border border-[#e1ead2] rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-0.5">verified_user</span>
                <div>
                  <h5 className="text-xs font-bold text-green-900">Legal Clearance Approved</h5>
                  <p className="text-[11px] text-green-800 leading-normal mt-0.5">
                    The donor-recipient matching profile has been legally notarized and approved by the State Ethics Review Board.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        }
      },
      {
        title: "Surgical Scheduling",
        desc: "Procurement surgery timeline scheduling and coordination of the transplant operating room.",
        icon: "calendar_month",
        renderDetail: () => {
          if (activeRequest.status === "SURGERY_SCHEDULED") {
            return (
              <div className="mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scheduled Surgery Date</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3b5e2b]">calendar_today</span>
                      {formatDate(activeRequest.surgicalOutcome?.surgeryStartedAt || activeRequest.time)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Transplant Facility</span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3b5e2b]">home_work</span>
                      {activeRequest.facility || hospital.name || "Coordinating Facility"}
                    </span>
                  </div>
                </div>
              </div>
            );
          } else if (currentStep > 3) {
            return (
              <div className="mt-2 p-4 bg-[#f1f7e8]/40 border border-[#e1ead2] rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                <div>
                  <h5 className="text-xs font-bold text-green-900">Procedure Completed</h5>
                  <p className="text-[11px] text-green-800 leading-normal mt-0.5">
                    Surgical procedures for organ procurement and transplantation have been successfully performed at {activeRequest.facility || "the designated medical center"}.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        }
      },
      {
        title: "Post-Operative Care & Recovery",
        desc: "Monitoring recovery stats and hospital follow-ups after transplant procedures.",
        icon: "healing",
        renderDetail: () => {
          if (activeRequest.status === "COMPLETED") {
            return (
              <div className="mt-2 p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 animate-pulse">favorite</span>
                  Successful Transplant Procedure
                </h5>
                <p className="text-[11px] text-emerald-900 leading-normal">
                  We express our deepest gratitude for your life-saving organ donation. The coordinating hospital will track your recovery checkups. Please contact your coordinator for discharge notes and physical therapy guidelines.
                </p>
                {activeRequest.surgicalOutcome?.complications && (
                  <div className="border-t border-emerald-100/60 pt-2 mt-2">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Clinical Notes</span>
                    <p className="text-xs text-emerald-950 font-semibold leading-relaxed mt-0.5">
                      {activeRequest.surgicalOutcome.complications}
                    </p>
                  </div>
                )}
              </div>
            );
          }
          return null;
        }
      }
    ];

    return (
      <main className="p-6 lg:p-8 max-w-6xl mx-auto relative">
        <Toaster position="top-right" />
        
        {/* Banner header */}
        <div className="bg-gradient-to-br from-[#3b5e2b] to-[#5b8a3e] border border-[#3b5e2b] rounded-[2rem] p-8 shadow-md relative overflow-hidden mb-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#cbf275] opacity-15 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-4 flex-wrap">
              <div className="w-12 h-12 rounded-2xl bg-[#cbf275] flex items-center justify-center shadow-md border border-[#bce366]">
                <span className="material-symbols-outlined text-[#2d3a24] text-[24px]">volunteer_activism</span>
              </div>
              <div>
                <span className="bg-[#cbf275] text-[#2d3a24] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                  Active Transplant Journey
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-0.5">
                  Transplant Progress Telemetry
                </h2>
              </div>
            </div>
            <p className="text-sm text-green-50 max-w-2xl leading-relaxed">
              Your interest in organ donation has been accepted by the hospital. Follow the real-time clinical milestones below as we coordinate the transplant procedure.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline Milestones */}
          <div className="lg:col-span-7 bg-white border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b5e2b]">insights</span>
              <span>Clinical Journey Milestones</span>
            </h3>

            <div className="relative pl-8 border-l-2 border-slate-100 space-y-8 ml-3">
              {steps.map((step, idx) => {
                const isCompleted = currentStep > idx;
                const isActive = currentStep === idx;
                const isUpcoming = currentStep < idx;

                return (
                  <div key={idx} className="relative group">
                    
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-all ${
                      isCompleted ? "bg-[#5b8a3e]" :
                      isActive ? "bg-amber-500 animate-pulse animate-duration-1000" :
                      "bg-slate-100"
                    }`}>
                      <span className={`material-symbols-outlined text-[16px] ${
                        isCompleted ? "text-white" :
                        isActive ? "text-white font-bold" :
                        "text-slate-400"
                      }`}>
                        {isCompleted ? "check" : step.icon}
                      </span>
                    </div>

                    {/* Step Content Card */}
                    <div 
                      onClick={() => setActiveDrawerStage(idx + 1)}
                      className={`border rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-[#5b8a3e]/40 transition-all duration-200 bg-white ${
                        isActive ? "border-amber-400 bg-amber-50/5 shadow-sm" :
                        isCompleted ? "border-[#e1ead2] bg-[#f1f7e8]/10" :
                        "border-slate-100 opacity-60 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-bold ${
                              isActive ? "text-amber-700 font-bold" :
                              isCompleted ? "text-[#3b5e2b]" :
                              "text-slate-500 font-bold"
                            }`}>
                              Step {idx + 1}: {step.title}
                            </h4>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                              isCompleted ? "bg-[#eef4e2] text-[#3b5e2b]" :
                              isActive ? "bg-amber-100 text-amber-800" :
                              "bg-slate-100 text-slate-400"
                            }`}>
                              {isCompleted ? "Completed" : isActive ? "Active Phase" : "Upcoming"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-normal">
                            {step.desc}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-[#5b8a3e] transition-colors text-[20px] select-none">
                          info
                        </span>
                      </div>

                      {/* Detail Render */}
                      {(isCompleted || isActive) && step.renderDetail()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Recipient info */}
            <div className="bg-[#fcfdfa] border border-[#e1ead2] rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#3b5e2b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Recipient Compatibility Info</span>
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Recipient Initials</span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                        {waitlist.fullName || activeRequest.patientName || "Confidential Match"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Requested Organ</span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                        {waitlist.requiredOrgan || activeRequest.organType || "Organ"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Blood Group</span>
                      <span className="text-xs font-bold text-gray-800 mt-0.5 block bg-[#eef4e2]/60 border border-[#d2e4c0] px-2 py-0.5 rounded inline-block">
                        {waitlist.bloodGroup || activeRequest.bloodType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Urgency Status</span>
                      <span className={`text-[10px] font-bold mt-0.5 inline-block px-2 py-0.5 rounded uppercase tracking-wider ${
                        (waitlist.urgency || activeRequest.urgency) === "Critical" ? "bg-red-50 text-red-600 border border-red-100" :
                        (waitlist.urgency || activeRequest.urgency) === "High" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                        "bg-green-50 text-green-600 border border-green-100"
                      }`}>
                        {(waitlist.urgency || activeRequest.urgency) || "Medium"} Urgency
                      </span>
                    </div>
                  </div>
                  {waitlist.medicalCertificateUrl && (
                    <div className="border-t border-slate-100 pt-3 mt-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Medical Documentation</span>
                      <a
                        href={waitlist.medicalCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#3b5e2b] bg-[#eef4e2]/60 hover:bg-[#eef4e2] border border-[#d2e4c0] rounded-xl px-4 py-2 transition-all shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        View Patient Health Certificate
                      </a>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  * LifeLink encrypts full patient demographics prior to clinical approval stages to protect donor-recipient confidentiality.
                </p>
              </div>
            </div>

            {/* Hospital Contact Info */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                <span>Coordinating Hospital</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Medical Facility</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{hospital.name || activeRequest.facility || "Coordinating Facility"}</span>
                </div>
                {hospital.address && (
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Location Address</span>
                    <span className="font-semibold text-gray-600 mt-0.5 block leading-normal">{hospital.address}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {hospital.phone && (
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Phone Contact</span>
                      <span className="font-bold text-[#3b5e2b] mt-0.5 block">{hospital.phone}</span>
                    </div>
                  )}
                  {hospital.email && (
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="font-bold text-[#3b5e2b] mt-0.5 block break-all">{hospital.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Donor Support & Assistance FAQs */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                <span>Donor Assistance</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">What are the dietary prep rules for lab test evaluations?</h4>
                  <p className="text-gray-500 leading-normal">Fast for 8 hours before the blood crossmatching tests. Stay hydrated and avoid strenuous exercises.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-950 font-sans">Can I withdraw my donation intent later?</h4>
                  <p className="text-gray-500 leading-normal">Yes. You retain the absolute legal right to withdraw consent anytime prior to surgery. Please notify your coordinator immediately if you wish to withdraw.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Who covers medical testing and surgery costs?</h4>
                  <p className="text-gray-500 leading-normal">All clinical screenings, evaluations, surgeries, and recovery checkups are fully covered by the recipient's transplant insurance and coordinating hospital funding.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Side Drawer Panel */}
        {activeDrawerStage !== null && (() => {
          const content = getDrawerContent(activeDrawerStage);
          if (!content) return null;
          return (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <div 
                onClick={() => setActiveDrawerStage(null)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
              />
              
              {/* Drawer Body */}
              <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
                
                {/* Background Image / Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-no-repeat bg-center opacity-[0.09] pointer-events-none z-0"
                  style={{ backgroundImage: `url('/images/sidepage_mesh_bg.png')` }}
                />

                {/* Close Button */}
                <button
                  onClick={() => setActiveDrawerStage(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 border border-slate-100 z-10"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* Content Wrapper */}
                <div className="relative z-10 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mt-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${content.badgeColor}`}>
                      {content.badge}
                    </span>
                    <h3 className="text-2xl font-serif font-black text-slate-900 mt-3 leading-tight">
                      {content.title}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-slate-100 my-6" />

                  {/* Stage Overview */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Stage Overview</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium font-sans">
                        {content.overview}
                      </p>
                    </div>

                    {/* Stage Details */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Stage Milestones</h4>
                      {content.details.map((detail, dIdx) => (
                        <div key={dIdx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#eef4e2] border border-[#d2e4c0] flex items-center justify-center flex-shrink-0 text-[#3b5e2b] font-bold text-xs">
                            {dIdx + 1}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 leading-none mb-1.5">{detail.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">{detail.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* FAQs */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Frequently Asked Questions</h4>
                      {content.faqs.map((faq, fIdx) => (
                        <div key={fIdx} className="border-b border-slate-100 pb-4 last:border-0">
                          <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-start gap-1">
                            <span className="text-[#5b8a3e]">Q:</span>
                            <span>{faq.q}</span>
                          </h5>
                          <p className="text-xs text-slate-500 leading-relaxed pl-3 border-l-2 border-[#eef4e2]">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        
        {/* Donor Signature Modal */}
        <DonorSignatureModal 
          isOpen={isSignModalOpen} 
          onClose={() => setIsSignModalOpen(false)} 
          request={activeRequest} 
          onSuccess={fetchActiveRequest} 
        />
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto relative">
      <Toaster position="top-right" />
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
                    setIsGuidelinesAccepted(false);
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
              <OrganPreferenceSelector selected={draftOrgans} onChange={setDraftOrgans} disabledOrgans={pastDonations.map(d => d.organType)} />
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
                    const patientId = patient.id || patient._id;
                    const isInterested = interestedRequestIds.includes(patientId);
                    const isExpanded = expandedPatientId === patientId;
                    return (
                      <div
                        key={patientId}
                        onClick={() => setExpandedPatientId(isExpanded ? null : patientId)}
                        className={`border rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
                          isExpanded
                            ? "border-[#3b5e2b] bg-slate-50 shadow-md"
                            : "border-gray-100 hover:border-[#d2e4c0] bg-slate-50/30 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-2 flex-wrap">
                          <div>
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <span className="text-[10px] bg-[#eef4e2] text-[#3b5e2b] font-bold px-2.5 py-0.5 rounded font-label-caps uppercase">
                                {patient.organType}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded font-label-caps uppercase ${
                                patient.urgency === "Critical" ? "bg-red-50 text-red-600 border border-red-100" :
                                patient.urgency === "High" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                "bg-green-50 text-green-600 border border-green-100"
                              }`}>
                                {patient.urgency} Urgency
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-gray-900">
                              Recipient: {patient.patientName || "Unknown"} ({patient.gender || "Unknown"}, {patient.age || 0} yrs)
                            </h4>
                            <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                              Hospital: <span className="font-semibold text-gray-700">{patient.facility || "Coordinating Medical Center"}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-[#5b8a3e] font-bold select-none mt-1 sm:mt-0">
                            <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                            <span
                              className="material-symbols-outlined text-[16px] transition-transform duration-200"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Collapsible Details Panel */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Blood Group</span>
                                <span className="font-bold text-gray-800 bg-[#eef4e2]/60 border border-[#d2e4c0] px-2.5 py-1 rounded-lg">
                                  {patient.bloodGroup}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Required Organ</span>
                                <span className="font-semibold text-gray-700">{patient.organType || "Organ"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Contact Phone</span>
                                <span className="font-semibold text-gray-700">{patient.contactPhone || "Available on match confirmation"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Hospital Contact</span>
                                <span className="font-bold text-[#3b5e2b]">{patient.hospitalPhone || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Registered Date</span>
                                <span className="font-semibold text-gray-700">
                                  {patient.registeredDate ? new Date(patient.registeredDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "Recently"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Emergency Level</span>
                                <span className="font-bold text-gray-700">{patient.urgency || "Standard"}</span>
                              </div>
                            </div>
                            {/* Medical History & Comorbidities */}
                            {(patient.medicalHistory || patient.comorbidities) && (
                              <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {patient.medicalHistory && (
                                  <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Medical History</span>
                                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                                      {patient.medicalHistory}
                                    </p>
                                  </div>
                                )}
                                {patient.comorbidities && (
                                  <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Comorbidities</span>
                                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                                      {patient.comorbidities}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Legacy Notes */}
                            {!patient.medicalHistory && !patient.comorbidities && patient.notes && (
                              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Hospital Intake Notes</span>
                                <p className="text-xs text-gray-600 leading-relaxed italic">
                                  &ldquo;{patient.notes}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Medical Certificate */}
                            {patient.medicalCertificateUrl && (
                              <div className="border-t border-gray-100 pt-4 mt-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Medical Documentation</span>
                                <a
                                  href={patient.medicalCertificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-[#3b5e2b] bg-[#eef4e2]/60 hover:bg-[#eef4e2] border border-[#d2e4c0] rounded-xl px-4 py-2 transition-all shadow-sm cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">description</span>
                                  View Medical Fitness Certificate
                                </a>
                              </div>
                            )}

                            <div className="flex justify-end pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendInterest(patientId);
                                }}
                                disabled={isInterested}
                                className={`text-xs font-bold px-6 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-2 ${
                                  isInterested
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#3b5e2b] text-white hover:bg-[#2d4721] cursor-pointer"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isInterested ? "check_circle" : "volunteer_activism"}
                                </span>
                                {isInterested ? "Interest Sent" : "Send Interest"}
                              </button>
                            </div>
                          </div>
                        )}
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

      {/* Donation History / Legacy Section for General view (post-cooldown) */}
      {pastDonations.length > 0 && (
        <div className="mt-12 border-t border-slate-100 pt-10 no-print">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3b5e2b]">workspace_premium</span>
            <span>Your Donation Legacy &amp; Certificates of Honor</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pastDonations.map((d, i) => {
              const dDate = new Date(d.surgicalOutcome?.surgeryCompletedAt || d.updatedAt || d.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium"
              });
              return (
                <div key={i} className="border border-slate-100 bg-[#fbfdf9] hover:bg-[#fbfdf9]/80 transition-colors p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="bg-[#eef4e2] text-[#3b5e2b] text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                        {d.organType} Donated
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{dDate}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                      Transplant successfully performed at {d.hospitalId?.name || d.facility || "Coordinating Center"}.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewCertificateId(d._id || d.id)}
                    className="w-full text-center text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                    View Certificate of Honor
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewCertificateId && (() => {
        const donation = pastDonations.find(d => (d._id || d.id) === previewCertificateId);
        if (!donation) return null;
        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto no-print">
            <div className="bg-white rounded-[2rem] border border-[#d2e4c0] shadow-2xl max-w-3xl w-full p-8 relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Close button */}
              <button
                onClick={() => setPreviewCertificateId(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 border border-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              
              <div className="flex justify-between items-center mb-6 pr-10">
                <div>
                  <h3 className="text-lg font-serif font-black text-gray-950">Official Certificate Preview</h3>
                  <p className="text-xs text-gray-500">View or print your lifesaving contribution citation</p>
                </div>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-[#3b5e2b] hover:bg-[#2d4721] text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Certificate
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
                <div className="printable-certificate-container">
                  <CertificateOfHonor donation={donation} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                    <OrganPreferenceSelector selected={selectedOrgans} onChange={setSelectedOrgans} disabledOrgans={pastDonations.map(d => d.organType)} />
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
                            <p className="text-[10px] text-[#5b8a3e] font-semibold mt-1">Γ£ô Uploaded successfully</p>
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

                    {/* Legal Consent Checkbox & Guidelines Red Link */}
                    <div className="mt-6 border-t border-slate-100 pt-4 flex items-start gap-2.5 bg-slate-50/40 p-4 rounded-2xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="consent-checkbox"
                        checked={isGuidelinesAccepted}
                        onChange={(e) => setIsGuidelinesAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#3b5e2b] border-gray-300 rounded focus:ring-[#3b5e2b] cursor-pointer"
                      />
                      <label htmlFor="consent-checkbox" className="text-[11px] text-gray-500 leading-normal select-none">
                        I confirm that I have read, understood, and agreed to the{" "}
                        <span
                          onClick={() => setIsGuidelinesModalOpen(true)}
                          className="text-red-600 hover:text-red-700 underline font-bold cursor-pointer transition-colors"
                        >
                          Organ Donation Guidelines & Legal Consent Statement
                        </span>
                        . Ticking this box is required to register as an available donor.
                      </label>
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
                  disabled={isSaving || isUploading || !isGuidelinesAccepted}
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

      {/* PROFESSIONAL ORGAN DONATION GUIDELINES & LEGAL CONSENT MODAL */}
      {isGuidelinesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-red-100 shadow-2xl max-w-lg w-full p-8 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Title */}
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-xl font-serif font-black text-gray-950 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[24px]">gavel</span>
                <span>Organ Donation Guidelines &amp; Legal Consent</span>
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Please review the official regulatory terms before registering.</p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs text-gray-600 space-y-4 leading-relaxed my-2">
              <section>
                <h5 className="font-bold text-gray-900 mb-1">1. Voluntary Altruistic Intent</h5>
                <p>
                  By registering, you confirm that your decision to donate is entirely voluntary and altruistic. 
                  Any exchange of monetary compensation, rewards, or valuable consideration in connection with 
                  this organ donation is strictly illegal under the Organ Transplant Act and subject to severe prosecution.
                </p>
              </section>

              <section>
                <h5 className="font-bold text-gray-900 mb-1">2. Medical Screening &amp; Testing Consent</h5>
                <p>
                  You agree to undergo comprehensive medical screening, including HLA (tissue typing) checks, infectious disease panels, 
                  and renal/hepatic clinical evaluations. These screens ensure safety for both donor and recipient. 
                  All results will be held securely in accordance with medical confidentiality standards.
                </p>
              </section>

              <section>
                <h5 className="font-bold text-gray-900 mb-1">3. Right to Withdraw Consent</h5>
                <p>
                  You retain the absolute, unconditional right to cancel your donor availability and withdraw your consent 
                  at any time prior to the surgical transplant procedure. Doing so is simple and can be done instantly 
                  via your Registry Status dashboard.
                </p>
              </section>

              <section>
                <h5 className="font-bold text-gray-950 mb-1">4. Matching &amp; Allocation Protocol</h5>
                <p>
                  Recipient matching is based strictly on clinical compatibility metrics (blood group, tissue typing, size) 
                  and medical urgency ratings. Coordination is handled by certified medical facilities only.
                </p>
              </section>

              <section>
                <h5 className="font-bold text-gray-950 mb-1">5. Final Legal Declarations</h5>
                <p>
                  You declare that the health information you provided is accurate to the best of your knowledge. 
                  You understand that misleading medical statements could lead to post-matching complications.
                </p>
              </section>
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsGuidelinesModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsGuidelinesAccepted(true);
                  setIsGuidelinesModalOpen(false);
                }}
                className="px-6 py-2.5 text-xs font-bold bg-[#3b5e2b] text-white rounded-full hover:bg-[#2d4721] transition-colors shadow-sm"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// CERTIFICATE OF HONOR
// ─────────────────────────────────────────────

function CertificateOfHonor({ donation }: { donation: any }) {
  const compDate = new Date(donation.surgicalOutcome?.surgeryCompletedAt || donation.updatedAt || donation.createdAt);
  const formattedDate = compDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const donationId = donation._id || donation.id || "XXXX";
  const serialId = `LL-ORG-${donationId.toString().substring(Math.max(0, donationId.toString().length - 6)).toUpperCase()}`;

  return (
    <div className="printable-certificate relative bg-[#fbf9f5] border-[12px] border-double border-[#d4af37] p-8 sm:p-12 md:p-16 rounded-xl shadow-lg text-center overflow-hidden max-w-3xl mx-auto my-6 font-serif">
      {/* Ornamental Corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#d4af37] opacity-60" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#d4af37] opacity-60" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#d4af37] opacity-60" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#d4af37] opacity-60" />

      {/* Watermark Logo background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 select-none">
        <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Emblem */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#aa7c11] rounded-full flex items-center justify-center shadow-md border-4 border-white mb-4">
          <span className="material-symbols-outlined text-white text-[28px]">workspace_premium</span>
        </div>

        {/* Certificate Title */}
        <h2 className="text-[#aa7c11] text-[10px] font-black uppercase tracking-[0.25em] mb-1 font-sans">
          National Organ Donor Registry
        </h2>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-wide font-serif mb-4">
          Certificate of Honor
        </h1>

        {/* Citation text */}
        <p className="text-[10px] text-slate-500 italic max-w-md leading-relaxed font-sans mb-6">
          This citation is solemnly awarded to acknowledge the extraordinary altruism and heroic contribution of a living donor.
        </p>

        <p className="text-[10px] text-slate-400 font-sans uppercase tracking-widest mb-1">
          Presented to
        </p>
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 border-b border-[#e5d5be] px-6 pb-1 inline-block italic font-serif my-1">
          {donation.donorName || "An Altruistic Hero"}
        </p>

        <p className="text-xs text-slate-600 leading-relaxed max-w-lg mt-4 mb-6 font-sans font-medium">
          In deepest gratitude for the noble donation of a <span className="font-bold text-[#3b5e2b] bg-[#eef4e2] px-2 py-0.5 rounded">{donation.organType}</span> organ,
          successfully transplanted at <span className="font-bold text-slate-800">{donation.hospitalId?.name || donation.facility || "a coordinating medical center"}</span> on {formattedDate}.
          Your compassionate gift has restored health, renewed hope, and saved a precious human life.
        </p>

        {/* Signatures and Seal */}
        <div className="w-full grid grid-cols-3 gap-2 items-end mt-4 mb-4">
          {/* Sign 1 */}
          <div className="flex flex-col items-center">
            <div className="font-serif italic text-sm text-slate-800 select-none py-1 border-b border-slate-300 w-full text-center max-w-[120px] font-semibold">
              Dr. Sarah Mercer
            </div>
            <span className="text-[8px] text-slate-400 font-sans uppercase tracking-wider mt-1">
              Chief Medical Director
            </span>
          </div>

          {/* Golden Seal */}
          <div className="flex justify-center relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] flex items-center justify-center p-0.5 bg-amber-50">
              <div className="w-full h-full rounded-full border border-dashed border-[#d4af37] flex flex-col items-center justify-center text-[#aa7c11]">
                <span className="text-[7px] font-black tracking-tighter uppercase leading-none">LIFELINK</span>
                <span className="text-[5px] font-bold uppercase tracking-widest mt-0.5">SEAL</span>
              </div>
            </div>
          </div>

          {/* Sign 2 */}
          <div className="flex flex-col items-center">
            <div className="font-serif italic text-sm text-slate-800 select-none py-1 border-b border-slate-300 w-full text-center max-w-[120px] font-semibold">
              Prof. Aaron Vance
            </div>
            <span className="text-[8px] text-slate-400 font-sans uppercase tracking-wider mt-1">
              Transplant Committee Head
            </span>
          </div>
        </div>

        {/* Certificate Metadata */}
        <div className="text-[8px] text-slate-400 font-sans flex justify-between w-full border-t border-[#f0e6d6] pt-3 mt-1">
          <span>Certificate Serial ID: <strong className="text-slate-600 font-mono">{serialId}</strong></span>
          <span>LifeLink Foundation Registry</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DONOR SIGNATURE MODAL
// ─────────────────────────────────────────────

interface SignModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSuccess: () => void;
}

function DonorSignatureModal({ isOpen, onClose, request, onSuccess }: SignModalProps) {
  const [mode, setMode] = useState<'type' | 'draw'>('type');
  const [typedName, setTypedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // dark navy slate
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async () => {
    let signatureData = '';
    let signatureName = '';

    if (mode === 'type') {
      if (!typedName.trim()) {
        alert('Please type your legal name to sign.');
        return;
      }
      signatureName = typedName.trim();
      signatureData = `TEXT:${typedName.trim()}`;
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Check if canvas is empty
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert('Please draw your signature first.');
        return;
      }
      
      signatureName = request.donorName || 'Donor Signature';
      signatureData = canvas.toDataURL('image/png');
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/donor/organ/active-request/sign-legal', {
        signatureName,
        signatureData,
      });

      if (response.data.success) {
        toast.success('Consent deed signed successfully.');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to submit legal signature.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error signing consent deed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hospital = request.hospitalId || {};
  const waitlist = request.waitlistId || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[2rem] border border-[#d2e4c0] shadow-2xl max-w-2xl w-full p-8 relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 border border-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
            <span className="material-symbols-outlined text-red-600">edit_document</span>
          </div>
          <div>
            <h3 className="text-xl font-serif font-black text-gray-950 uppercase tracking-tight">Legal Consent Deed</h3>
            <p className="text-xs text-gray-500">Milestone 3: Regulatory Verification Directive</p>
          </div>
        </div>

        {/* Modal Scrollable Deed */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-6 rounded-2xl border border-slate-100 max-h-[50vh]">
          <div className="text-center font-bold text-sm text-slate-900 border-b border-slate-200 pb-3 mb-4 uppercase tracking-wider">
            ORGAN TRANSPLANT DIRECT CONSENT FORM
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Donor (Donor Name)</span>
              <span className="font-bold text-slate-800">{request.donorName || "Voluntary Donor"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Recipient Initials</span>
              <span className="font-bold text-slate-800">{waitlist.fullName || request.patientName || "Confidential Match"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Organ Intended</span>
              <span className="font-bold text-slate-800">{waitlist.requiredOrgan || request.organType}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Coordinating Center</span>
              <span className="font-bold text-slate-800">{hospital.name || request.facility}</span>
            </div>
          </div>

          <p className="font-bold text-slate-800 uppercase tracking-wider mt-4">Statutory Declaration</p>
          
          <p>
            I, <span className="font-bold text-slate-900">{request.donorName || "the undersigned"}</span>, hereby confirm and declare that I have voluntarily agreed to donate my <span className="font-bold text-slate-900">{waitlist.requiredOrgan || request.organType}</span> for transplant purposes.
          </p>
          
          <p>
            I state under penalty of law that this donation is made purely out of altruistic, humanitarian considerations. I have not received, nor have I been promised, any financial compensation, reward, commercial consideration, or trade value in exchange for this donation. Any financial exchange for organ procurement is strictly illegal and punishable by law.
          </p>
          
          <p>
            I declare that I have been thoroughly screened, evaluated, and educated on the medical risks, surgical procedures, side-effects, and recovery protocols. I understand that I hold the absolute legal right to withdraw my donation consent at any stage prior to the commencement of the procurement surgery.
          </p>

          <p className="italic text-slate-500 border-t border-slate-200 pt-3">
            By signing below, I certify that I have read the terms above and execute this legal consent deed voluntarily.
          </p>
        </div>

        {/* Signature Tab Selector */}
        <div className="mt-6">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setMode('type')}
              className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 ${
                mode === 'type' ? 'border-[#3b5e2b] text-[#3b5e2b]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Type Signature
            </button>
            <button
              onClick={() => setMode('draw')}
              className={`pb-2 px-4 text-xs font-bold transition-all border-b-2 ${
                mode === 'draw' ? 'border-[#3b5e2b] text-[#3b5e2b]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Draw Signature
            </button>
          </div>

          {mode === 'type' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Type Your Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#3b5e2b] transition-colors"
                />
              </div>

              {typedName && (
                <div className="border border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block text-center">Preview Cursive Signature</span>
                  <div className="font-serif italic text-3xl text-slate-900 select-none tracking-wide py-2 font-medium">
                    {typedName}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Draw Signature inside the Box</span>
              <div className="relative border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-40 w-full">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                <button
                  onClick={clearCanvas}
                  className="absolute bottom-3 right-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[12px]">delete</span>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5"
          >
            {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
}
