"use client";
import React from "react";

export default function ReportsAnalytics() {
    return (
        <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-[#3b5e2b] mb-3">Reports &amp; Analytics</h1>
                    <p className="text-sm text-gray-500 max-w-xl leading-relaxed">Comprehensive insights and data forecasting for your community impact.</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <button className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Last 30 Days
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button className="bg-[#3b5e2b] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-[#2d4721] transition-colors flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export Master Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, bg: "bg-[#4d7532]", badge: "+12% this mo", label: "Total Lives Impacted", value: "2,480", badgeColor: "" },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>, bg: "bg-gray-600", badge: "+5% this mo", label: "Successful Matches", value: "845", badgeColor: "" },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><circle cx="12" cy="14" r="3"/></svg>, bg: "bg-red-50 text-red-500 border border-red-100", badge: "Action Needed", label: "Active Open Requests", value: "112", badgeColor: "red" },
                ].map((card, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col h-full justify-between hover:shadow-md transition-shadow">
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-40 rounded-bl-full translate-x-8 -translate-y-8 ${i === 0 ? "bg-[#dcf594]" : i === 1 ? "bg-gray-200" : "bg-red-100"}`} />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${i < 2 ? card.bg : card.bg}`}>{card.icon}</div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${card.badgeColor === "red" ? "bg-red-50 text-red-600 border border-red-100" : "bg-[#cbf275] text-[#3b5e2b]"}`}>{card.badge}</span>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="text-[11px] text-gray-500 font-medium mb-1">{card.label}</div>
                            <div className="text-3xl font-serif font-bold text-gray-900">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-serif font-bold text-xl text-gray-900">Donation Volume Trends</h3>
                        <p className="text-[11px] text-gray-500 mt-1">Organ vs Blood contributions over the last 6 months.</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-700">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                </div>
                <div className="h-72 mt-8 relative w-full">
                    <div className="absolute inset-0 flex flex-col justify-between border-l border-gray-200 pl-4 py-2">
                        <div className="border-b border-gray-100 w-full relative"><span className="absolute -left-8 -top-2 text-[10px] text-gray-400 font-bold">1K</span></div>
                        <div className="border-b border-gray-100 w-full" />
                        <div className="border-b border-gray-100 w-full relative"><span className="absolute -left-8 -top-2 text-[10px] text-gray-400 font-bold">500</span></div>
                        <div className="w-full" />
                    </div>
                    <div className="absolute inset-0 pl-12 flex items-end justify-between pr-8 pb-2">
                        <div className="w-12 bg-gray-200 rounded-t-lg h-[30%]" />
                        <div className="w-12 bg-gray-200 rounded-t-lg h-[45%]" />
                        <div className="w-12 bg-[#3b5e2b] rounded-t-lg h-[70%]" />
                        <div className="w-12 bg-[#cbf275] rounded-t-lg h-[90%] shadow-lg shadow-[#cbf275]/20" />
                        <div className="w-12 bg-[#3b5e2b] rounded-t-lg h-[60%]" />
                        <div className="w-12 bg-gray-200 rounded-t-lg h-[50%]" />
                    </div>
                </div>
            </div>
        </main>
    );
}