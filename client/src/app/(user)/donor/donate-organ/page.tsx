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

// NAV ITEMS 
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

export default function OrganDonation() {
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
                        const isActive = item.id === "organ"; // ACTIVE ON ORGAN DONATION
                        return (
                            <Link key={item.id} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-[#dcf594] text-[#2d3a24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className={isActive ? "text-[#2d3a24]" : "text-gray-400"}>{item.icon}</span>
                                {item.label}
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
                        <h1 className="text-xl font-bold text-[#3b5e2b]">LifeLink AI</h1>
                        <div className="relative w-[28rem]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search facilities, patients, or resources..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300 shadow-sm" />
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

                {/* PAGE CONTENT */}
                <main className="p-8 pt-2 flex-1 max-w-6xl mx-auto w-full">

                    {/* Header Title & Button */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Organ Donation Management</h2>
                            <p className="text-sm text-gray-500">Securely manage your registry preferences, track medical eligibility, and review legal consent workflows.</p>
                        </div>
                        <button className="text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-5 py-2.5 hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            Update Preferences
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT COLUMN (Span 7) */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Registry Status Card */}
                            <div className="bg-gradient-to-br from-[#f1f7e8] to-[#ffffff] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-[#cbf275] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#bce366]">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3a24" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-gray-900">Registry Status</h3>
                                    </div>

                                    <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-flex items-center gap-1.5 border border-[#bce366]">
                                        <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full"></span>
                                        Active Registered Donor
                                    </span>

                                    <h4 className="text-2xl font-bold text-gray-900 mb-3 mt-2">Full Anatomical Gift Authorized</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-lg">
                                        You have opted to donate all viable organs and tissues for transplant, research, or educational purposes upon verification of clinical death.
                                    </p>

                                    <div className="border-t border-gray-200 pt-6 grid grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Donor ID</div>
                                            <div className="text-xs font-bold text-gray-800">LL-8492-X</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Blood Type</div>
                                            <div className="text-xs font-bold text-gray-800">O Positive (O+)</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Last Updated</div>
                                            <div className="text-xs font-bold text-gray-800">Oct 12, 2023</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Registry State</div>
                                            <div className="text-xs font-bold text-gray-800">National</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Approval Workflow */}
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                    <h3 className="text-lg font-serif font-bold text-gray-900">Legal Approval Workflow</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Valid Document */}
                                    <div className="border border-gray-100 bg-[#fbfdf9] rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#eef4e2] flex items-center justify-center flex-shrink-0 border border-[#d2e4c0]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Initial Consent Directive</h4>
                                                <p className="text-[11px] text-gray-500">Digitally signed & notarized</p>
                                            </div>
                                        </div>
                                        <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1 rounded uppercase">Valid</span>
                                    </div>

                                    {/* Awaiting Document */}
                                    <div className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Next of Kin Acknowledgment</h4>
                                                <p className="text-[11px] text-gray-500">Awaiting designated contact review</p>
                                            </div>
                                        </div>
                                        <button className="text-[10px] font-bold text-gray-600 uppercase hover:text-gray-900">Remind</button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Span 5) */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Medical Eligibility Timeline */}
                            <div className="bg-[#fcfdfa] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm h-[400px]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-serif font-bold text-gray-900">Medical Eligibility</h3>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M14 2v4a2 2 0 0 0 2 2h4l-4-4z" /><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><circle cx="10" cy="13" r="2" /><line x1="10" y1="15" x2="10" y2="18" /></svg>
                                </div>

                                <div className="relative pl-6 border-l-2 border-[#d2e4c0] space-y-8">

                                    {/* Step 1: Cleared */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-0.5 w-6 h-6 bg-[#5b8a3e] rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">Basic Health Screening</h4>
                                        <p className="text-xs text-gray-500">Cleared on Aug 15, 2023</p>
                                    </div>

                                    {/* Step 2: Cleared */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-0.5 w-6 h-6 bg-[#5b8a3e] rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">HLA Tissue Typing</h4>
                                        <p className="text-xs text-gray-500">Profile completed & banked</p>
                                    </div>

                                    {/* Step 3: Pending */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-0.5 w-6 h-6 bg-[#f8f9fa] rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                                            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#3b5e2b]"></div>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">In-Depth Organ Viability</h4>
                                        <p className="text-xs text-gray-500">Pending biannual review</p>
                                    </div>

                                </div>
                            </div>

                            {/* Scheduling & Updates */}
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        <h3 className="text-lg font-serif font-bold text-gray-900">Scheduling & Updates</h3>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#5b8a3e]"></div>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mb-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                    <h4 className="font-bold text-gray-900 mb-2">Standby Status</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
                                        There are no active procurement procedures scheduled. Your profile is continuously cross-referenced with national waitlists.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}