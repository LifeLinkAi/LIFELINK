"use client";
import React, { useState, useCallback } from "react";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";
import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { useRequestResponse } from "@/hooks/useRequestResponse";
import { RequestActions } from "@/components/donor/RequestActions";
import { IncomingRequest } from "@/services/incomingRequestService";

type Tab = "All" | "Blood" | "Organ";

const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;

function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-50 text-red-600",
    High: "bg-orange-50 text-orange-600",
    Standard: "bg-blue-50 text-blue-600",
  };
  return (
    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${map[urgency] ?? "bg-gray-100 text-gray-600"}`}>
      {urgency}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex gap-5">
        <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-6 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="flex gap-2 mt-2"><div className="h-9 w-20 bg-gray-100 rounded-xl" /><div className="h-9 w-20 bg-gray-100 rounded-xl" /></div>
        </div>
      </div>
    </div>
  );
}

export default function IncomingRequests() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);

  const eligibility = useDonorEligibility();
  const typeFilter = activeTab === "All" ? undefined : activeTab;
  const { requests, isLoading, error, refetch } = useIncomingRequests(typeFilter);
  const { respond } = useRequestResponse();

  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const isBlocked = hasRecord && !eligibility.isEligible;

  const handleRespond = useCallback(async (requestId: string, action: "ACCEPTED" | "DECLINED") => {
    setRespondingId(requestId);
    await respond(requestId, action);
    refetch();
    setRespondingId(null);
  }, [respond, refetch]);

  if (eligibility.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col 2xl:flex-row gap-6">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1e293b] leading-tight">Incoming Requests</h2>
              <p className="text-sm text-gray-500 mt-2">Filtered matches based on your donor profile.</p>
            </div>
            <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm w-fit">
              {(["All", "Blood", "Organ"] as Tab[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${activeTab === tab ? "bg-[#eef4e2] text-[#3b5e2b]" : "text-gray-500"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Ineligibility banner */}
          {isBlocked && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-orange-800">You cannot accept requests — 56-day recovery period active</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Last donation: <span className="font-bold">{eligibility.lastDonation}</span> ({eligibility.daysSince} days ago).
                  Eligible from <span className="font-bold">{eligibility.eligibleDate}</span> · <span className="font-bold">{eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? "s" : ""} remaining</span>.
                </p>
              </div>
            </div>
          )}

          {/* Eligibility status strip */}
          <div className={`mb-6 rounded-2xl px-5 py-3 border flex items-center justify-between ${isBlocked ? "bg-orange-50 border-orange-200" : "bg-[#eef4e2] border-[#d2e4c0]"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isBlocked ? "bg-orange-400 animate-pulse" : "bg-[#5b8a3e]"}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${isBlocked ? "text-orange-700" : "text-[#3b5e2b]"}`}>
                {isBlocked ? `Not eligible · ${eligibility.daysRemaining} days remaining`
                  : hasRecord ? `Eligible · ${eligibility.daysSince} days since last donation (≥ 56 days)`
                    : "Eligible · No donation record on file"}
              </span>
            </div>
            {hasRecord && <span className="text-[10px] text-gray-500 font-medium">Last: {eligibility.lastDonation}</span>}
          </div>

          {/* Request cards */}
          <div className="space-y-5">
            {isLoading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

            {!isLoading && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-red-700 mb-3">{error}</p>
                <button onClick={refetch} className="text-xs font-bold text-[#3b5e2b] border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8]">Retry</button>
              </div>
            )}

            {!isLoading && !error && requests.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#eef4e2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5b8a3e]"><IcoBlood /></div>
                <h4 className="font-bold text-gray-900 mb-2">No requests found</h4>
                <p className="text-sm text-gray-500">There are currently no {activeTab !== "All" ? activeTab.toLowerCase() : ""} donation requests in the system.</p>
              </div>
            )}

            {!isLoading && requests.map((req: IncomingRequest) => (
              <div key={req.id} className={`bg-white rounded-2xl border p-4 sm:p-6 shadow-sm transition-all ${isBlocked ? "border-gray-100 opacity-90" : "border-gray-100 hover:shadow-md"}`}>
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isBlocked ? "bg-gray-100 text-gray-400" : "bg-[#eef4e2] text-[#5b8a3e]"}`}>
                    <IcoBlood />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <UrgencyBadge urgency={req.urgency} />
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-full uppercase">{req.type}</span>
                        <span className="text-[11px] text-gray-400 font-semibold">#{req.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {req.type === "Blood" ? `${req.bloodGroup} Blood` : req.organType ?? "Organ"}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-5">
                      <span className="font-semibold text-gray-800">{req.facility || "Unknown facility"}</span>
                      {req.distance && <span>{req.distance}</span>}
                      {req.notes && <span className="italic text-gray-400 truncate max-w-xs">{req.notes}</span>}
                    </div>
                    <RequestActions
                      requestId={req.id}
                      donorResponse={req.donorResponse}
                      isBlocked={isBlocked}
                      daysRemaining={eligibility.daysRemaining}
                      isLoading={respondingId === req.id}
                      onAccept={() => setSelectedRequest(req)}
                      onDecline={(id) => handleRespond(id, "DECLINED")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Match Analysis (preserved static) */}
        <div className="w-full 2xl:w-[400px] shrink-0">
          <div className={`rounded-3xl border p-5 sm:p-8 h-full ${isBlocked ? "bg-[#f5f0e8] border-orange-200" : "bg-[#eef2e6] border-[#dce6cf]"}`}>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isBlocked ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-600"}`}>
                  {isBlocked ? "Ineligible Period" : "Critical Priority"}
                </span>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-4">Match Analysis</h2>
                <p className="text-xs text-gray-500 mt-1">Top matched request</p>
              </div>
            </div>
            <div className="space-y-5 mb-8">
              {[{ label: "Blood Type Match", pct: "100%", w: "full" }, { label: "Antigen Match", pct: "96%", w: "[96%]" }].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">{m.label}</span>
                    <span className={`font-bold ${isBlocked ? "text-gray-400" : "text-[#5b8a3e]"}`}>{m.pct}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full w-${m.w} ${isBlocked ? "bg-gray-300" : "bg-[#5b8a3e]"}`} />
                  </div>
                </div>
              ))}
            </div>
            {isBlocked && (
              <div className="mb-6 bg-orange-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Recovery Progress</p>
                <div className="flex justify-between text-xs text-orange-600 font-semibold mb-1.5">
                  <span>{eligibility.progressPercent}% of 56 days</span>
                  <span>{eligibility.daysRemaining} days left</span>
                </div>
                <div className="h-2.5 bg-orange-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${eligibility.progressPercent}%` }} />
                </div>
                <p className="text-[10px] text-orange-500 font-semibold mt-2">Eligible from: {eligibility.eligibleDate}</p>
              </div>
            )}
            <div className="h-40 rounded-2xl bg-[#1b2a24] mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg">Nearby match</div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#d2e4c0]">
              {isBlocked ? (
                <>
                  <div className="w-full bg-gray-200 text-gray-400 text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Accept Donation Request
                  </div>
                  <p className="text-[11px] text-center text-orange-500 font-semibold mt-3">Available in {eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? "s" : ""} on {eligibility.eligibleDate}</p>
                </>
              ) : (
                <p className="text-[11px] text-center text-gray-500">Accept a request from the list above.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED REQUEST ACCEPATION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#3b5e2b] text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-white/20 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedRequest.type} Request Details
                  </span>
                  <h3 className="text-2xl font-bold font-serif mt-2">
                    {selectedRequest.type === "Blood" ? `${selectedRequest.bloodGroup} Blood` : selectedRequest.organType ?? "Organ"}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
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
                  <p className="text-sm font-bold text-gray-950 mt-0.5">{selectedRequest.contactPhone || "Available upon acceptance"}</p>
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
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-2 border-t border-gray-100">
              <button
                onClick={async () => {
                  const reqId = selectedRequest.id;
                  setSelectedRequest(null);
                  await handleRespond(reqId, "ACCEPTED");
                }}
                className="flex-1 bg-[#3b5e2b] text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-[#2d4721] transition-colors shadow-sm text-center"
              >
                Confirm Accept
              </button>
              <button
                onClick={async () => {
                  const reqId = selectedRequest.id;
                  setSelectedRequest(null);
                  await handleRespond(reqId, "DECLINED");
                }}
                className="flex-1 border border-red-200 bg-red-50 text-red-700 text-xs font-bold py-3 px-4 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors text-center"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="border border-gray-200 bg-white text-gray-600 text-xs font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}