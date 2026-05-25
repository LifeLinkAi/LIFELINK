
"use client";
import React from "react";
import Link from "next/link";

// --- SVG Icons ---
const IcoDash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
const IcoReq = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /></svg>;
const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcoOrgan = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="4" /><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" /></svg>;
const IcoAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IcoCal = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcoHosp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const IcoHist = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IcoChart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcoSet = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", href: "/donor/dashboard", icon: <IcoDash /> },
    { id: "requests", label: "Donation Requests", href: "/donor/incoming-requests", icon: <IcoReq /> },
    { id: "blood", label: "Blood Donation", href: "/donor/donate-blood", icon: <IcoBlood /> },
    { id: "organ", label: "Organ Donation", href: "/donor/donate-organ", icon: <IcoOrgan /> },
    { id: "alerts", label: "Emergency Alerts", href: "/donor/emergency-alerts", icon: <IcoAlert /> },
    { id: "availability", label: "Availability Status", href: "/donor/availability", icon: <IcoCal /> },
    { id: "hospitals", label: "Nearby Hospitals", href: "/donor/nearby-hospitals", icon: <IcoHosp /> },
    { id: "history", label: "History", href: "/donor/history", icon: <IcoHist /> },
    { id: "live-chats", label: "Live Chats", href: "/donor/live-chats", icon: <IcoChat /> },
    { id: "reports", label: "Reports", href: "/donor/reports", icon: <IcoChart /> },
    { id: "settings", label: "Settings", href: "/donor/settings", icon: <IcoSet /> },
];

export default function DonationHistory() {
    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-gray-900">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="font-bold text-green-900 text-sm leading-tight">LifeLink Portal</h2>
                        <p className="text-[10px] text-gray-500 font-medium">Verified Donor</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.id === "history";
                        return (
                            <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-[#dcf594] text-[#2d3a24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                <span className={isActive ? "text-[#2d3a24]" : "text-gray-400"}>{item.icon}</span>{item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-5 space-y-2 border-t border-gray-50">
                    <button className="w-full bg-[#f1f5eb] text-[#3b5e2b] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e4ebd3] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Live Chat Support
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        Help Center
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 pl-64 flex flex-col min-h-screen">

                {/* TOP NAVBAR */}
                <header className="bg-[#f8f9fa] px-8 py-5 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-[28rem]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search records..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300 shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-red-100 hover:bg-red-100 transition-colors">
                            SOS
                        </button>
                        <button className="text-gray-400 hover:text-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="6" /><circle cx="16" cy="12" r="2" /></svg>
                        </button>
                        <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden ml-2 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <main className="p-8 pt-2 max-w-5xl mx-auto w-full">

                    {/* Header Title & Subtext */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif font-bold text-[#3b5e2b] mb-3">Donation History</h1>
                        <p className="text-sm text-gray-500 max-w-2xl">
                            A comprehensive timeline of your life-saving contributions, medical reports, and overall community impact.
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                        {/* Card 1 */}
                        <div className="bg-gradient-to-br from-[#f2f8e8] to-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b8a3e" stroke="#5b8a3e" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    <span className="text-[11px] text-[#5b8a3e] font-black uppercase tracking-wider">Est. Lives Impacted</span>
                                </div>
                                <div className="text-5xl font-bold text-gray-900 mb-2">24</div>
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium mt-4">Based on 8 whole blood donations.</div>
                        </div>

                        {/* Card 2 */}
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

                        {/* Card 3 (Bar Chart Mock) */}
                        <div className="bg-white border border-[#e1ead2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                                    <span className="text-[11px] text-gray-900 font-black uppercase tracking-wider">Donation Frequency</span>
                                </div>
                                <span className="bg-[#f2f8e8] text-[#5b8a3e] text-[9px] font-bold px-2 py-1 rounded">2023 - 2024</span>
                            </div>
                            <div className="flex items-end gap-3 h-16 mt-auto">
                                <div className="w-full bg-gray-200 rounded-sm h-[30%]"></div>
                                <div className="w-full bg-[#4d7532] rounded-sm h-[80%]"></div>
                                <div className="w-full bg-[#3b5e2b] rounded-sm h-[50%]"></div>
                                <div className="w-full bg-[#cbf275] rounded-sm h-[100%]"></div>
                            </div>
                        </div>

                    </div>

                    {/* Detailed Records Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Detailed Record</h3>
                            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
                                Filter
                            </button>
                        </div>

                        {/* Timeline Container */}
                        <div className="relative border-l-2 border-[#e1ead2] ml-5 pl-8 space-y-6 pb-4">

                            {/* Record 1 */}
                            <div className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#cbf275] border-4 border-[#f8f9fa] rounded-full"></div>

                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-center w-full md:w-auto">
                                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100 flex-shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">Whole Blood Donation</h4>
                                            <p className="text-[12px] text-gray-500 font-medium">Metro General Hospital • 450ml</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto mt-4 md:mt-0">
                                        <div className="text-left md:text-right mr-4">
                                            <p className="text-[13px] font-bold text-gray-900 mb-1">October 12, 2023</p>
                                            <p className="text-[10px] text-[#5b8a3e] font-bold flex items-center md:justify-end gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                Completed
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                                Medical Report
                                            </button>
                                            <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                                                Certificate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Record 2 */}
                            <div className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 border-4 border-[#f8f9fa] rounded-full"></div>

                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-center w-full md:w-auto">
                                        <div className="w-12 h-12 bg-[#f0f5e8] rounded-full flex items-center justify-center text-[#4d7532] border border-[#d2e4c0] flex-shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">Platelet Apheresis</h4>
                                            <p className="text-[12px] text-gray-500 font-medium">LifeLink Central Clinic • Single Unit</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto mt-4 md:mt-0">
                                        <div className="text-left md:text-right mr-4">
                                            <p className="text-[13px] font-bold text-gray-900 mb-1">June 05, 2023</p>
                                            <p className="text-[10px] text-[#5b8a3e] font-bold flex items-center md:justify-end gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                Completed
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                                Medical Report
                                            </button>
                                            <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                                                Certificate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Record 3 */}
                            <div className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 border-4 border-[#f8f9fa] rounded-full"></div>

                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-center w-full md:w-auto">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200 flex-shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M12 8v4l3 3" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">Whole Blood Donation</h4>
                                            <p className="text-[12px] text-gray-500 font-medium">Mobile Drive: City Square • 450ml</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto mt-4 md:mt-0">
                                        <div className="text-left md:text-right mr-4">
                                            <p className="text-[13px] font-bold text-gray-500 mb-1">January 18, 2023</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="border border-gray-200 text-gray-600 text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                Download Archive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
