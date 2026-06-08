"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";

interface DonorProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  bloodType: string;
  phone: string;
  lastDonation: string;
  totalDonated: string;
  isSetupComplete: boolean;
  status: string;
}

export default function DonorDashboard() {
  const [profile, setProfile] = useState<DonorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bloodType, setBloodType] = useState("O-");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Eligibility from the shared hook (calls /donors/me independently)
  const eligibility = useDonorEligibility();

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/donors/me");
      setProfile(res.data);
      if (res.data) {
        setBloodType(res.data.bloodType || "O-");
        setLocation(res.data.location || "");
        setPhone(res.data.phone || "");
      }
    } catch (error) {
      console.error("Error fetching donor profile:", error);
      toast.error("Failed to load donor profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !location || !phone) { toast.error("Please fill in all setup fields."); return; }
    try {
      setIsSubmitting(true);
      const res = await api.put("/donors/setup-complete", { bloodType, location, phone });
      setProfile(res.data);
      toast.success("Profile setup complete! Welcome to LIFELINK.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-syne text-[#3b5e2b] font-bold text-sm tracking-wider uppercase">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const ringColor = (!hasRecord || eligibility.isEligible) ? "#a5d84a" : "#f97316";
  const strokeDash = `${eligibility.progressPercent},100`;

  return (
    <main className="p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-80px)]">
      {/* SETUP WIZARD */}
      {profile && !profile.isSetupComplete && (
        <div className="fixed inset-0 z-50 bg-[#0b120c]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-neutral-100 shadow-2xl relative">
            <div className="w-16 h-16 bg-[#eef4e2] text-[#3b5e2b] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#e1ead2]">
              <span className="material-symbols-outlined text-[32px] text-[#3b5e2b]">volunteer_activism</span>
            </div>
            <h2 className="font-syne font-bold text-2xl text-gray-900 mb-2">Welcome to LIFELINK, {profile.name}!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We require a few medical and contact details to list you as a life-saving donor.
            </p>
            <form onSubmit={handleWizardSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Biological Blood Type</label>
                <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-neutral-50 border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] cursor-pointer">
                  {["O-","O+","A+","A-","B+","B-","AB-","AB+"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Current City &amp; State</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chicago, IL" required
                  className="w-full bg-neutral-50 border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Official Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 012-3456" required
                  className="w-full bg-neutral-50 border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] transition-all" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-[#3b5e2b] hover:bg-[#2d4721] text-white py-4 rounded-2xl font-syne font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                {isSubmitting
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  : <><span className="material-symbols-outlined text-[20px]">verified</span>Activate Registry Profile</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto space-y-6 ${profile && !profile.isSetupComplete ? "blur-md select-none pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* WELCOME CARD */}
          <div className="bg-gradient-to-br from-[#eef4e2] to-[#f8faf5] p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-[#e1ead2] relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <span className="bg-white/80 text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white inline-block mb-4">
                {profile?.bloodType || "O-"} Donor
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-[#1e293b] leading-tight">
                Welcome back,<br />
                <span className="text-[#3b5e2b] font-bold">{profile?.name || "Donor"}.</span>
              </h2>
              <p className="text-sm text-gray-600 max-w-md mt-4 mb-6 leading-relaxed">
                {hasRecord && !eligibility.isEligible
                  ? `You are in the recovery period. You can donate again in ${eligibility.daysRemaining} day${eligibility.daysRemaining !== 1 ? "s" : ""}.`
                  : "Your readiness status is active and nearby hospitals have adequate reserves."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-2xl">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Lives Impacted</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">12</div>
                </div>
                <div className="bg-white/70 p-4 rounded-2xl">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Donations</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">8</div>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS CARD */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Readiness Status</h3>
              {hasRecord && !eligibility.isEligible ? (
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-2 rounded-full uppercase border border-red-200 w-fit flex items-center gap-1.5">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                  Not Eligible · {eligibility.daysRemaining}d remaining
                </span>
              ) : (
                <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-2 rounded-full uppercase border border-[#d2e4c0] w-fit">
                  {profile?.status || "Ready To Donate"}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Progress ring — orange if recovering */}
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path strokeWidth="3" stroke="#e5e7eb" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path strokeWidth="3" stroke={ringColor} strokeLinecap="round" fill="none"
                    strokeDasharray={strokeDash}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${hasRecord && !eligibility.isEligible ? "text-orange-500" : "text-[#3b5e2b]"}`}>
                  <span className="text-2xl font-black">{eligibility.progressPercent}%</span>
                  {hasRecord && !eligibility.isEligible && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-center mt-0.5 leading-tight">
                      of {56}d<br/>done
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className={`p-4 rounded-xl border mb-3 ${hasRecord && !eligibility.isEligible ? "bg-orange-50 border-orange-200" : "bg-[#f8fafd] border-gray-100"}`}>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Last Donation</div>
                  <div className="font-bold text-gray-900 text-sm">
                    {hasRecord
                      ? <>{eligibility.lastDonation} <span className="text-gray-400 font-normal">({eligibility.daysSince} days ago)</span></>
                      : <span className="text-gray-400 font-medium">No record yet — upload certificate in Settings</span>}
                  </div>
                  {hasRecord && !eligibility.isEligible && (
                    <div className="mt-2 flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="text-xs font-bold text-orange-600">
                        Eligible from {eligibility.eligibleDate} · {eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? "s" : ""} left
                      </span>
                    </div>
                  )}
                  {hasRecord && eligibility.isEligible && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-xs font-bold text-[#5b8a3e]">56-day recovery complete — eligible now</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                    Update Info
                  </button>
                  {(!hasRecord || eligibility.isEligible) ? (
                    <button className="flex-1 bg-[#3b5e2b] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#2d4721] transition">
                      Schedule Visit
                    </button>
                  ) : (
                    <div className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed select-none">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Locked · {eligibility.daysRemaining}d remaining
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEARBY ALERTS */}
        <div className="bg-[#0b120c] rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 text-white overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#cbf275] opacity-[0.03] blur-[120px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-2xl font-serif font-bold">Nearby Alerts</h3>
              <button className="text-[#cbf275] text-xs font-black tracking-widest uppercase">View Map</button>
            </div>
            {hasRecord && !eligibility.isEligible && (
              <div className="mb-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-3 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-orange-300 font-semibold">
                  You cannot accept requests until <span className="font-black text-orange-200">{eligibility.eligibleDate}</span> ({eligibility.daysRemaining} days remaining).
                </p>
              </div>
            )}
            <div className="space-y-4">
              {[
                { title: "O- Negative Needed URGENTLY", sub: "City General Hospital", badge: "Critical", badgeCls: "bg-red-100 text-red-700" },
                { title: "Platelet Donation Request", sub: "Metro Regional Blood Center", badge: "Standard", badgeCls: "bg-[#eef4e2] text-[#5b8a3e]" },
              ].map((alert) => (
                <div key={alert.title} className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${alert.badge === "Critical" ? "bg-red-50" : "bg-[#eef4e2]"}`}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={alert.badge === "Critical" ? "#ef4444" : "#5b8a3e"} strokeWidth="2.5">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">{alert.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{alert.sub}</p>
                    </div>
                  </div>
                  {(!hasRecord || eligibility.isEligible) ? (
                    <span className={`${alert.badgeCls} text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit`}>{alert.badge}</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Ineligible
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}