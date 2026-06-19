"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { IncomingRequest } from "@/services/incomingRequestService";
import { useRequestResponse } from "@/hooks/useRequestResponse";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";
import { RequestActions } from "@/components/donor/RequestActions";
import toast, { Toaster } from "react-hot-toast";

const IcoBlood = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const IcoWarning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

function UrgencyBadge({ urgency }: { urgency: string }) {
  const norm = urgency.toLowerCase();
  if (norm === "critical" || norm === "emergency") {
    return (
      <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest border border-red-100 flex items-center gap-1.5 animate-pulse">
        <IcoWarning /> {urgency}
      </span>
    );
  }
  return (
    <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest border border-orange-100 flex items-center gap-1.5">
      <IcoWarning /> {urgency}
    </span>
  );
}

export default function EmergencyAlerts() {
  const eligibility = useDonorEligibility();
  const { requests, isLoading, error, refetch } = useIncomingRequests();
  const { respond } = useRequestResponse();
  
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);

  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const isBlocked = hasRecord && !eligibility.isEligible;

  // Filter only critical, urgent, emergency, and high urgency alerts
  const emergencyRequests = requests.filter((req) => {
    const urg = req.urgency?.toLowerCase() || "";
    return (
      urg === "critical" ||
      urg === "urgent" ||
      urg === "emergency" ||
      urg === "high"
    );
  });

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

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Live Feed</h2>
          <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
            Real-time alerts for critical shortages and urgent broadcasts in your verified region. High-priority matches are highlighted based on your biological profile.
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-red-600">
            {isLoading ? "Loading..." : `${emergencyRequests.length} Active Critical Alert${emergencyRequests.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-red-700 mb-3">{error}</p>
              <button onClick={refetch} className="text-xs font-bold text-[#3b5e2b] border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8]">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && emergencyRequests.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#eef4e2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5b8a3e]">
                <IcoBlood />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">No emergency alerts found</h4>
              <p className="text-sm text-gray-500">There are currently no active critical or urgent broadcasts matching your profile.</p>
            </div>
          )}

          {!isLoading &&
            emergencyRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl border border-red-100 shadow-sm p-8 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50/50 rounded-full blur-3xl pointer-events-none opacity-60" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <UrgencyBadge urgency={req.urgency} />
                      <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                        {req.type}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Immediate Request: {req.type === "Blood" ? `${req.bloodGroup} Blood` : req.organType ?? "Organ"}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-lg mb-8">
                    {req.notes || `A high priority ${req.type.toLowerCase()} request has been submitted for a patient in your area. Your profile is compatibility matched for this request.`}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-6 relative z-10 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{req.facility || "Facility details pending"}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{req.distance || "Distance pending"} • Hospital Ward</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-xs font-bold text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </button>
                    <RequestActions
                      requestId={req.id}
                      donorResponse={req.donorResponse}
                      isBlocked={isBlocked}
                      daysRemaining={eligibility.daysRemaining}
                      isLoading={respondingId === req.id}
                      onAccept={(id) => handleRespond(id, "ACCEPTED")}
                      onDecline={(id) => handleRespond(id, "DECLINED")}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Map Radius Card */}
        <div className="bg-[#eef4f9] rounded-3xl border border-[#d2e4f0] shadow-sm relative overflow-hidden flex flex-col h-[380px]">
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
              <path d="M-20,50 Q100,120 200,80 T400,200" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M50,-20 Q120,100 80,200 T200,400" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="p-6 relative z-10 flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur-sm border border-white px-3 py-2 rounded-xl shadow-sm">
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Active Radius</div>
              <div className="text-sm font-black text-gray-900">Regional Coverage</div>
            </div>
            <div className="w-10 h-10 bg-[#3b5e2b] rounded-full flex items-center justify-center text-[#cbf275] shadow-md border-2 border-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping absolute" />
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
            </div>
          </div>
          <div className="mt-auto p-6 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm border border-white p-4 rounded-2xl shadow-sm flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                Location matching is active to prioritize urgent regional emergency requests first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED REQUEST ACCEPATION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#dc2626] text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-white/20 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedRequest.type} Request Details
                  </span>
                  <h3 className="text-2xl font-bold font-serif mt-2">
                    {selectedRequest.type === "Blood" ? `${selectedRequest.bloodGroup} Blood` : selectedRequest.organType ?? "Organ"}
                  </h3>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-white/80 hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Patient Name</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">{selectedRequest.patientName || "—"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Emergency Priority</label>
                  <p className="text-sm font-black text-red-600 mt-0.5">{selectedRequest.urgency || "Standard"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Blood Type</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">{selectedRequest.bloodGroup || "—"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Requested Organ</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">{selectedRequest.organType || "—"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Hospital Name</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">{selectedRequest.facility || "—"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Hospital Location</label>
                  <p className="text-sm font-semibold text-gray-950 mt-0.5">{selectedRequest.distance || "Nearby"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Required Quantity</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">
                    {selectedRequest.units ? `${selectedRequest.units} units` : "1 unit"}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Required Date & Time</label>
                  <p className="text-sm font-medium text-gray-950 mt-0.5">
                    {selectedRequest.registeredDate ? new Date(selectedRequest.registeredDate).toLocaleString() : "As soon as possible"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Contact Information</label>
                  <p className="text-sm font-bold text-gray-950 mt-0.5">
                    {selectedRequest.contactPhone || "Available upon acceptance"}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Additional Notes</label>
                  <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-2 border-t border-gray-100 justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {selectedRequest.donorResponse === "PENDING" && !isBlocked && (
                <>
                  <button
                    onClick={() => {
                      const reqId = selectedRequest.id;
                      setSelectedRequest(null);
                      handleRespond(reqId, "DECLINED");
                    }}
                    disabled={respondingId === selectedRequest.id}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => {
                      const reqId = selectedRequest.id;
                      setSelectedRequest(null);
                      handleRespond(reqId, "ACCEPTED");
                    }}
                    disabled={respondingId === selectedRequest.id}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#dc2626] text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Accept Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}