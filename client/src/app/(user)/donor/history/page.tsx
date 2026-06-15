"use client";
import React from "react";
import { useDonationHistory } from "@/hooks/useDonationHistory";
import { DonationRecord } from "@/services/historyService";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "text-[#5b8a3e]",
    Pending: "text-amber-600",
    Cancelled: "text-gray-400",
  };
  return (
    <p className={`text-[10px] font-bold flex items-center gap-1 ${map[status] ?? "text-gray-500"}`}>
      {status === "Completed" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      )}
      {status}
    </p>
  );
}

function TypeIcon({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    Blood: "bg-red-50 text-red-500 border-red-100",
    Platelet: "bg-[#f0f5e8] text-[#4d7532] border-[#d2e4c0]",
    Plasma: "bg-yellow-50 text-yellow-600 border-yellow-100",
    Organ: "bg-purple-50 text-purple-500 border-purple-100",
  };
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0 ${colorMap[type] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    </div>
  );
}

function SkeletonStat() {
  return <div className="bg-white border border-[#e1ead2] rounded-3xl p-6 animate-pulse"><div className="h-4 bg-gray-100 rounded w-1/2 mb-3" /><div className="h-10 bg-gray-100 rounded w-1/3" /></div>;
}

export default function DonationHistory() {
  const { history, stats, isLoading, error, refetch } = useDonationHistory();

  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-[#3b5e2b] mb-3">Donation History</h1>
        <p className="text-sm text-gray-500 max-w-2xl">A comprehensive timeline of your life-saving contributions, medical reports, and overall community impact.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {isLoading ? (
          <><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#f2f8e8] to-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b8a3e" stroke="#5b8a3e" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  <span className="text-[11px] text-[#5b8a3e] font-black uppercase tracking-wider">Est. Lives Impacted</span>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{stats.livesImpacted}</div>
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-4">
                Based on {stats.totalDonations} donation{stats.totalDonations !== 1 ? "s" : ""}.
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f6f9f2] to-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b8a3e" stroke="#5b8a3e" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                  <span className="text-[11px] text-[#5b8a3e] font-black uppercase tracking-wider">Total Volume</span>
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {stats.totalVolumeLiters} <span className="text-lg font-medium text-gray-500">Liters</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-4">Cumulative donated volume.</div>
            </div>

            <div className="bg-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span className="text-[11px] text-gray-900 font-black uppercase tracking-wider">Total Donations</span>
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900">{stats.totalDonations}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-4">Completed donation sessions.</div>
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Detailed Record</h3>
          <button onClick={refetch} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-red-700 mb-3">{error}</p>
            <button onClick={refetch} className="text-xs font-bold text-[#3b5e2b] border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8]">Retry</button>
          </div>
        )}

        {!isLoading && !error && history.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#eef4e2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5b8a3e]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">No donation history yet</h4>
            <p className="text-sm text-gray-500">Accept a request on the Incoming Requests page to create your first record.</p>
          </div>
        )}

        {!isLoading && !error && history.length > 0 && (
          <div className="relative border-l-2 border-[#e1ead2] ml-5 pl-8 space-y-6 pb-4">
            {history.map((rec: DonationRecord, idx: number) => (
              <div key={rec.id} className="relative">
                <div className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#f8f9fa] ${rec.status === "Completed" ? "bg-[#cbf275]" : rec.status === "Pending" ? "bg-amber-300" : "bg-gray-300"}`} />
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    <TypeIcon type={rec.donationType} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        {rec.donationType === "Blood" ? "Whole Blood Donation"
                          : rec.donationType === "Platelet" ? "Platelet Apheresis"
                          : rec.donationType === "Plasma" ? "Plasma Donation"
                          : "Organ Donation"}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-medium">
                        {rec.facility || "Unknown facility"}
                        {rec.volumeMl > 0 ? ` · ${rec.volumeMl}ml` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="text-left md:text-right mr-4">
                      <p className="text-[13px] font-bold text-gray-900 mb-1">{formatDate(rec.donationDate)}</p>
                      <StatusBadge status={rec.status} />
                    </div>
                    <div className="flex gap-2">
                      <span className="border border-gray-200 text-gray-500 text-[11px] font-bold px-4 py-2 rounded-xl bg-gray-50">
                        {rec.bloodType || rec.donationType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
