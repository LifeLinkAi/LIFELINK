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
                  onClick={() => router.push("/qr-donor-verification")}
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
