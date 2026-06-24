"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";
import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { IncomingRequest } from "@/services/incomingRequestService";
import { useRequestResponse } from "@/hooks/useRequestResponse";
import toast, { Toaster } from "react-hot-toast";
import { 
  Activity, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Syringe, 
  Lock,
  ArrowRight,
  ExternalLink,
  Droplet
} from "lucide-react";

export default function BloodManagement() {
  const eligibility = useDonorEligibility();
  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const isBlocked = hasRecord && !eligibility.isEligible;

  const [donorProfile, setDonorProfile] = useState<{ bloodType: string; name: string; tier: string } | null>(null);
  const { requests, isLoading: isLoadingRequests, error: requestsError, refetch } = useIncomingRequests("Blood");
  const { respond } = useRequestResponse();

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IncomingRequest | null>(null);
  const [myPledges, setMyPledges] = useState<(IncomingRequest & { myPledgeStatus?: string })[]>([]);

  useEffect(() => {
    api.get("/donors/me").then((res) => {
      setDonorProfile({
        bloodType: res.data.bloodType ?? "O-",
        name: res.data.name ?? "Anonymous Donor",
        tier: res.data.tier ?? "Bronze",
      });
    }).catch(() => {});
  }, []);

  const fetchPledges = useCallback(() => {
    api.get("/requests/donor/my-pledges")
       .then((res) => setMyPledges(res.data.data || []))
       .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPledges();
    // const interval = setInterval(fetchPledges, 10000);
    // return () => clearInterval(interval);
  }, [fetchPledges]);

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
        fetchPledges();
        setRespondingId(null);
        setSelectedRequest(null);
      }
    },
    [respond, refetch, fetchPledges]
  );

  if (eligibility.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950">
        <Activity className="w-10 h-10 text-slate-500 animate-pulse" />
      </div>
    );
  }

  const activeMission = myPledges.find(p => p.myPledgeStatus === 'PLEDGED' || p.myPledgeStatus === 'ARRIVED');
  const completedMissions = myPledges.filter(p => p.myPledgeStatus === 'COMPLETED');

  // Filter community feed: remove already pledged missions, fully fulfilled ones, or closed ones
  const filteredRequests = requests.filter(req => {
    const isPledged = myPledges.some(p => p.id === req.id);
    const isClosed = req.status === 'COMPLETED' || req.status === 'CLOSED';
    return !isPledged && !isClosed;
  });

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-200">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Droplet className="h-8 w-8 text-red-500" />
              Donor Command Deck
            </h2>
            <p className="text-sm text-slate-400 mt-2">Manage your biological readiness and live trauma missions.</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-white">
                {donorProfile?.bloodType || "O-"}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Authentication</p>
                <p className="text-sm font-medium text-white">{donorProfile?.name}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
            <div>
              {isBlocked ? (
                <span className="bg-red-500/20 text-red-500 font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-red-500/30 flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                  <Lock className="h-3 w-3" />
                  [ BIOLOGICAL COOLDOWN: {eligibility.daysRemaining} DAYS REMAINING ]
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-500 font-mono text-xs font-bold px-2.5 py-1.5 rounded border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <ShieldCheck className="h-3 w-3" />
                  [ ELIGIBLE FOR DISPATCH ]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE MISSION FLIGHT BANNER */}
        {activeMission && (
          <div className={`relative overflow-hidden rounded-lg border shadow-lg ${
            activeMission.myPledgeStatus === 'PLEDGED' 
              ? 'bg-slate-900 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
              : 'bg-slate-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${activeMission.myPledgeStatus === 'PLEDGED' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  {activeMission.myPledgeStatus === 'PLEDGED' ? (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      <span className="text-blue-400 font-bold text-xs uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                        [ ACTIVE EMERGENCY MISSION • EN ROUTE ]
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        [ AT HOSPITAL • PHLEBOTOMY AUTHORIZED ]
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-white mb-1">
                    Directed Payload: {activeMission.patientName || "Anonymous Patient"}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {activeMission.facility || "Target Hospital"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-red-400"><Droplet className="h-4 w-4" /> {activeMission.bloodGroup}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 w-full md:w-auto max-w-sm">
                  {activeMission.myPledgeStatus === 'PLEDGED' ? (
                    <>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                        Please proceed to the lobby check-in desk at <strong className="text-white">{activeMission.facility}</strong> and present your ID.
                      </p>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMission.facility || 'Hospital')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 border border-blue-500"
                      >
                        <ExternalLink className="h-4 w-4" /> [ Open in Google Maps ]
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-emerald-100 font-medium leading-relaxed flex items-start gap-3">
                        <Syringe className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        You have been verified at the lobby desk. Please take a seat in the bleeding chair. Your phlebotomist will initiate the 450ml draw shortly.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMMUNITY FEED */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
          <div className="border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-400" />
                Live Dispatch Feed
              </h3>
              <p className="text-xs text-slate-500 mt-1">Trauma orders matched to your biological compatibility.</p>
            </div>
            <div className="text-sm font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              {filteredRequests.length} Active Target{filteredRequests.length !== 1 && 's'}
            </div>
          </div>

          <div className="p-6">
            {isLoadingRequests ? (
              <div className="flex justify-center items-center py-12">
                <Activity className="w-8 h-8 text-slate-500 animate-pulse" />
              </div>
            ) : requestsError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-red-400 mb-3">Telemetry Error: {requestsError}</p>
                <button onClick={refetch} className="text-xs font-bold text-white bg-slate-800 border border-slate-700 px-4 py-2 rounded hover:bg-slate-700 transition">
                  Restart Subspace Link
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-lg py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No active dispatches require your assistance at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(req => (
                  <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col lg:flex-row justify-between gap-6 hover:border-slate-700 transition-colors">
                    <div className="flex gap-5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <span className="font-black text-red-500">{req.bloodGroup}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-200 text-sm truncate flex items-center gap-2">
                          {req.patientName || "Anonymous Patient"}
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                            req.urgency === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            req.urgency === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {req.urgency}
                          </span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.facility || "Target Hospital"}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.registeredDate ? new Date(req.registeredDate).toLocaleTimeString() : "Just now"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="w-full sm:w-auto text-xs font-bold text-slate-300 border border-slate-700 rounded bg-slate-900 px-4 py-2 hover:bg-slate-800 transition-colors"
                      >
                        [ Intel ]
                      </button>
                      
                      {isBlocked ? (
                         <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-600 text-xs font-bold px-6 py-2 rounded cursor-not-allowed select-none">
                           <Lock className="h-3 w-3" /> LOCKED
                         </div>
                      ) : (
                        <button
                          onClick={() => handleRespond(req.id, "ACCEPTED")}
                          disabled={respondingId === req.id || !!activeMission}
                          className={`w-full sm:w-auto text-xs font-bold px-6 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                            !!activeMission
                              ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          }`}
                        >
                          {respondingId === req.id ? (
                            <Activity className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ArrowRight className="h-3 w-3" />
                              [ Accept Dispatch ]
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BIOLOGICAL SERVICE RECORD */}
        {completedMissions.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
            <div className="border-b border-slate-800 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Biological Service Record
              </h3>
              <p className="text-xs text-slate-500 mt-1">Immutable ledger of your successfully completed trauma dispatches.</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {completedMissions.map(req => (
                  <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-slate-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Target Payload: {req.patientName || "Anonymous Patient"}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.facility || "Target Hospital"}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.registeredDate ? new Date(req.registeredDate).toLocaleDateString() : "Recently"}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold px-3 py-1.5 rounded border border-emerald-500/20 flex items-center gap-2 self-start md:self-auto shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 className="h-3 w-3" /> [ COMPLETED ]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED INTEL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-lg max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-slate-950 border-b border-slate-800 p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-1 rounded border border-slate-700 uppercase tracking-widest">
                  Secure Intel Report
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  Payload: {selectedRequest.bloodGroup} Blood
                </h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Target</label>
                  <p className="text-sm font-bold text-slate-200">{selectedRequest.patientName || "—"}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Priority</label>
                  <p className="text-sm font-black text-red-500">{selectedRequest.urgency || "Standard"}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Facility</label>
                  <p className="text-sm font-bold text-slate-200 truncate">{selectedRequest.facility || "—"}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Quantity</label>
                  <p className="text-sm font-bold text-slate-200">
                    {selectedRequest.units ? `${selectedRequest.units} units` : "1 unit"}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="bg-slate-950 p-4 rounded border border-slate-800 mt-4">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Comms Intel</label>
                  <p className="text-sm text-slate-400 leading-relaxed font-mono">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-950 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-slate-800 justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              {!isBlocked && !activeMission && (
                <button
                  onClick={() => {
                    const reqId = selectedRequest.id;
                    handleRespond(reqId, "ACCEPTED");
                  }}
                  disabled={respondingId === selectedRequest.id}
                  className="w-full sm:w-auto px-5 py-2.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Authorize Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}