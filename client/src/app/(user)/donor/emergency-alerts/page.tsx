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

export default function EmergencyAlerts() {
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
                        const isActive = item.id === "alerts"; // ACTIVE ON EMERGENCY ALERTS
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
                            <input type="text" placeholder="Search broadcasts, hospitals..." className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300 shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-[#dc2626] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition-colors">
                            ✱ SOS
                        </button>
                        <button className="text-gray-400 hover:text-gray-700 relative">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
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

                    {/* Header Title & Status */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Live Feed</h2>
                            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                                Real-time alerts for critical shortages and urgent broadcasts in your verified region. High-priority matches are highlighted based on your biological profile.
                            </p>
                        </div>
                        <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-red-600">3 Active Critical Alerts</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ROW 1 */}

                        {/* Critical Match Card (Spans 2 columns) */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-red-100 shadow-sm p-8 relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-widest border border-red-100">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                            Critical Match
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">0 mins ago</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                    </button>
                                </div>

                                <h3 className="text-3xl font-bold text-gray-900 mb-4 pr-10">Immediate Request: O-Negative Blood</h3>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-lg mb-8">
                                    Mass casualty incident reported at Central City Hospital. Severe depletion of universal donor stock. Your profile is a <span className="font-bold text-gray-900">100% biological match</span> for a critically injured pediatric patient.
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Central City Hospital</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            1.8 miles away • Emergency Wing
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-[#dc2626] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    Accept Request
                                </button>
                            </div>
                        </div>

                        {/* Map Radius Card (Spans 1 column) */}
                        <div className="bg-[#eef4f9] rounded-3xl border border-[#d2e4f0] shadow-sm relative overflow-hidden flex flex-col h-[380px]">
                            <div className="absolute inset-0 opacity-40">
                                <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                {/* Fake map streets */}
                                <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
                                    <path d="M-20,50 Q100,120 200,80 T400,200" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M50,-20 Q120,100 80,200 T200,400" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>

                            <div className="p-6 relative z-10 flex justify-between items-start">
                                <div className="bg-white/90 backdrop-blur-sm border border-white px-3 py-2 rounded-xl shadow-sm">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Active Radius</div>
                                    <div className="text-sm font-black text-gray-900">5 Mile Proximity</div>
                                </div>
                                <div className="w-10 h-10 bg-[#3b5e2b] rounded-full flex items-center justify-center text-[#cbf275] shadow-md border-2 border-white">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                                </div>
                            </div>

                            {/* Map Target Center */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping absolute"></div>
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                                </div>
                            </div>

                            <div className="mt-auto p-6 relative z-10">
                                <div className="bg-white/90 backdrop-blur-sm border border-white p-4 rounded-2xl shadow-sm flex items-start gap-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                        Location tracking is currently active to prioritize urgent regional requests.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2 */}

                        {/* High Priority Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:border-[#d2e4c0] hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#f0f5e8] text-[#4d7532] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#4d7532] rounded-full"></span> High Priority
                                </span>
                                <span className="text-xs text-gray-400 font-medium">12 mins ago</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Platelets Needed</h4>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">
                                Oncology ward requires immediate platelet transfusion. Your O- profile is compatible.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    Mercy General • 8mi
                                </p>
                                <button className="text-xs font-bold text-[#3b5e2b] hover:underline">Details</button>
                            </div>
                        </div>

                        {/* Broadcast Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.06a16 16 0 0 0 6.03 6.03l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    Broadcast
                                </span>
                                <span className="text-xs text-gray-400 font-medium">1 hr ago</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">System Status Update</h4>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">
                                Routine maintenance on diagnostic systems at West Side Clinic completed. Services restored.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Network Admin
                                </p>
                                <button className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Dismiss</button>
                            </div>
                        </div>

                        {/* Standard Request Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:border-[#d2e4c0] hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#f0f5e8] text-[#5b8a3e] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                    Standard Request
                                </span>
                                <span className="text-xs text-gray-400 font-medium">2 hrs ago</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">A+ Whole Blood</h4>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">
                                Routine stock replenishment needed for upcoming scheduled elective surgeries this weekend.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    Schedule Now
                                </p>
                                <button className="text-xs font-bold text-[#3b5e2b] hover:underline">Book</button>
                            </div>
                        </div>

                    </div>

                </main>
            </div>
        </div>
    );
}