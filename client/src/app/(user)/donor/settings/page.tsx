
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

export default function Settings() {
    // Toggle states
    const [bloodEnabled, setBloodEnabled] = useState(true);
    const [organEnabled, setOrganEnabled] = useState(true);
    const [twoFactor, setTwoFactor] = useState(true);
    const [anonData, setAnonData] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-gray-900">

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#f8f9fa] border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" /></div>
                    <div><h2 className="font-bold text-[#3b5e2b] text-sm leading-tight">LifeLink Portal</h2><p className="text-[10px] text-gray-500 font-medium">Verified Donor</p></div>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.id === "settings";
                        return (
                            <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-[#dcf594] text-[#2d3a24]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
                                <span className={isActive ? "text-[#2d3a24]" : "text-gray-400"}>{item.icon}</span>{item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-5 space-y-2 border-t border-gray-200">
                    <button className="w-full bg-[#f1f5eb] text-[#3b5e2b] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e4ebd3] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Live Chat Support
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 mt-2">
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
            <div className="flex-1 pl-64 flex flex-col min-h-screen bg-white rounded-tl-[2.5rem] shadow-sm ml-1">

                <header className="px-8 py-5 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md rounded-tl-[2.5rem]">
                    <div className="relative w-[28rem]">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input type="text" placeholder="Search settings..." className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300 shadow-sm" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-[#dc2626] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition-colors">
                            ✱ SOS
                        </button>
                        <button className="text-gray-400 hover:text-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden ml-2 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <main className="p-10 pt-4 flex-1 max-w-6xl mx-auto w-full">

                    <div className="mb-10">
                        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Settings</h1>
                        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                            Manage your personal profile, adjust biological donation parameters, and configure security preferences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Profile */}
                        <div className="lg:col-span-4">
                            <div className="bg-gradient-to-b from-[#f2f8e8] to-white border border-[#e1ead2] p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
                                {/* Decorative Background Blob */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7f79c] opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                                <div className="relative inline-block mb-4 mt-2">
                                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-[#3b5e2b] text-[#cbf275] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#2d4721] transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                    </button>
                                </div>

                                <h2 className="font-serif font-bold text-2xl text-gray-900 mb-1">Alex Mercer</h2>
                                <div className="flex items-center justify-center gap-1.5 mb-8">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span className="text-xs text-gray-600 font-medium">Verified Status</span>
                                </div>

                                <div className="space-y-5 text-left relative z-10">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">Email Address</label>
                                        <input className="w-full bg-[#f8f9fa] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300" value="alex.mercer@example.com" readOnly />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">Phone Number</label>
                                        <input className="w-full bg-[#f8f9fa] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300" value="+1 (555) 019-2834" readOnly />
                                    </div>
                                    <button className="w-full bg-[#e8f1f8] text-blue-600 border border-blue-100 py-3.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors mt-2">
                                        Update Profile Info
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Parameters & Security */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Donation Parameters */}
                            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#f0f5e8] text-[#4d7532] flex items-center justify-center shadow-sm border border-[#d2e4c0]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                        </div>
                                        <h3 className="font-serif font-bold text-xl text-gray-900">Donation Parameters</h3>
                                    </div>
                                    <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Active Donor</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Blood Config */}
                                    <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                        <div className="flex justify-between items-center mb-5">
                                            <div className="flex items-center gap-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                                <span className="font-bold text-sm text-gray-900">Blood Donation</span>
                                            </div>
                                            {/* Toggle */}
                                            <button onClick={() => setBloodEnabled(!bloodEnabled)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${bloodEnabled ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${bloodEnabled ? "translate-x-6" : "translate-x-0"}`}></div>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Blood Type</span>
                                                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800">O- Negative</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Availability Radius</span>
                                                <select className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 focus:outline-none">
                                                    <option>10 Miles</option>
                                                    <option selected>25 Miles</option>
                                                    <option>50 Miles</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organ Config */}
                                    <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><circle cx="12" cy="10" r="4" /><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" /></svg>
                                                <span className="font-bold text-sm text-gray-900">Organ Registration</span>
                                            </div>
                                            {/* Toggle */}
                                            <button onClick={() => setOrganEnabled(!organEnabled)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${organEnabled ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${organEnabled ? "translate-x-6" : "translate-x-0"}`}></div>
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-gray-600 leading-relaxed mb-4">
                                            Registered as a full organ and tissue donor under the National Healthcare Registry.
                                        </p>
                                        <Link href="#" className="text-xs font-bold text-[#5b8a3e] hover:underline flex items-center gap-1">
                                            View Legal Registry
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Security & Authentication */}
                            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] text-[#3b82f6] flex items-center justify-center shadow-sm border border-[#d3e3f0]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="11" r="3" /></svg>
                                    </div>
                                    <h3 className="font-serif font-bold text-xl text-gray-900">Security & Authentication</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* 2FA */}
                                    <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="text-[#3b5e2b] mt-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg></div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 mb-1">Two-Factor Authentication (2FA)</h4>
                                                <p className="text-[11px] text-gray-500">Adds an extra layer of security requiring a code from your mobile device.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${twoFactor ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${twoFactor ? "translate-x-6" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>

                                    {/* Password */}
                                    <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 mb-1">Account Password</h4>
                                            <p className="text-[11px] text-gray-500">Last updated 45 days ago.</p>
                                        </div>
                                        <button className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                            Change
                                        </button>
                                    </div>



                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end items-center gap-4 pt-4">
                                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">
                                    Discard Changes
                                </button>
                                <button className="bg-[#3b5e2b] text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#2d4721] transition-colors">
                                    Save Settings
                                </button>
                            </div>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}