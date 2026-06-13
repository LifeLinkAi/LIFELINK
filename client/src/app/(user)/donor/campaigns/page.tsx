"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";

interface Campaign {
  _id: string;
  title: string;
  type: "ROUTINE" | "EMERGENCY" | "AWARENESS";
  status: "DRAFT" | "ACTIVE" | "UPCOMING" | "ENDED";
  hospital: string;
  venueType: "HOSPITAL" | "SCHOOL" | "PUBLIC_PLACE" | "OFFICE" | "COMMUNITY_CENTER";
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  bloodGroups: string[];
  donorsTarget: number;
  donorsRegistered: number;
  donationsCollected: number;
  description: string;
  imageUrl?: string;
}

interface Registration {
  _id: string;
  campaignId: string | Campaign;
  donorId: string;
  status: "REGISTERED" | "ATTENDED" | "ABSENT" | "DEFERRED";
  donationUnits: number;
  staffNotes?: string;
  createdAt: string;
}

export default function DonorCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filter, setFilter] = useState<"ALL" | "MY_REGISTRATIONS">("ALL");

  const eligibility = useDonorEligibility();
  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const isBlocked = hasRecord && !eligibility.isEligible;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, regRes] = await Promise.all([
        api.get("/campaigns"),
        api.get("/campaigns/my-registrations"),
      ]);
      setCampaigns(campRes.data || []);
      setRegistrations(regRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching campaigns data:", error);
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (campaignId: string) => {
    if (isBlocked) {
      toast.error(`You are ineligible due to the 56-day cooldown. Unlock on ${eligibility.eligibleDate}.`);
      return;
    }
    try {
      setSubmittingId(campaignId);
      await api.post(`/campaigns/${campaignId}/register`);
      toast.success("Successfully registered for campaign!");
      await fetchData();
      // Update selected campaign in state to refresh the sidebar UI
      const updated = campaigns.find(c => c._id === campaignId);
      if (updated) {
        setSelectedCampaign({
          ...updated,
          donorsRegistered: (updated.donorsRegistered || 0) + 1
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    try {
      setSubmittingId(campaignId);
      await api.post(`/campaigns/${campaignId}/cancel`);
      toast.success("Registration cancelled successfully.");
      await fetchData();
      // Update selected campaign in state to refresh the sidebar UI
      const updated = campaigns.find(c => c._id === campaignId);
      if (updated) {
        setSelectedCampaign({
          ...updated,
          donorsRegistered: Math.max(0, (updated.donorsRegistered || 0) - 1)
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel registration.");
    } finally {
      setSubmittingId(null);
    }
  };

  const getRegistrationForCampaign = (campaignId: string) => {
    return registrations.find((r) => {
      const cId = typeof r.campaignId === "object" ? r.campaignId._id : r.campaignId;
      return cId === campaignId;
    });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getVenueTypeLabel = (type: string) => {
    switch (type) {
      case "HOSPITAL":
        return "Hospital Venue";
      case "SCHOOL":
        return "School Campus";
      case "PUBLIC_PLACE":
        return "Public Space";
      case "OFFICE":
        return "Corporate Office";
      case "COMMUNITY_CENTER":
        return "Community Center";
      default:
        return "Venue";
    }
  };

  const visibleCampaigns = campaigns.filter((c) => c.status === "ACTIVE" || c.status === "UPCOMING");
  const filteredCampaigns = filter === "ALL" 
    ? visibleCampaigns 
    : visibleCampaigns.filter((c) => getRegistrationForCampaign(c._id) !== undefined);

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1e293b] font-bold mb-2">
            Blood Drive Campaigns
          </h2>
          <p className="text-sm text-gray-500">
            Find nearby donation camps, register, and generate your entry check-in tickets.
          </p>
        </div>
        
        {/* Toggle Filters */}
        <div className="bg-neutral-100 p-1.5 rounded-2xl flex gap-1 self-stretch md:self-auto shadow-inner">
          <button
            onClick={() => setFilter("ALL")}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all ${
              filter === "ALL"
                ? "bg-[#3b5e2b] text-white shadow-md"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Drives ({visibleCampaigns.length})
          </button>
          <button
            onClick={() => setFilter("MY_REGISTRATIONS")}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all ${
              filter === "MY_REGISTRATIONS"
                ? "bg-[#3b5e2b] text-white shadow-md"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Registered ({registrations.length})
          </button>
        </div>
      </div>

      {/* Cooldown Alert */}
      {isBlocked && (
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-orange-800 uppercase tracking-wide">
              Donation Cooldown Active
            </p>
            <p className="text-xs text-orange-600 mt-1 leading-relaxed">
              You cannot register for any upcoming campaigns until your 56-day post-donation recovery period completes on{" "}
              <strong className="text-orange-800">{eligibility.eligibleDate}</strong> ({eligibility.daysRemaining} days remaining).
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-syne font-bold text-[#3b5e2b] uppercase tracking-widest">Loading Campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#eef4e2] text-[#3b5e2b] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e1ead2]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="font-syne font-bold text-xl text-gray-800 mb-1">
            {filter === "ALL" ? "No Active Drives" : "No Registered Campaigns"}
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            {filter === "ALL"
              ? "There are currently no active campaigns scheduled. Check back later or check with organizing hospitals."
              : "You have not registered for any upcoming blood drives yet. Explore active drives to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const reg = getRegistrationForCampaign(camp._id);
            const progress = camp.donorsTarget > 0 
              ? Math.min(100, Math.round((camp.donorsRegistered / camp.donorsTarget) * 100)) 
              : 0;

            return (
              <div
                key={camp._id}
                onClick={() => setSelectedCampaign(camp)}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Visual Header / Image fallback */}
                <div className="h-44 bg-gradient-to-br from-[#eef4e2] to-[#d7f79c] p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-500"></div>
                  
                  {/* Drive type badge */}
                  <div className="flex justify-between items-start relative z-10">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm ${
                      camp.type === "EMERGENCY" 
                        ? "bg-red-50 text-red-600 border-red-100" 
                        : camp.type === "AWARENESS" 
                        ? "bg-blue-50 text-blue-600 border-blue-100" 
                        : "bg-white/80 text-[#3b5e2b] border-white/90"
                    }`}>
                      {camp.type === "EMERGENCY" ? "EMERGENCY DRIVE" : camp.type}
                    </span>
                    
                    {reg && (
                      <span className="bg-[#3b5e2b] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Registered
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-[#3b5e2b]/80 uppercase tracking-widest block mb-1">
                      {getVenueTypeLabel(camp.venueType)}
                    </span>
                    <h3 className="text-xl font-serif text-[#1e293b] font-bold leading-tight line-clamp-2">
                      {camp.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Location</span>
                        <p className="text-xs font-black text-gray-800 truncate">{camp.venueName}</p>
                        <p className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">{camp.venueAddress}</p>
                      </div>
                    </div>

                    {/* Schedule Dates */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duration</span>
                        <p className="text-xs font-bold text-gray-800">
                          {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* Target Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                        <span className="text-gray-400 uppercase tracking-widest">Sign-ups Progress</span>
                        <span className="text-gray-700">{camp.donorsRegistered} / {camp.donorsTarget} ({progress}%)</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3b5e2b] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {reg ? (
                      <>
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="flex-grow bg-[#3b5e2b] text-white py-3 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider hover:bg-[#2d4721] transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M12 7v10" />
                            <path d="M8 12h8" />
                          </svg>
                          View QR Ticket
                        </button>
                        <button
                          onClick={() => handleCancel(camp._id)}
                          disabled={submittingId === camp._id}
                          className="border border-red-200 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all flex items-center justify-center"
                          title="Cancel Registration"
                        >
                          {submittingId === camp._id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRegister(camp._id)}
                        disabled={submittingId === camp._id || isBlocked}
                        className={`w-full py-3.5 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          isBlocked
                            ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                            : "bg-neutral-900 text-white hover:bg-black hover:shadow-lg"
                        }`}
                      >
                        {submittingId === camp._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isBlocked ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Drive Locked
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="17" y1="11" x2="23" y2="11" />
                            </svg>
                            Register Drive
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Sidebar Panel (Campaign Details) */}
      {selectedCampaign && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setSelectedCampaign(null)}
          />

          <aside className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white border-l border-neutral-100 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col translate-x-0">
            {/* Sidebar Banner */}
            <div className="relative h-52 bg-gradient-to-br from-[#eef4e2] to-[#d7f79c] p-6 flex flex-col justify-between shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-4 -translate-y-4"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border bg-white/90 text-primary shadow-sm`}>
                  {selectedCampaign.type === "EMERGENCY" ? "EMERGENCY DRIVE" : selectedCampaign.type}
                </span>
                
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="p-2 bg-white/40 hover:bg-white/60 text-gray-700 rounded-full backdrop-blur-md transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-black text-[#3b5e2b]/85 uppercase tracking-widest block mb-1">
                  {getVenueTypeLabel(selectedCampaign.venueType)}
                </span>
                <h2 className="text-2xl font-serif text-[#1e293b] font-bold leading-tight">
                  {selectedCampaign.title}
                </h2>
              </div>
            </div>

            {/* Scrollable details body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cooldown Alert inside sidebar if blocked */}
              {isBlocked && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-orange-700 leading-normal">
                    <strong>Cooldown Active:</strong> You cannot sign up until recovery completes on {eligibility.eligibleDate}.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Campaign Overview</span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedCampaign.description || "Join us for this community blood drive campaign. Your single donation makes a direct, life-saving impact on patients in acute clinical need."}
                </p>
              </div>

              {/* Location Details */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5 text-[#3b5e2b]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Target Location</span>
                    <p className="text-xs font-black text-gray-800 leading-snug">{selectedCampaign.venueName}</p>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{selectedCampaign.venueAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-neutral-100/50 pt-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5 text-[#3b5e2b]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Drive Dates</span>
                    <p className="text-xs font-bold text-gray-800">
                      {formatDate(selectedCampaign.startDate)} to {formatDate(selectedCampaign.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-neutral-100/50 pt-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5 text-[#3b5e2b]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Organized By</span>
                    <p className="text-xs font-bold text-gray-800">{selectedCampaign.hospital}</p>
                  </div>
                </div>
              </div>

              {/* Progress & Targets */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Recruitment Target</span>
                
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-gray-500">Sign-ups Progress</span>
                  <span className="text-gray-800">
                    {selectedCampaign.donorsRegistered} / {selectedCampaign.donorsTarget} donors registered
                  </span>
                </div>
                
                <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b5e2b] rounded-full transition-all duration-500"
                    style={{ width: `${selectedCampaign.donorsTarget > 0 ? Math.min(100, Math.round((selectedCampaign.donorsRegistered / selectedCampaign.donorsTarget) * 100)) : 0}%` }}
                  />
                </div>
              </div>

              {/* Target Blood Groups */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Targeted Blood Groups</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCampaign.bloodGroups.map((group, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 bg-[#eef4e2]/60 text-[#3b5e2b] border border-[#e1ead2]/60 rounded-xl font-syne font-bold text-xs uppercase tracking-wider"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-2 shrink-0">
              {getRegistrationForCampaign(selectedCampaign._id) ? (
                <>
                  <button
                    onClick={() => {
                      const reg = getRegistrationForCampaign(selectedCampaign._id);
                      if (reg) setSelectedReg(reg);
                    }}
                    className="w-full bg-[#3b5e2b] text-white py-4 rounded-2xl font-syne font-bold text-xs uppercase tracking-widest hover:bg-[#2d4721] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M12 7v10" />
                      <path d="M8 12h8" />
                    </svg>
                    View QR Entry Pass
                  </button>
                  <button
                    onClick={() => handleCancel(selectedCampaign._id)}
                    disabled={submittingId === selectedCampaign._id}
                    className="w-full border border-red-200 text-red-500 py-3.5 rounded-2xl font-syne font-bold text-xs uppercase tracking-wider hover:bg-red-50/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    {submittingId === selectedCampaign._id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                        Cancel Drive Registration
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleRegister(selectedCampaign._id)}
                  disabled={submittingId === selectedCampaign._id || isBlocked}
                  className={`w-full py-4 rounded-2xl font-syne font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isBlocked
                      ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                      : "bg-neutral-900 text-white hover:bg-black hover:shadow-lg"
                  }`}
                >
                  {submittingId === selectedCampaign._id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isBlocked ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Registration Locked
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="17" y1="11" x2="23" y2="11" />
                      </svg>
                      Register to Donate
                    </>
                  )}
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Ticket Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          {/* Dismiss overlay */}
          <div className="absolute inset-0" onClick={() => setSelectedReg(null)} />
          
          <div className="bg-white rounded-[2rem] w-full max-w-sm border border-neutral-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] z-10 animate-fade-in">
            {/* Header background styling */}
            <div className="bg-[#0b120c] text-white p-5 shrink-0 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#cbf275] opacity-10 blur-2xl rounded-full translate-x-4 -translate-y-4"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#cbf275]">
                  LifeLink Check-In Pass
                </span>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <h4 className="text-lg font-serif font-black leading-tight truncate">
                {typeof selectedReg.campaignId === "object"
                  ? selectedReg.campaignId.title
                  : "Blood Drive Campaign"}
              </h4>
            </div>

            {/* Ticket Division Line (Dotted with side punches) */}
            <div className="relative h-4 bg-white flex items-center justify-between overflow-hidden shrink-0">
              <div className="w-4 h-4 bg-black/60 rounded-full -ml-2"></div>
              <div className="flex-1 border-t-2 border-dashed border-neutral-100 mx-2"></div>
              <div className="w-4 h-4 bg-black/60 rounded-full -mr-2"></div>
            </div>

            {/* Ticket Body */}
            <div className="px-5 pb-5 pt-2 bg-white space-y-4 flex-1 overflow-y-auto no-scrollbar">
              {/* QR Code Container */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex flex-col items-center justify-center text-center shadow-inner">
                {/* Embed QR Code pointing to verification URL */}
                <div className="bg-white p-2.5 rounded-xl border border-neutral-100 mb-2.5 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `https://lifelink-client-coral.vercel.app/qr-donor-verification?regId=${selectedReg._id}`
                    )}`}
                    alt="Donor QR Ticket"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-normal">
                  Verification Scan Code
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Ticket ID: <span className="font-mono font-bold text-gray-700">{selectedReg._id}</span>
                </p>
              </div>

              {/* Drive Location Details */}
              {typeof selectedReg.campaignId === "object" && (
                <div className="space-y-2.5 bg-neutral-50/50 rounded-xl p-3 border border-neutral-100/50">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Venue Type</span>
                      <span className="font-bold text-[#3b5e2b] text-[11px]">
                        {getVenueTypeLabel(selectedReg.campaignId.venueType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Organized By</span>
                      <span className="font-bold text-gray-700 truncate block text-[11px]">
                        {selectedReg.campaignId.hospital}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs border-t border-neutral-100/70 pt-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Location Address</span>
                    <span className="font-bold text-gray-800 text-[11px]">{selectedReg.campaignId.venueName}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{selectedReg.campaignId.venueAddress}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-[#eef4e2]/60 border border-[#e1ead2]/60 rounded-xl p-3 flex gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="2.5" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <p className="text-[10px] text-gray-600 leading-normal">
                  Present this QR code to registration staff on arrival to check in and record your donation units.
                </p>
              </div>

              {/* Manual URL link copy button */}
              <button
                onClick={() => {
                  const url = `https://lifelink-client-coral.vercel.app/qr-donor-verification?regId=${selectedReg._id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Verification Link copied to clipboard!");
                }}
                className="w-full border border-dashed border-neutral-300 hover:border-[#3b5e2b] text-gray-500 hover:text-[#3b5e2b] py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Ticket Scan URL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
