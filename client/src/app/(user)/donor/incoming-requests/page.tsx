"use client";
import React, { useState } from "react";
import { useDonorEligibility } from "@/hooks/useDonorEligibility";

const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcoLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function IncomingRequests() {
  const [activeTab, setActiveTab] = useState("All");
  const eligibility = useDonorEligibility();

  const hasRecord = !!(eligibility.lastDonation && eligibility.lastDonation !== "N/A");
  const isBlocked = hasRecord && !eligibility.isEligible;

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
              <p className="text-sm text-gray-500 mt-2">AI filtered matches based on your donor profile.</p>
            </div>
            <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm w-fit">
              {["All", "Blood", "Organ"].map((tab) => (
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
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
                {isBlocked
                  ? `Not eligible · ${eligibility.daysRemaining} days remaining`
                  : hasRecord
                    ? `Eligible · ${eligibility.daysSince} days since last donation (≥ 56 days)`
                    : "Eligible · No donation record on file"}
              </span>
            </div>
            {hasRecord && (
              <span className="text-[10px] text-gray-500 font-medium">
                Last: {eligibility.lastDonation}
              </span>
            )}
          </div>

          {/* Request cards */}
          <div className="space-y-5">
            {[
              { id: "#BLD-892", type: "Critical", title: "O- Negative Whole Blood", hospital: "City General", unit: "Trauma Center", dist: "4.2 miles" },
              { id: "#BLD-905", type: "Standard", title: "A+ Whole Blood",           hospital: "St. Mary's",   unit: "Surgery Ward",   dist: "6.1 miles" },
              { id: "#ORG-011", type: "Critical", title: "Kidney — Type B",           hospital: "Metro Medical",unit: "Transplant Dept", dist: "9.8 miles" },
            ].map((req) => (
              <div key={req.id} className={`bg-white rounded-2xl border p-4 sm:p-6 shadow-sm transition-all ${isBlocked ? "border-gray-100 opacity-90" : "border-gray-100 hover:shadow-md"}`}>
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isBlocked ? "bg-gray-100 text-gray-400" : "bg-[#eef4e2] text-[#5b8a3e]"}`}>
                    <IcoBlood />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${req.type === "Critical" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                          {req.type}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">Req ID: {req.id}</span>
                      </div>
                      {isBlocked && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full w-fit">
                          <IcoLock /> Cannot accept yet
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{req.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-5">
                      <span className="font-semibold text-gray-800">{req.hospital}</span>
                      <span>{req.unit}</span>
                      <span>{req.dist}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {isBlocked ? (
                        <>
                          <button className="bg-[#3b5e2b] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#2d4721] transition-colors">
                            Review Request
                          </button>
                          <div className="flex items-center gap-2 border border-gray-200 bg-gray-100 text-gray-400 text-sm font-bold px-5 py-3 rounded-xl cursor-not-allowed select-none">
                            <IcoLock /> Accept — {eligibility.daysRemaining}d remaining
                          </div>
                        </>
                      ) : (
                        <>
                          <button className="bg-[#3b5e2b] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#2d4721] transition-colors">
                            Review Request
                          </button>
                          <button className="border border-gray-200 text-gray-700 text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — Match Analysis */}
        <div className="w-full 2xl:w-[400px] shrink-0">
          <div className={`rounded-3xl border p-5 sm:p-8 h-full ${isBlocked ? "bg-[#f5f0e8] border-orange-200" : "bg-[#eef2e6] border-[#dce6cf]"}`}>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isBlocked ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-600"}`}>
                  {isBlocked ? "Ineligible Period" : "Critical Priority"}
                </span>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-4">Match Analysis</h2>
                <p className="text-xs text-gray-500 mt-1">Req ID: #BLD-892</p>
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

            {/* Recovery progress when blocked */}
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
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg">12 min drive</div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-5">Live Timeline</h4>
              <div className="space-y-5 border-l-2 border-[#5b8a3e] pl-5">
                {[
                  { time: "09:42 AM", text: "Request broadcasted.", color: "text-gray-400" },
                  { time: "09:45 AM", text: "AI identified you as optimal donor.", color: "text-[#5b8a3e]" },
                  { time: "Pending",  text: isBlocked ? `Locked — eligible in ${eligibility.daysRemaining} days.` : "Awaiting your approval.", color: isBlocked ? "text-orange-500" : "text-gray-400" },
                ].map(ev => (
                  <div key={ev.time}>
                    <p className={`text-[11px] ${ev.color} font-bold mb-1`}>{ev.time}</p>
                    <p className="text-sm font-semibold text-gray-800">{ev.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#d2e4c0]">
              {isBlocked ? (
                <>
                  <div className="w-full bg-gray-200 text-gray-400 text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <IcoLock /> Accept Donation Request
                  </div>
                  <p className="text-[11px] text-center text-orange-500 font-semibold mt-3">
                    Available in {eligibility.daysRemaining} day{eligibility.daysRemaining !== 1 ? "s" : ""} on {eligibility.eligibleDate}
                  </p>
                </>
              ) : (
                <>
                  <button className="w-full bg-[#3b5e2b] text-white text-sm font-bold py-4 rounded-xl hover:bg-[#2d4721] transition-colors">
                    Accept Donation Request
                  </button>
                  <p className="text-[11px] text-center text-gray-500 mt-3">By accepting, you agree to arrive within 30 minutes.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}