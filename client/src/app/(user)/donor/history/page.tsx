"use client";
import React from "react";

export default function DonationHistory() {
  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-[#3b5e2b] mb-3">Donation History</h1>
        <p className="text-sm text-gray-500 max-w-2xl">A comprehensive timeline of your life-saving contributions, medical reports, and overall community impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-[#f2f8e8] to-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b8a3e" stroke="#5b8a3e" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              <span className="text-[11px] text-[#5b8a3e] font-black uppercase tracking-wider">Est. Lives Impacted</span>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">24</div>
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-4">Based on 8 whole blood donations.</div>
        </div>
        <div className="bg-gradient-to-br from-[#f6f9f2] to-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b8a3e" stroke="#5b8a3e" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
              <span className="text-[11px] text-[#5b8a3e] font-black uppercase tracking-wider">Total Volume</span>
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">4.2 <span className="text-lg font-medium text-gray-500">Liters</span></div>
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-4">Top 15% of regional donors this year.</div>
        </div>
        <div className="bg-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              <span className="text-[11px] text-gray-900 font-black uppercase tracking-wider">Donation Frequency</span>
            </div>
            <span className="bg-[#f2f8e8] text-[#5b8a3e] text-[9px] font-bold px-2 py-1 rounded">2023 - 2024</span>
          </div>
          <div className="flex items-end gap-3 h-16 mt-auto">
            <div className="w-full bg-gray-200 rounded-sm h-[30%]" />
            <div className="w-full bg-[#4d7532] rounded-sm h-[80%]" />
            <div className="w-full bg-[#3b5e2b] rounded-sm h-[50%]" />
            <div className="w-full bg-[#cbf275] rounded-sm h-[100%]" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Detailed Record</h3>
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
            Filter
          </button>
        </div>
        <div className="relative border-l-2 border-[#e1ead2] ml-5 pl-8 space-y-6 pb-4">
          {[
            { dot: "bg-[#cbf275]", iconBg: "bg-red-50 text-red-500 border-red-100", title: "Whole Blood Donation", sub: "Metro General Hospital • 450ml", date: "October 12, 2023", status: "Completed", statusColor: "text-[#5b8a3e]" },
            { dot: "bg-gray-300", iconBg: "bg-[#f0f5e8] text-[#4d7532] border-[#d2e4c0]", title: "Platelet Apheresis", sub: "LifeLink Central Clinic • Single Unit", date: "June 05, 2023", status: "Completed", statusColor: "text-[#5b8a3e]" },
            { dot: "bg-gray-300", iconBg: "bg-gray-100 text-gray-500 border-gray-200", title: "Whole Blood Donation", sub: "Mobile Drive: City Square • 450ml", date: "January 18, 2023", status: null, statusColor: "" },
          ].map((rec) => (
            <div key={rec.date} className="relative">
              <div className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 ${rec.dot} border-4 border-[#f8f9fa] rounded-full`} />
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className={`w-12 h-12 rounded-full ${rec.iconBg} flex items-center justify-center border flex-shrink-0`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{rec.title}</h4>
                    <p className="text-[12px] text-gray-500 font-medium">{rec.sub}</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-left md:text-right mr-4">
                    <p className="text-[13px] font-bold text-gray-900 mb-1">{rec.date}</p>
                    {rec.status && <p className={`text-[10px] ${rec.statusColor} font-bold flex items-center gap-1`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {rec.status}
                    </p>}
                  </div>
                  <div className="flex gap-2">
                    <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Medical Report</button>
                    <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">Certificate</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
