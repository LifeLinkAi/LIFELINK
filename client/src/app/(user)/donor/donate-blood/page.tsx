

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

export default function BloodManagement() {

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

                            const isActive = item.id === "blood";

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
                                        placeholder="Search..."
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
                    <main className="p-3 sm:p-5 lg:p-8 pt-2 flex-1 max-w-7xl mx-auto w-full overflow-hidden">

                        {/* HEADER */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">

                            <div>
                                <h2 className="text-3xl sm:text-4xl font-serif text-[#1e293b] font-bold mb-2">
                                    Blood Management
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Monitor your donor profile, eligibility, and schedules.
                                </p>
                            </div>

                            <button className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-4 py-3 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                Download Report
                            </button>

                        </div>

                        {/* TOP GRID */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

                            {/* PROFILE */}
                            <div className="xl:col-span-2 bg-gradient-to-br from-[#f6fbee] to-[#ffffff] border border-[#e1ead2] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm relative overflow-hidden">

                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />

                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-10 relative z-10">

                                    <div className="flex gap-4 items-center">

                                        <div className="w-16 h-16 rounded-full bg-[#cbf275] flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                                            <span className="text-xl font-black text-[#2d3a24]">
                                                O+
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                Universal Donor Profile
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-2">

                                                <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-2 py-1 rounded uppercase">
                                                    Verified
                                                </span>

                                                <span className="text-[11px] font-medium text-gray-500">
                                                    ID: D-99482-L
                                                </span>

                                            </div>
                                        </div>
                                    </div>

                                    <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-[#d2e4c0] w-fit">
                                        <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full"></span>
                                        Eligible to Donate
                                    </span>

                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">

                                    <div>

                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                            Donation Cooldown
                                        </p>

                                        <div className="flex items-baseline gap-3">

                                            <span className="text-3xl font-black text-[#5b8a3e]">
                                                Ready
                                                <br />
                                                Now
                                            </span>

                                            <span className="text-[11px] text-gray-500 font-medium">
                                                Last donation:
                                                <br />
                                                62 days ago
                                            </span>

                                        </div>
                                    </div>

                                    <button className="w-full sm:w-auto bg-[#3b5e2b] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-md hover:bg-[#2d4721] transition-colors">
                                        Schedule Donation
                                    </button>

                                </div>
                            </div>

                            {/* STATS */}
                            <div className="xl:col-span-1 flex flex-col gap-6">

                                <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-6 shadow-sm">

                                    <div className="flex items-center gap-4">

                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <IcoBlood />
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                Total Donated
                                            </p>

                                            <p className="text-2xl font-black text-gray-900">
                                                4.5
                                                <span className="text-sm font-medium text-gray-400 ml-1">
                                                    Liters
                                                </span>
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-6 shadow-sm">

                                    <div className="flex items-center gap-4">

                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                            <IcoReq />
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                Lives Impacted
                                            </p>

                                            <p className="text-2xl font-black text-gray-900">
                                                12
                                                <span className="text-sm font-medium text-gray-400 ml-1">
                                                    Patients
                                                </span>
                                            </p>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* APPOINTMENTS */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                            <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm flex flex-col min-w-0">

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                                    <h3 className="text-lg font-bold text-gray-900">
                                        Appointments
                                    </h3>

                                    <button className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:underline w-fit">
                                        View Calendar
                                    </button>

                                </div>

                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">

                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4">
                                        <IcoCal />
                                    </div>

                                    <h4 className="font-bold text-gray-800 mb-2">
                                        No upcoming appointments
                                    </h4>

                                    <p className="text-xs text-gray-500 mb-6">
                                        Your cooldown period has ended.
                                        Local clinics have available slots today.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full">

                                        <button className="flex-1 bg-[#f0f7fb] text-blue-600 border border-blue-100 font-bold text-xs py-3 rounded-xl hover:bg-blue-50 transition-colors">
                                            Today, 2:00 PM
                                        </button>

                                        <button className="flex-1 border border-gray-200 text-gray-600 font-bold text-xs py-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            Tomorrow, 10:00 AM
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URGENT NEEDS */}
                        <div>

                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">

                                <div>

                                    <h3 className="text-lg font-bold text-gray-900">
                                        Urgent Nearby Needs
                                    </h3>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Matched with your O+ profile within 10 miles.
                                    </p>

                                </div>

                                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-2 rounded-full border border-red-100 w-fit">
                                    2 Critical Matches
                                </span>

                            </div>

                            <div className="space-y-4">

                                {[1, 2].map((item) => (

                                    <div
                                        key={item}
                                        className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-shadow"
                                    >

                                        <div className="flex items-center gap-4 min-w-0">

                                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-500 border border-red-100 shrink-0">
                                                O+
                                            </div>

                                            <div className="min-w-0">

                                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                                    Surgical Ward - St. Jude Hospital
                                                </h4>

                                                <div className="flex flex-wrap items-center gap-2 mt-1">

                                                    <span className="text-xs text-gray-500">
                                                        2.4 miles away
                                                    </span>

                                                    <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded uppercase">
                                                        Critical
                                                    </span>

                                                </div>

                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">

                                            <button className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                                                Details
                                            </button>

                                            <button className="w-full sm:w-auto bg-[#3b5e2b] text-white text-xs font-bold px-4 py-3 rounded-lg hover:bg-[#2d4721] transition-colors shadow-sm">
                                                Accept Request
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}