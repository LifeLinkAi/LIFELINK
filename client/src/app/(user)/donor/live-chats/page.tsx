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

export default function LiveChats() {
    return (
        <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[#3b5e2b] text-sm leading-tight">LifeLink Portal</h2>
                        <p className="text-[10px] text-gray-500 font-medium">Verified Donor</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.id === "live-chats";
                        return (
                            <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-[#dcf594] text-[#2d3a24]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
                                <span className={isActive ? "text-[#2d3a24]" : "text-gray-400"}>{item.icon}</span>{item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-5 space-y-2 border-t border-gray-200">
                    <button className="w-full bg-[#3b5e2b] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2d4721] transition-colors shadow-sm">
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 pl-64 flex flex-col h-screen">

                {/* TOP NAVBAR */}
                <header className="bg-white px-8 py-5 flex items-center justify-between z-40 border-b border-gray-200">
                    <div className="flex items-center gap-6 flex-1">
                        <h1 className="text-xl font-bold text-[#3b5e2b]">LifeLink AI</h1>
                        <div className="relative w-[28rem]">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search resources or records..." className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:bg-white focus:border-green-300 focus:ring-1 focus:ring-green-300 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-700">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="6" /><circle cx="16" cy="12" r="2" /></svg>
                        </button>
                        <button className="bg-[#dc2626] text-white text-xs font-bold px-5 py-2 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition-colors">
                            SOS
                        </button>
                    </div>
                </header>

                {/* CHAT LAYOUT */}
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT PANEL (Chat List) */}
                    <div className="w-[340px] bg-[#f8f9fa] border-r border-gray-200 flex flex-col">

                        {/* Protocol Pin Card */}
                        <div className="bg-[#eef5e5] p-6 border-b border-[#dce8c8]">
                            <div className="flex items-start gap-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="2.5" className="mt-1 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">Emergency Ready Protocol</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Your blood type (O-) is currently in high demand at St. Jude's. Keep status updated.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Active Chat Item */}
                        <div className="bg-[#e8effc] p-5 border-b border-[#d4e1f9] cursor-pointer flex gap-4">
                            <div className="w-12 h-12 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 relative">
                                S
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#e8effc] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm truncate pr-2">St. Jude Medical Center</h4>
                                    <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap mt-0.5">10:42 AM</span>
                                </div>
                                <p className="text-xs text-green-700 font-medium">Typing...</p>
                            </div>
                        </div>

                        {/* Inactive Chat Item */}
                        <div className="p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex gap-4">
                            <div className="w-12 h-12 bg-[#e2e8f0] text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M12 8v4" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm truncate pr-2">LifeLink Support AI</h4>
                                    <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap mt-0.5">Yesterday</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate leading-relaxed">
                                    Your recent records have been securely uploaded.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT PANEL (Chat Window) */}
                    <div className="flex-1 flex flex-col bg-white">

                        {/* Chat Header */}
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-lg">S</div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">St. Jude Medical Center</h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-xs text-gray-500 font-medium">Online – Dr. Aris</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-700 p-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">

                            {/* Date Badge */}
                            <div className="flex justify-center mb-8">
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wide">
                                    Today, Oct 24
                                </span>
                            </div>

                            {/* Received Message */}
                            <div className="flex gap-4 max-w-2xl">
                                <div className="w-8 h-8 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">S</div>
                                <div>
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                        <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                                            Hello, thank you for being on standby. We are currently reviewing your recent lab results for a potential match.
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-semibold mt-2 ml-1 block">10:30 AM</span>
                                </div>
                            </div>

                            {/* Sent Message */}
                            <div className="flex gap-4 max-w-2xl ml-auto justify-end">
                                <div>
                                    <div className="bg-[#3b5e2b] text-white rounded-2xl rounded-tr-none p-5 shadow-sm">
                                        <p className="text-[13px] leading-relaxed font-medium">
                                            Understood. I have also uploaded my latest physical exam records just in case.
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-semibold mt-2 mr-1 block text-right">10:35 AM</span>
                                </div>
                            </div>

                            {/* Sent Attachment */}
                            <div className="flex gap-4 max-w-md ml-auto justify-end">
                                <div>
                                    <div className="bg-[#f0f4f8] border border-[#e2e8f0] rounded-2xl rounded-tr-none p-4 flex items-center gap-4 cursor-pointer hover:bg-[#e6edf4] transition-colors">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-700">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Physical_Exam_Oct24.pdf</p>
                                            <p className="text-[11px] text-gray-500 font-medium">2.4 MB</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-semibold mt-2 mr-1 block text-right">10:36 AM</span>
                                </div>
                            </div>

                            {/* Typing Indicator */}
                            <div className="flex gap-4 max-w-2xl">
                                <div className="w-8 h-8 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">S</div>
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-1.5 h-12">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>

                        </div>

                        {/* Input Area */}
                        <div className="bg-[#f8f9fa] p-6 border-t border-gray-200">
                            <div className="bg-white border border-gray-300 rounded-full flex items-center px-2 py-1.5 shadow-sm focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all">
                                <button className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}