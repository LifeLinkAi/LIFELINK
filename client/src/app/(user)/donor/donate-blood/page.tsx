"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";
import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { IncomingRequest } from "@/services/incomingRequestService";
import { useRequestResponse } from "@/hooks/useRequestResponse";
import { RequestActions } from "@/components/donor/RequestActions";
import toast, { Toaster } from "react-hot-toast";

const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcoReq = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /></svg>;
const IcoCal = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function BloodManagement() {
  const eligibility = useDonorEligibility();
  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");

  const [donorProfile, setDonorProfile] = useState<{ bloodType: string; name: string; tier: string } | null>(null);
  const { requests, isLoading: isLoadingRequests, error: requestsError, refetch } = useIncomingRequests("Blood");
  const { respond } = useRequestResponse();

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);

  useEffect(() => {
    api.get("/donors/me").then((res) => {
      setDonorProfile({
        bloodType: res.data.bloodType ?? "O-",
        name: res.data.name ?? "Anonymous Donor",
        tier: res.data.tier ?? "Bronze",
      });
    }).catch(() => {});
  }, []);

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

  if (eligibility.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBlocked = hasRecord && !eligibility.isEligible;

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#1e293b] font-bold mb-2">Blood Management</h2>
          <p className="text-sm text-gray-500">Monitor your donor profile, eligibility, and schedules.</p>
        </div>
        <button className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-4 py-3 hover:bg-gray-50 transition-colors bg-white shadow-sm">Download Report</button>
      </div>

      {/* ── Ineligibility Banner ──────────────────────────────────────── */}
      {isBlocked && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-800">
              You are in the 56-day recovery period
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Last donated: <span className="font-bold">{eligibility.lastDonation}</span> ({eligibility.daysSince} days ago).
              Eligible again from <span className="font-bold">{eligibility.eligibleDate}</span> — in <span className="font-bold">{eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? "s" : ""}</span>.
            </p>
          </div>
          <Link href="/donor/settings"
            className="text-xs font-bold text-orange-700 border border-orange-300 rounded-xl px-4 py-2 hover:bg-orange-100 transition whitespace-nowrap">
            Upload New Certificate
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Profile / eligibility card */}
        <div className={`xl:col-span-2 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm relative overflow-hidden border ${isBlocked ? "bg-gradient-to-br from-orange-50 to-white border-orange-200" : "bg-gradient-to-br from-[#f6fbee] to-white border-[#e1ead2]"}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 ${isBlocked ? "bg-orange-300" : "bg-[#d7f79c]"}`} />
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-10 relative z-10">
            <div className="flex gap-4 items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${isBlocked ? "bg-orange-200" : "bg-[#cbf275]"}`}>
                <span className="text-xl font-black text-[#2d3a24]">{donorProfile?.bloodType || "O-"}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{donorProfile?.bloodType === "O-" ? "Universal Donor Profile" : `${donorProfile?.bloodType || "O-"} Donor Profile`}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${isBlocked ? "bg-orange-200 text-orange-800" : "bg-[#cbf275] text-[#3b5e2b]"}`}>Verified</span>
                  <span className="text-[11px] font-medium text-gray-500">Tier: {donorProfile?.tier || "Bronze"}</span>
                </div>
              </div>
            </div>
            {/* Eligibility badge */}
            {isBlocked ? (
              <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-red-200 w-fit">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Not Eligible to Donate
              </span>
            ) : (
              <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-[#d2e4c0] w-fit">
                <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full" />Eligible to Donate
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Donation Cooldown (56 days)</p>
              {isBlocked ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-black text-orange-500">{eligibility.daysRemaining}<br /><span className="text-lg">days left</span></span>
                    <span className="text-[11px] text-gray-500 font-medium">Last donation:<br />{eligibility.daysSince} days ago</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>Recovery</span>
                      <span>{eligibility.progressPercent}% of 56 days</span>
                    </div>
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${eligibility.progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#5b8a3e]">Ready<br />Now</span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {hasRecord ? <>Last donation:<br />{eligibility.daysSince} days ago</> : "No certificate uploaded yet"}
                  </span>
                </div>
              )}
            </div>
            {isBlocked ? (
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-400 text-sm font-bold px-6 py-3.5 rounded-xl cursor-not-allowed select-none w-full sm:w-auto justify-center">
                <IcoLock /> Schedule Donation
              </div>
            ) : (
              <button className="w-full sm:w-auto bg-[#3b5e2b] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-md hover:bg-[#2d4721] transition-colors">
                Schedule Donation
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {[
            { icon: <IcoBlood />, bg: "blue", label: "Total Donated", value: "4.5", unit: "Liters" },
            { icon: <IcoReq />,   bg: "red",  label: "Lives Impacted", value: "3",  unit: "Patients" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-${s.bg}-50 flex items-center justify-center text-${s.bg}-500 shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900">{s.value}<span className="text-sm font-medium text-gray-400 ml-1">{s.unit}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-gray-900">Appointments</h3>
          <button className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:underline w-fit">View Calendar</button>
        </div>
        <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4"><IcoCal /></div>
          <h4 className="font-bold text-gray-800 mb-2">No upcoming appointments</h4>
          {isBlocked ? (
            <p className="text-xs text-orange-500 font-semibold mb-6">
              Scheduling is disabled until your 56-day recovery period ends on <strong>{eligibility.eligibleDate}</strong>.
            </p>
          ) : (
            <p className="text-xs text-gray-500 mb-6">Your cooldown period has ended. Local clinics have available slots today.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {isBlocked ? (
              <>
                <div className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <IcoLock /> Today, 2:00 PM
                </div>
                <div className="flex-1 bg-gray-100 border border-gray-200 text-gray-400 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <IcoLock /> Tomorrow, 10:00 AM
                </div>
              </>
            ) : (
              <>
                <button className="flex-1 bg-[#f0f7fb] text-blue-600 border border-blue-100 font-bold text-xs py-3 rounded-xl hover:bg-blue-50 transition-colors">Today, 2:00 PM</button>
                <button className="flex-1 border border-gray-200 text-gray-600 font-bold text-xs py-3 rounded-xl hover:bg-gray-50 transition-colors">Tomorrow, 10:00 AM</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Needs */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Urgent Nearby Needs</h3>
            <p className="text-xs text-gray-500 mt-1">Matched with your profile blood group type compatibility.</p>
          </div>
          {isBlocked
            ? <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-2 rounded-full border border-orange-200 w-fit">Cannot Accept · {eligibility.daysRemaining}d remaining</span>
            : <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-2 rounded-full border border-red-100 w-fit">{requests.length} Matching Blood Requests</span>}
        </div>
        
        <div className="space-y-4">
          {isLoadingRequests && (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoadingRequests && requestsError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-red-700 mb-3">{requestsError}</p>
              <button onClick={refetch} className="text-xs font-bold text-[#3b5e2b] border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8]">
                Retry
              </button>
            </div>
          )}

          {!isLoadingRequests && !requestsError && requests.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-sm text-gray-500">No matching blood requests found at this time.</p>
            </div>
          )}

          {!isLoadingRequests &&
            requests.map(req => (
              <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-500 border border-red-100 shrink-0">
                    {req.bloodGroup}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">
                      Patient: {req.patientName || "Anonymous"} • {req.facility || "Hospital"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{req.distance || "Distance pending"}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Registered: {req.registeredDate ? new Date(req.registeredDate).toLocaleDateString() : "Just now"}</span>
                      <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded uppercase">
                        {req.urgency}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded uppercase">
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
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
            ))}
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
                    {selectedRequest.bloodGroup} Blood Request
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
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3b5e2b] text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
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