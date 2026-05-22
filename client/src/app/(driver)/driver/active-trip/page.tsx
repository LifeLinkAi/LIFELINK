"use client";
import { useState } from "react";
import Link from "next/link";

const SB_BG = "#1e3a0f"; // Main Sidebar Green
const SB_ACT = "#2d5a1a"; // Active Background Green

const NAV = [
    { id: "home", label: "Home", href: "/driver/dashboard" },
    { id: "trips", label: "New Trips", href: "/driver/trip-requests" },
    { id: "emergency", label: "Active Emergency", href: "/driver/active-trip" },
    { id: "patient", label: "Patient Details", href: "/driver/profile" },
    { id: "settings", label: "Settings", href: "/driver/settings" },
];

const STEPS = [
    { id: 1, label: "Dispatched", done: true },
    { id: 2, label: "En Route", done: true },
    { id: 3, label: "On Site", done: true },
    { id: 4, label: "Transporting", done: false, active: true },
    { id: 5, label: "Hospital", done: false },
];

/* ── SVGs ── */
const BellIco = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);
const RadioIco = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>
);

const PhoneMap = () => (
    <div className="relative mx-auto" style={{ width: 320, height: 520 }}>
        <div className="absolute inset-0 rounded-[2.5rem] border-[10px] border-gray-700 bg-[#0d2a2a] shadow-2xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#0f3a3a 0%,#1a5a50 50%,#0d2a2a 100%)" }}>
                <svg width="100%" height="100%" viewBox="0 0 300 500" preserveAspectRatio="xMidYMid slice" className="opacity-70">
                    {[40, 100, 160, 220, 280, 340, 400, 460].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#1a6a5a" strokeWidth="1.5" opacity="0.6" />)}
                    {[30, 80, 130, 180, 230, 280].map(x => <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#1a6a5a" strokeWidth="1.5" opacity="0.6" />)}
                    <ellipse cx="150" cy="250" rx="110" ry="70" fill="#2aeec0" opacity="0.12" />
                    <polyline points="80,420 100,350 140,280 160,220 180,160 160,100" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="8 4" />
                    <circle cx="160" cy="100" r="12" fill="#ef4444" opacity="0.9" />
                    <circle cx="160" cy="100" r="22" fill="#ef4444" opacity="0.2" />
                    <line x1="160" y1="112" x2="160" y2="130" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="140" cy="280" r="9" fill="#22c55e" />
                    <circle cx="140" cy="280" r="18" fill="#22c55e" opacity="0.2" />
                </svg>
                <div className="absolute top-3 right-3 text-teal-300 text-[9px] font-mono bg-black/40 px-2 py-1 rounded">47.6062° N<br />122.3321° W</div>
            </div>
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-full z-10" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full z-10" />
    </div>
);

export default function ActiveEmergencyPage() {
    const [recalculating, setRecalculating] = useState(false);
    const [dispatched, setDispatched] = useState(false);
    const [etaMin] = useState(8);
    const [etaSec] = useState(12);

    const handleRecalc = () => {
        setRecalculating(true);
        setTimeout(() => setRecalculating(false), 2000);
    };

    return (
        <div className="flex min-h-screen overflow-hidden" style={{ fontFamily: "'Inter',sans-serif", backgroundColor: "#1a231b" }}>

            {/* 100% MATCHING SIDEBAR WITH LIGHT GREEN BORDER LEFT & FONT */}
            <aside className="w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-50" style={{ backgroundColor: SB_BG }}>
                <div className="px-6 pt-7 pb-4">
                    <div className="font-bold text-[17px] leading-tight text-white">LifeLink AI</div>
                    <div className="text-green-400 text-xs mt-0.5 font-medium">Ambulance Unit 04</div>
                </div>

                {/* Navigation - Exact matching style with dashboard */}
                <nav className="flex-1 px-4 space-y-0.5">
                    {NAV.map((n) => {
                        const act = n.id === "emergency";
                        return (
                            <Link key={n.id} href={n.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: act ? SB_ACT : "transparent",
                                    color: act ? "#fff" : "#a7d870",
                                    borderLeft: act ? "3px solid #8fcc30" : "3px solid transparent" // Same light green border strip from dashboard
                                }}
                            >
                                {n.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Dispatch Center Button */}
                <div className="px-5 pb-6">
                    <Link href="/driver/trip-requests" className="w-full font-bold text-sm py-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#d7f79c", color: "#1a3a0a" }}>
                        Dispatch Center
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 pl-64 h-screen overflow-y-auto flex flex-col" style={{ backgroundColor: "#1a231b" }}>

                {/* HEADER */}
                <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-white/10" style={{ backgroundColor: "#1e2b1f" }}>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white">Active Emergency</h1>
                        <span className="bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest">URGENT</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-300 hover:text-white"><BellIco /></button>
                        <button className="text-gray-300 hover:text-white"><RadioIco /></button>
                        <div className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-1.5">
                            <div className="text-right">
                                <div className="text-white text-xs font-bold leading-none">Unit 04</div>
                                <div className="text-green-400 text-[10px] font-medium">Online</div>
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(135deg,#3a6318,#1a3a0a)" }}>RM</div>
                        </div>
                    </div>
                </header>

                {/* STEPPER */}
                <div className="mx-6 mt-4 bg-white/10 backdrop-blur rounded-xl px-5 py-3 flex items-center justify-between border border-white/10">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2">
                                {s.done ? (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2d5a1a" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                ) : s.active ? (
                                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /></svg>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white/30 text-xs">✱</span>
                                    </div>
                                )}
                                <span className={`text-sm font-semibold whitespace-nowrap ${s.active ? "text-white" : s.done ? "text-green-300" : "text-white/30"}`}>{s.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="flex-1 mx-3 h-0.5 rounded-full" style={{ backgroundColor: i < 3 ? "#22c55e" : "rgba(255,255,255,0.15)" }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* CENTER STAGE */}
                <div className="flex-1 relative flex items-stretch px-6 py-4 gap-4">

                    {/* Left nav card */}
                    <div className="relative z-10 w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-gray-900">4.2</span>
                                        <span className="text-sm text-gray-500 font-medium">miles</span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium leading-tight">St. Jude Medical Center</div>
                                </div>
                            </div>
                            <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">ETA</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-red-500">{String(etaMin).padStart(2, "0")}:{String(etaSec).padStart(2, "0")}</span>
                                        <span className="text-xs text-gray-400">min</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Arrival</div>
                                    <div className="text-2xl font-black text-gray-800">14:42</div>
                                </div>
                            </div>
                            <button
                                onClick={handleRecalc}
                                disabled={recalculating}
                                className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.8" /></svg>
                                {recalculating ? "Recalculating..." : "Recalculate Route"}
                            </button>
                        </div>
                    </div>

                    {/* Phone map center */}
                    <div className="flex-1 flex items-center justify-center">
                        <PhoneMap />
                    </div>

                    {/* Right panel */}
                    <div className="w-64 shrink-0 flex flex-col justify-end gap-4">

                        {/* Live Vitals */}
                        <div className="bg-white rounded-2xl shadow-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-900 text-base">Live Vitals</span>
                                <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />STABLE
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { ico: "❤️", label: "HR", val: "82", unit: "bpm", color: "text-red-500" },
                                    { ico: "💧", label: "SpO2", val: "98", unit: "%", color: "text-blue-500" },
                                    { ico: "🩺", label: "BP", val: "124/82", unit: "", color: "text-purple-600" },
                                    { ico: "🌡️", label: "Temp", val: "98.6", unit: "°F", color: "text-amber-500" },
                                ].map((v) => (
                                    <div key={v.label} className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-xs">{v.ico}</span>
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{v.label}</span>
                                        </div>
                                        <div className={`text-xl font-black leading-tight ${v.color}`}>{v.val}</div>
                                        {v.unit && <div className="text-[10px] text-gray-400 font-medium">{v.unit}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hospital card */}
                        <div className="bg-white rounded-2xl shadow-2xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2d5a1a" }}>
                                    <span className="text-white font-black text-lg">🏥</span>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm leading-tight">St. Jude Medical</div>
                                    <div className="text-xs text-gray-500">ER Status: <span className="text-green-600 font-bold">READY</span></div>
                                </div>
                            </div>
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Available Trauma Bays:</span>
                                    <span className="font-bold text-gray-900">02</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Team Alerted:</span>
                                    <span className="font-bold text-green-600">YES</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => alert("Calling ER Direct...")}
                                className="flex flex-col items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-lg"
                            >
                                ER Direct
                            </button>
                            <button
                                onClick={() => setDispatched(!dispatched)}
                                className="flex flex-col items-center justify-center gap-1.5 text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-lg"
                                style={{ backgroundColor: dispatched ? "#22c55e" : "#2d5a1a" }}
                            >
                                {dispatched ? "Dispatched ✓" : "Update Dispatch"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}