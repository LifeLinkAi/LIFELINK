
"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------------- ICONS ----------------

const IcoDash = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const IcoReq = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
);

const IcoBlood = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);

const IcoOrgan = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="10" r="4" />
        <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
    </svg>
);

const IcoAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
);

const IcoCal = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
);

const IcoHosp = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const IcoHist = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
    </svg>
);

const IcoChat = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IcoChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IcoSet = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IcoMenu = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const IcoClose = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ---------------- NAV ITEMS ----------------

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

export default function IncomingRequests() {

    const [activeTab, setActiveTab] = useState("All");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden">

            {/* OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex w-full">

                {/* SIDEBAR */}
                <aside
                    className={`
            fixed top-0 left-0 z-50
            h-screen
            w-[280px]
            bg-white border-r border-gray-100
            flex flex-col
            transition-transform duration-300 ease-in-out
            lg:translate-x-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
                >

                    {/* HEADER */}
                    <div className="p-5 flex items-center justify-between border-b border-gray-100">

                        <div className="flex items-center gap-3 min-w-0">

                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-bold text-sm text-[#2d3a24] truncate">
                                    LifeLink Portal
                                </h2>

                                <p className="text-[10px] text-gray-500 truncate">
                                    Verified Donor
                                </p>
                            </div>
                        </div>

                        <button
                            className="lg:hidden text-gray-500"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <IcoClose />
                        </button>
                    </div>

                    {/* NAVIGATION */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

                        {NAV_ITEMS.map((item) => {

                            const isActive = item.id === "requests";

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3
                    px-3 py-3
                    rounded-xl
                    text-sm font-semibold
                    transition-all
                    ${isActive
                                            ? "bg-[#dcf594] text-[#2d3a24]"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        }
                  `}
                                >

                                    <span className="shrink-0">
                                        {item.icon}
                                    </span>

                                    <span className="truncate">
                                        {item.label}
                                    </span>

                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* MAIN */}
                <div className="flex-1 lg:ml-[280px] min-w-0 flex flex-col">

                    {/* TOPBAR */}
                    <header className="sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur border-b border-gray-100 px-3 sm:px-5 lg:px-8 py-4">

                        <div className="flex items-center justify-between gap-3">

                            {/* LEFT */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">

                                <button
                                    className="lg:hidden text-gray-700 shrink-0"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <IcoMenu />
                                </button>

                                <h1 className="hidden xl:block text-2xl font-bold text-[#3b5e2b]">
                                    LifeLink AI
                                </h1>

                                {/* SEARCH */}
                                <div className="relative flex-1 max-w-sm">

                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>

                                    <input
                                        type="text"
                                        placeholder="Search records..."
                                        className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-200"
                                    />
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-2 sm:gap-4">

                                <button className="bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-full border border-red-100 hover:bg-red-100 transition-colors whitespace-nowrap">
                                    SOS
                                </button>

                                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                            </div>
                        </div>
                    </header>

                    {/* CONTENT */}
                    <main className="flex-1 p-3 sm:p-5 lg:p-8">

                        <div className="flex flex-col 2xl:flex-row gap-6">

                            {/* LEFT SECTION */}
                            <div className="flex-1 min-w-0">

                                {/* HEADING */}
                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">

                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1e293b] leading-tight">
                                            Incoming Requests
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-2">
                                            AI filtered matches based on your donor profile.
                                        </p>
                                    </div>

                                    {/* TABS */}
                                    <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm w-fit">

                                        {["All", "Blood", "Organ"].map((tab) => (

                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`
                          px-4 sm:px-5 py-2
                          rounded-full
                          text-xs sm:text-sm
                          font-bold
                          transition-all
                          ${activeTab === tab
                                                        ? "bg-[#eef4e2] text-[#3b5e2b]"
                                                        : "text-gray-500"
                                                    }
                        `}
                                            >
                                                {tab}
                                            </button>

                                        ))}
                                    </div>
                                </div>

                                {/* REQUEST CARDS */}
                                <div className="space-y-5">

                                    {[1, 2, 3].map((item) => (

                                        <div
                                            key={item}
                                            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
                                        >

                                            <div className="flex flex-col lg:flex-row gap-5">

                                                {/* ICON */}
                                                <div className="w-12 h-12 rounded-full bg-[#eef4e2] flex items-center justify-center shrink-0 text-[#5b8a3e]">
                                                    <IcoBlood />
                                                </div>

                                                {/* CONTENT */}
                                                <div className="flex-1 min-w-0">

                                                    {/* TOP */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                                                        <div className="flex flex-wrap gap-2">

                                                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                                                Critical
                                                            </span>

                                                            <span className="text-[11px] text-gray-400 font-semibold">
                                                                Req ID: #BLD-892
                                                            </span>

                                                        </div>

                                                        <div className="text-left sm:text-right">





                                                        </div>
                                                    </div>

                                                    {/* TITLE */}
                                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                                        O- Negative Whole Blood
                                                    </h3>

                                                    {/* HOSPITAL */}
                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-5">

                                                        <span className="font-semibold text-gray-800">
                                                            City General
                                                        </span>

                                                        <span>
                                                            Trauma Center
                                                        </span>

                                                        <span>
                                                            4.2 miles
                                                        </span>

                                                    </div>

                                                    {/* BUTTONS */}
                                                    <div className="flex flex-col sm:flex-row gap-3">

                                                        <button className="bg-[#3b5e2b] text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#2d4721] transition-colors">
                                                            Review Request
                                                        </button>

                                                        <button className="border border-gray-200 text-gray-700 text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                            Dismiss
                                                        </button>

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

                                    {/* TOP */}
                                    <div className="flex items-start justify-between gap-4 mb-8">

                                        <div>

                                            <span className="bg-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                                Critical Priority
                                            </span>

                                            <h2 className="text-2xl font-serif font-bold text-gray-900 mt-4">
                                                Match Analysis
                                            </h2>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Req ID: #BLD-892
                                            </p>

                                        </div>



                                    </div>

                                    {/* PROGRESS */}
                                    <div className="space-y-5 mb-8">

                                        <div>

                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-semibold text-gray-700">
                                                    Blood Type Match
                                                </span>

                                                <span className="font-bold text-[#5b8a3e]">
                                                    100%
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full w-full bg-[#5b8a3e]" />
                                            </div>

                                        </div>

                                        <div>

                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-semibold text-gray-700">
                                                    Antigen Match
                                                </span>

                                                <span className="font-bold text-[#5b8a3e]">
                                                    96%
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full w-[96%] bg-[#5b8a3e]" />
                                            </div>

                                        </div>

                                    </div>

                                    {/* MAP */}
                                    <div className="h-40 rounded-2xl bg-[#1b2a24] mb-8 relative overflow-hidden">

                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-lg">
                                            12 min drive
                                        </div>

                                    </div>

                                    {/* TIMELINE */}
                                    <div>

                                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-5">
                                            Live Timeline
                                        </h4>

                                        <div className="space-y-5 border-l-2 border-[#5b8a3e] pl-5">

                                            <div>
                                                <p className="text-[11px] text-gray-400 font-bold mb-1">
                                                    09:42 AM
                                                </p>

                                                <p className="text-sm font-semibold text-gray-800">
                                                    Request broadcasted.
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] text-[#5b8a3e] font-bold mb-1">
                                                    09:45 AM
                                                </p>

                                                <p className="text-sm font-semibold text-gray-800">
                                                    AI identified you as optimal donor.
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] text-gray-400 font-bold mb-1">
                                                    Pending
                                                </p>

                                                <p className="text-sm font-semibold text-gray-500">
                                                    Awaiting your approval.
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    {/* BUTTON */}
                                    <div className="mt-8 pt-6 border-t border-[#d2e4c0]">

                                        <button className="w-full bg-[#3b5e2b] text-white text-sm font-bold py-4 rounded-xl hover:bg-[#2d4721] transition-colors">
                                            Accept Donation Request
                                        </button>

                                        <p className="text-[11px] text-center text-gray-500 mt-3">
                                            By accepting, you agree to arrive within 30 minutes.
                                        </p>

                                    </div>

                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}