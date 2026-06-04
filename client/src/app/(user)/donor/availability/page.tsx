"use client";
import React, { useState } from "react";
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
const IcoBot = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>;

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

export default function AvailabilityStatus() {
    const [isEmergencyMode, setIsEmergencyMode] = useState(true);

    // Calendar mock data for October 2024
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dates = [
        { date: '', type: 'empty' },
        { date: 1, type: 'normal' },
        { date: 2, type: 'normal' },
        { date: 3, type: 'selected-outline' },
        { date: 4, type: 'selected-outline' },
        { date: 5, type: 'unavailable' },
        { date: 6, type: 'unavailable' },
        { date: 7, type: 'normal' },
        { date: 8, type: 'selected-solid' },
        { date: 9, type: 'normal' },
        { date: 10, type: 'normal' },
        { date: 11, type: 'normal' },
        { date: 12, type: 'normal' },
        { date: 13, type: 'normal' },
    ];

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
                        const isActive = item.id === "availability"; // ACTIVE HIGHLIGHT ON AVAILABILITY
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
                        <div className="relative w-[28rem]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search resources..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300 shadow-sm" />
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

                    {/* Header Title & Subtext */}
                    <div className="mb-8">
                        <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-3 tracking-tight">Availability Status</h2>
                        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                            Manage your active donation windows and opt-in for emergency alerts based on real-time hospital needs in your area.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN (Span 2) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Emergency Mode Card */}
                            <div className="bg-gradient-to-r from-white to-[#f4f7ed] rounded-[2rem] border border-[#e1ead2] p-8 shadow-sm flex items-center justify-between">
                                <div className="max-w-xs">
                                    <span className="bg-[#d5dec3] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-5 inline-block border border-[#c1d0ab]">
                                        High Priority Area
                                    </span>
                                    <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4 leading-tight">Emergency<br />Mode</h3>
                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                        Activate to instantly notify local hospitals that you are available for urgent, immediate transport. This overrides your regular schedule.
                                    </p>
                                </div>

                                {/* Custom Huge Toggle */}
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                                        className={`relative w-28 h-12 rounded-full transition-colors duration-300 shadow-inner flex items-center px-1.5 ${isEmergencyMode ? "bg-[#5b8a3e]" : "bg-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${isEmergencyMode ? "translate-x-16" : "translate-x-0"
                                                }`}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isEmergencyMode ? "#5b8a3e" : "#9ca3af"} strokeWidth="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                                        </div>
                                    </button>
                                    <span className={`text-sm font-black tracking-widest ${isEmergencyMode ? "text-[#5b8a3e]" : "text-gray-400"}`}>
                                        {isEmergencyMode ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                            </div>

                            {/* Availability Window (Calendar) */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900">Availability Window</h3>
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-full px-1.5 py-1">
                                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                        </button>
                                        <span className="text-xs font-bold text-gray-800">October 2024</span>
                                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Custom Calendar Grid */}
                                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-8 px-4">
                                    {/* Days Header */}
                                    {days.map(day => (
                                        <div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{day}</div>
                                    ))}

                                    {/* Dates */}
                                    {dates.map((d, i) => (
                                        <div key={i} className="flex justify-center">
                                            {d.type === 'empty' ? (
                                                <div className="w-12 h-12"></div>
                                            ) : d.type === 'normal' ? (
                                                <div className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 hover:border-green-300 cursor-pointer transition-colors">
                                                    {d.date}
                                                </div>
                                            ) : d.type === 'selected-outline' ? (
                                                <div className="w-12 h-12 rounded-2xl border-2 border-[#5b8a3e] flex flex-col items-center justify-center text-sm font-bold text-gray-900 cursor-pointer relative bg-[#f9fdf5]">
                                                    <span>{d.date}</span>
                                                    <span className="w-1 h-1 bg-[#5b8a3e] rounded-full absolute bottom-2"></span>
                                                </div>
                                            ) : d.type === 'selected-solid' ? (
                                                <div className="w-12 h-12 rounded-2xl bg-[#5b8a3e] flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer">
                                                    {d.date}
                                                </div>
                                            ) : d.type === 'unavailable' ? (
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-400 cursor-not-allowed">
                                                    {d.date}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-6 px-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full border-[3px] border-[#5b8a3e]"></span>
                                            <span className="text-xs text-gray-500 font-medium">Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                                            <span className="text-xs text-gray-500 font-medium">Unavailable</span>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-[#5b8a3e] hover:underline uppercase tracking-wider">
                                        Edit Schedule
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Span 1) */}
                        <div className="space-y-6">

                            {/* Readiness Score */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-0.5">Readiness Score</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Based on recent health sync</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2 mb-8 border-b border-gray-50 pb-6">
                                    <span className="text-6xl font-black text-[#2d3a24]">94</span>
                                    <span className="text-xl font-bold text-gray-400">/ 100</span>
                                    <div className="w-6 h-6 rounded-full bg-[#cbf275] flex items-center justify-center ml-2 border-2 border-white shadow-sm">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-2">
                                            <span className="text-gray-500">Iron Levels</span>
                                            <span className="text-[#3b5e2b]">Optimal</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#3b5e2b] rounded-full" style={{ width: "95%" }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-2">
                                            <span className="text-gray-500">Hydration</span>
                                            <span className="text-[#a5d84a]">Good</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#cbf275] rounded-full" style={{ width: "80%" }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-2">
                                            <span className="text-gray-500">Recovery Time</span>
                                            <span className="text-gray-900">Complete</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-400 rounded-full" style={{ width: "100%" }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insights Block */}
                            <div className="bg-[#eaf1f7] rounded-[2rem] p-6 border border-[#d3e3f0] shadow-sm flex flex-col gap-4">

                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 rounded bg-[#cbf275] flex items-center justify-center shadow-sm">
                                        <IcoBot />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">AI Insights</h3>
                                        <p className="text-[10px] text-gray-500 font-medium">Optimizing your impact</p>
                                    </div>
                                </div>

                                {/* Sub Card 1 */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-white">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 mt-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">High Demand: O- Negative</h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                City General Hospital is reporting critically low reserves. Scheduling a donation this Thursday is highly recommended.
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 ml-11">Book Slot</button>
                                </div>

                                {/* Sub Card 2 */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-white">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500 mt-1">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Optimal Time: Morning</h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                Based on your historical vitals, morning donations yield faster recovery times for you.
                                            </p>
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