"use client";
import React, { useState } from "react";

const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;

export default function IncomingRequests() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col 2xl:flex-row gap-6">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
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
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#eef4e2] flex items-center justify-center shrink-0 text-[#5b8a3e]"><IcoBlood /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Critical</span>
                        <span className="text-[11px] text-gray-400 font-semibold">Req ID: #BLD-892</span>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">O- Negative Whole Blood</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-5">
                      <span className="font-semibold text-gray-800">City General</span>
                      <span>Trauma Center</span>
                      <span>4.2 miles</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-[#3b5e2b] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#2d4721] transition-colors">Review Request</button>
                      <button className="border border-gray-200 text-gray-700 text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full 2xl:w-[400px] shrink-0">
          <div className="bg-[#eef2e6] rounded-3xl border border-[#dce6cf] p-5 sm:p-8 h-full">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Critical Priority</span>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-4">Match Analysis</h2>
                <p className="text-xs text-gray-500 mt-1">Req ID: #BLD-892</p>
              </div>
            </div>
            <div className="space-y-5 mb-8">
              {[{ label: "Blood Type Match", pct: "100%", w: "full" }, { label: "Antigen Match", pct: "96%", w: "[96%]" }].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">{m.label}</span>
                    <span className="font-bold text-[#5b8a3e]">{m.pct}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full w-${m.w} bg-[#5b8a3e]`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-[#1b2a24] mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg">12 min drive</div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-5">Live Timeline</h4>
              <div className="space-y-5 border-l-2 border-[#5b8a3e] pl-5">
                {[{ time: "09:42 AM", text: "Request broadcasted.", color: "text-gray-400" },
                { time: "09:45 AM", text: "AI identified you as optimal donor.", color: "text-[#5b8a3e]" },
                { time: "Pending", text: "Awaiting your approval.", color: "text-gray-400" }].map(ev => (
                  <div key={ev.time}>
                    <p className={`text-[11px] ${ev.color} font-bold mb-1`}>{ev.time}</p>
                    <p className="text-sm font-semibold text-gray-800">{ev.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#d2e4c0]">
              <button className="w-full bg-[#3b5e2b] text-white text-sm font-bold py-4 rounded-xl hover:bg-[#2d4721] transition-colors">Accept Donation Request</button>
              <p className="text-[11px] text-center text-gray-500 mt-3">By accepting, you agree to arrive within 30 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}