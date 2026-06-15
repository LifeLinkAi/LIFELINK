"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Campaign {
  _id: string;
  title: string;
  type: string;
  hospital: string;
  venueType: string;
  venueName: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
}

interface Donor {
  _id: string;
  name: string;
  email: string;
}

interface Registration {
  _id: string;
  campaignId: Campaign;
  donorId: Donor;
  status: "REGISTERED" | "ATTENDED" | "ABSENT" | "DEFERRED";
  donationUnits: number;
  staffNotes?: string;
  createdAt: string;
}

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regId = searchParams.get("regId");

  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);

  // Form Fields
  const [status, setStatus] = useState<"ATTENDED" | "ABSENT" | "DEFERRED">("ATTENDED");
  const [donationUnits, setDonationUnits] = useState(1);
  const [staffNotes, setStaffNotes] = useState("");

  const fetchTicketDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/campaigns/registration/${id}`);
      const data = res.data?.data;
      setRegistration(data);
      if (data) {
        setStatus(data.status === "REGISTERED" ? "ATTENDED" : data.status);
        setDonationUnits(data.donationUnits || 1);
        setStaffNotes(data.staffNotes || "");
      }
    } catch (error: any) {
      console.error("Error fetching ticket:", error);
      toast.error(error.response?.data?.message || "Invalid Ticket ID or not found.");
      setRegistration(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (regId) {
      fetchTicketDetails(regId);
    } else {
      setRegistration(null);
    }
  }, [regId]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error("Please enter a valid ticket code.");
      return;
    }
    router.push(`/qr-donor-verification?regId=${manualId.trim()}`);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/campaigns/registration/${registration._id}/verify`, {
        status,
        donationUnits: status === "ATTENDED" ? donationUnits : 0,
        staffNotes,
      });
      toast.success("Donation verification updated successfully!");
      setRegistration(res.data?.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update verification status.");
    } finally {
      setSubmitting(false);
    }
  };

  const getVenueLabel = (type?: string) => {
    if (!type) return "Venue";
    switch (type.toUpperCase()) {
      case "HOSPITAL":
        return "Organizing Hospital";
      case "SCHOOL":
        return "School Campus";
      case "PUBLIC_PLACE":
        return "Public Space";
      case "OFFICE":
        return "Corporate Office";
      case "COMMUNITY_CENTER":
        return "Community Center";
      default:
        return "Campaign Location";
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 flex flex-col justify-center">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-neutral-900 text-[#cbf275] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h1 className="font-syne font-bold text-2xl text-gray-900">LifeLink Drive Portal</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">Staff Verification System</p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-syne font-bold text-[#3b5e2b] uppercase tracking-wider">Verifying Ticket details...</p>
        </div>
      ) : !registration ? (
        /* Manual Search / Scan instructions screen */
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#eef4e2] text-[#3b5e2b] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#e1ead2]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01" />
              </svg>
            </div>
            <h2 className="font-syne font-bold text-lg text-gray-800">Scan QR Code or Enter Ticket ID</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-normal">
              Use a smartphone camera to scan the donor&apos;s ticket, or input the Ticket ID code below.
            </p>
          </div>

          <form onSubmit={handleManualSearch} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Enter Registration Ticket ID
              </label>
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. 64b3c9f28a7e5..."
                required
                className="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-2xl text-sm font-mono focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3b5e2b] hover:bg-[#2d4721] text-white py-4 rounded-2xl font-syne font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
            >
              Verify Ticket ID
            </button>
          </form>
        </div>
      ) : registration.status !== "REGISTERED" ? (
        /* Verification success / completion screen */
        <div className="space-y-6 animate-fade-in">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes checkmark-circle-draw {
              100% {
                stroke-dashoffset: 0;
              }
            }
            @keyframes checkmark-draw {
              100% {
                stroke-dashoffset: 0;
              }
            }
            @keyframes scale-up {
              0%, 100% {
                transform: none;
              }
              50% {
                transform: scale3d(1.08, 1.08, 1);
              }
            }
            @keyframes fill-success {
              100% {
                box-shadow: inset 0px 0px 0px 40px #3b5e2b;
              }
            }
            @keyframes fill-error {
              100% {
                box-shadow: inset 0px 0px 0px 40px #ba1a1a;
              }
            }
            @keyframes fill-warning {
              100% {
                box-shadow: inset 0px 0px 0px 40px #ea580c;
              }
            }
            .animate-checkmark-circle {
              stroke-dasharray: 166;
              stroke-dashoffset: 166;
              stroke-width: 3;
              stroke-miterlimit: 10;
              fill: none;
              animation: checkmark-circle-draw 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .animate-checkmark-box-success {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 3;
              stroke: #fff;
              stroke-miterlimit: 10;
              box-shadow: inset 0px 0px 0px #3b5e2b;
              animation: fill-success .4s ease-in-out .4s forwards, scale-up .3s ease-in-out .9s;
            }
            .animate-checkmark-box-error {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 3;
              stroke: #fff;
              stroke-miterlimit: 10;
              box-shadow: inset 0px 0px 0px #ba1a1a;
              animation: fill-error .4s ease-in-out .4s forwards, scale-up .3s ease-in-out .9s;
            }
            .animate-checkmark-box-warning {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: block;
              stroke-width: 3;
              stroke: #fff;
              stroke-miterlimit: 10;
              box-shadow: inset 0px 0px 0px #ea580c;
              animation: fill-warning .4s ease-in-out .4s forwards, scale-up .3s ease-in-out .9s;
            }
            .animate-checkmark-tick {
              transform-origin: 50% 50%;
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: checkmark-draw 0.35s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
          `}} />

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 text-center shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
            {/* Status-specific animated icon */}
            <div className="mb-4">
              {registration.status === "ATTENDED" ? (
                <svg className="animate-checkmark-box-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                  <circle className="animate-checkmark-circle" style={{ stroke: "#3b5e2b" }} cx="26" cy="26" r="25" />
                  <path className="animate-checkmark-tick" fill="none" strokeWidth="3" stroke="#fff" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              ) : registration.status === "ABSENT" ? (
                <svg className="animate-checkmark-box-error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                  <circle className="animate-checkmark-circle" style={{ stroke: "#ba1a1a" }} cx="26" cy="26" r="25" />
                  <path className="animate-checkmark-tick" fill="none" strokeWidth="3" stroke="#fff" d="M16 16l20 20M36 16L16 36" />
                </svg>
              ) : (
                <svg className="animate-checkmark-box-warning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                  <circle className="animate-checkmark-circle" style={{ stroke: "#ea580c" }} cx="26" cy="26" r="25" />
                  <path className="animate-checkmark-tick" fill="none" strokeWidth="4" stroke="#fff" d="M26 13v16M26 37h.01" />
                </svg>
              )}
            </div>

            <h2 className="font-syne font-bold text-2xl text-gray-900 mt-2">
              {registration.status === "ATTENDED" 
                ? "Already Donated" 
                : registration.status === "ABSENT" 
                ? "Check-In: Absent" 
                : "Check-In: Deferred"}
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">
              Verification Record Stored
            </p>

            {/* Ticket & Donor Info */}
            <div className="w-full mt-6 text-left border-t border-neutral-100 pt-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Donor</span>
                <p className="text-sm font-bold text-gray-800">{registration.donorId.name}</p>
                <p className="text-xs text-gray-500 font-mono">{registration.donorId.email}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Campaign Drive</span>
                <p className="text-sm font-bold text-gray-800">{registration.campaignId.title}</p>
                <p className="text-xs text-gray-500">{registration.campaignId.venueName}</p>
              </div>

              {registration.status === "ATTENDED" && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Blood Units Collected</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef4e2] text-[#3b5e2b] border border-[#d2e4c0] rounded-lg font-bold text-xs uppercase tracking-wider mt-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {registration.donationUnits || 1} Unit (~{Math.round((registration.donationUnits || 1) * 450)}ml)
                  </span>
                </div>
              )}

              {registration.staffNotes && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Staff Notes</span>
                  <p className="text-xs text-gray-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic mt-1 leading-relaxed">
                    &ldquo;{registration.staffNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action */}
            <div className="w-full mt-6 pt-4 border-t border-neutral-100">
              <button
                onClick={() => {
                  router.push("/qr-donor-verification");
                  setRegistration(null);
                  setManualId("");
                }}
                className="w-full bg-neutral-900 hover:bg-black text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
              >
                Scan Another Ticket
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Verification details screen */
        <div className="space-y-6">
          {/* Card: Donor & Campaign Details */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#cbf275]/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
            
            {/* Status indicator */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Registration details
              </span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider shadow-sm ${
                registration.status === "REGISTERED"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : registration.status === "ATTENDED"
                  ? "bg-[#eef4e2] text-[#3b5e2b] border-[#d2e4c0]"
                  : registration.status === "ABSENT"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}>
                {registration.status}
              </span>
            </div>

            {/* Donor */}
            <div className="mb-6">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Donor Name &amp; Email</span>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{registration.donorId.name}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{registration.donorId.email}</p>
            </div>

            {/* Campaign info */}
            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Campaign drive</span>
                <p className="text-sm font-serif font-black text-gray-800 leading-snug">
                  {registration.campaignId.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{getVenueLabel(registration.campaignId.venueType)}</span>
                  <p className="font-bold text-gray-700 truncate">{registration.campaignId.venueName}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Address</span>
                  <p className="font-bold text-gray-500 truncate">{registration.campaignId.venueAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form: Staff verification input */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-md">
            <h3 className="font-syne font-bold text-sm text-gray-800 uppercase tracking-wider mb-4">
              Update Attendance &amp; Donation
            </h3>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Attendance Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl text-sm text-gray-700 font-bold focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] cursor-pointer"
                >
                  <option value="ATTENDED">Attended &amp; Donated</option>
                  <option value="ABSENT">Absent (No Show)</option>
                  <option value="DEFERRED">Deferred (Medical/Temporary)</option>
                </select>
              </div>

              {/* Units Input (Only if Status is Attended) */}
              {status === "ATTENDED" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    Blood Units Collected
                  </label>
                  <select
                    value={donationUnits}
                    onChange={(e) => setDonationUnits(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl text-sm text-gray-700 font-bold focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] cursor-pointer"
                  >
                    <option value={1}>1 Unit (~450ml)</option>
                    <option value={2}>2 Units (~900ml)</option>
                  </select>
                </div>
              )}

              {/* Staff Notes */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Notes / Observations (Optional)
                </label>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g. Fit for donation, standard recovery observation complete..."
                  className="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] min-h-[90px] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/qr-donor-verification");
                    setRegistration(null);
                    setManualId("");
                  }}
                  className="flex-1 border border-neutral-200 text-gray-600 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-neutral-900 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm Check-in"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QRDonorVerification() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50">
        <div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
