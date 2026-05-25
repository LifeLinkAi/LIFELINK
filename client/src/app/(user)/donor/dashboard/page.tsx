"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------------- ICONS ----------------

const IcoDash = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const IcoReq = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
);

const IcoBlood = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);

const IcoOrgan = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="12" cy="10" r="4" />
        <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
    </svg>
);

const IcoAlert = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IcoCal = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IcoHosp = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const IcoHist = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const IcoChat = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IcoChart = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IcoSet = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" />
    </svg>
);

const IcoMenu = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const IcoClose = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ---------------- NAV ITEMS ----------------

const NAV_ITEMS = [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/donor/dashboard",
        icon: <IcoDash />,
    },
    {
        id: "requests",
        label: "Donation Requests",
        href: "/donor/incoming-requests",
        icon: <IcoReq />,
    },
    {
        id: "blood",
        label: "Blood Donation",
        href: "/donor/donate-blood",
        icon: <IcoBlood />,
    },
    {
        id: "organ",
        label: "Organ Donation",
        href: "/donor/donate-organ",
        icon: <IcoOrgan />,
    },
    {
        id: "alerts",
        label: "Emergency Alerts",
        href: "/donor/emergency-alerts",
        icon: <IcoAlert />,
    },
    {
        id: "availability",
        label: "Availability",
        href: "/donor/availability",
        icon: <IcoCal />,
    },
    {
        id: "hospitals",
        label: "Hospitals",
        href: "/donor/nearby-hospitals",
        icon: <IcoHosp />,
    },
    {
        id: "history",
        label: "History",
        href: "/donor/history",
        icon: <IcoHist />,
    },
    {
        id: "chat",
        label: "Live Chats",
        href: "/donor/live-chats",
        icon: <IcoChat />,
    },
    {
        id: "reports",
        label: "Reports",
        href: "/donor/reports",
        icon: <IcoChart />,
    },
    {
        id: "settings",
        label: "Settings",
        href: "/donor/settings",
        icon: <IcoSet />,
    },
];

// ---------------- COMPONENT ----------------

export default function DonorDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex">
                {/* SIDEBAR */}
                <aside
                    className={`
          fixed top-0 left-0 z-50
          h-screen
          w-[280px] sm:w-72
          bg-white border-r border-gray-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
                >
                    {/* HEADER */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-bold text-sm text-green-900 truncate">
                                    LifeLink Portal
                                </h2>

                                <p className="text-[11px] text-gray-500 truncate">
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
                            const isActive = item.id === "dashboard";

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
                                    <span className="shrink-0">{item.icon}</span>

                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        <button className="w-full bg-[#f1f5eb] text-[#3b5e2b] text-sm font-semibold py-3 rounded-xl hover:bg-[#e4ebd3] transition">
                            Live Chat Support
                        </button>

                        <button className="w-full text-left px-3 py-3 text-sm font-semibold text-gray-500 hover:text-black">
                            Help Center
                        </button>

                        <button className="w-full text-left px-3 py-3 text-sm font-semibold text-red-500 hover:text-red-700">
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex-1 lg:ml-72 min-w-0 flex flex-col">
                    {/* NAVBAR */}
                    <header className="sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur border-b border-gray-100 px-3 sm:px-5 lg:px-8 py-4">
                        <div className="flex items-center justify-between gap-3">
                            {/* LEFT */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    className="lg:hidden text-gray-700"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <IcoMenu />
                                </button>

                                <h1 className="hidden xl:block text-2xl font-bold text-[#3b5e2b]">
                                    LifeLink AI
                                </h1>

                                {/* SEARCH */}
                                <div className="relative flex-1 max-w-full sm:max-w-sm">
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
                                        className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-200"
                                    />
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full transition whitespace-nowrap">
                                    ✱ SOS
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

                    {/* MAIN */}
                    <main className="flex-1 p-3 sm:p-5 lg:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* TOP GRID */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* WELCOME CARD */}
                                <div className="bg-gradient-to-br from-[#eef4e2] to-[#f8faf5] p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-[#e1ead2] relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                                    <div className="relative z-10">
                                        <span className="bg-white/80 text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white inline-block mb-4">
                                            O- Negative Donor
                                        </span>

                                        <h2 className="text-2xl sm:text-4xl font-serif text-[#1e293b] leading-tight">
                                            Welcome back,
                                            <br />
                                            <span className="text-[#3b5e2b] font-bold">
                                                Alexander.
                                            </span>
                                        </h2>

                                        <p className="text-sm text-gray-600 max-w-md mt-4 mb-6 leading-relaxed">
                                            Your readiness status is active and nearby hospitals have
                                            adequate reserves.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/70 p-4 rounded-2xl">
                                                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                                                    Lives Impacted
                                                </div>

                                                <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">
                                                    12
                                                </div>
                                            </div>

                                            <div className="bg-white/70 p-4 rounded-2xl">
                                                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                                                    Donations
                                                </div>

                                                <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">
                                                    8
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STATUS CARD */}
                                <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Readiness Status
                                        </h3>

                                        <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-2 rounded-full uppercase border border-[#d2e4c0] w-fit">
                                            Ready To Donate
                                        </span>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        {/* PROGRESS */}
                                        <div className="relative w-32 h-32 shrink-0">
                                            <svg
                                                className="w-full h-full -rotate-90"
                                                viewBox="0 0 36 36"
                                            >
                                                <path
                                                    strokeWidth="3"
                                                    stroke="#e5e7eb"
                                                    fill="none"
                                                    d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />

                                                <path
                                                    strokeWidth="3"
                                                    stroke="#a5d84a"
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    strokeDasharray="100,100"
                                                    d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>

                                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-[#3b5e2b]">
                                                100%
                                            </div>
                                        </div>

                                        {/* INFO */}
                                        <div className="flex-1 w-full">
                                            <div className="bg-[#f8fafd] p-4 rounded-xl border border-gray-100 mb-4">
                                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                                                    Last Donation
                                                </div>

                                                <div className="font-bold text-gray-900">
                                                    March 14, 2024
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                                                    Update Info
                                                </button>

                                                <button className="flex-1 bg-[#3b5e2b] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#2d4721] transition">
                                                    Schedule Visit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ALERTS */}
                            <div className="bg-[#0b120c] rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 text-white overflow-hidden relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#cbf275] opacity-[0.03] blur-[120px] rounded-full" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                        <h3 className="text-2xl font-serif font-bold">
                                            Nearby Alerts
                                        </h3>

                                        <button className="text-[#cbf275] text-xs font-black tracking-widest uppercase">
                                            View Map
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* ALERT CARD */}
                                        <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                                    <svg
                                                        width="22"
                                                        height="22"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#ef4444"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="text-lg font-bold text-gray-900 truncate">
                                                        O- Negative Needed URGENTLY
                                                    </h4>

                                                    <p className="text-sm text-gray-500 truncate">
                                                        City General Hospital
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit">
                                                Critical
                                            </span>
                                        </div>

                                        {/* ALERT CARD */}
                                        <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-[#eef4e2] flex items-center justify-center shrink-0">
                                                    <svg
                                                        width="22"
                                                        height="22"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#5b8a3e"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="text-lg font-bold text-gray-900 truncate">
                                                        Platelet Donation Request
                                                    </h4>

                                                    <p className="text-sm text-gray-500 truncate">
                                                        Metro Regional Blood Center
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="bg-[#eef4e2] text-[#5b8a3e] text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit">
                                                Standard
                                            </span>
                                        </div>
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