"use client";
import { useState } from "react";
import Link from "next/link";

const SB = "#1e3a0f";
const SA = "#2d5a1a";

const NAV = [
    { id: "home", label: "Home", h: "/driver/dashboard" },
    { id: "trips", label: "New Trips", h: "/driver/trip-requests" },
    { id: "emergency", label: "Active Emergency", h: "/driver/active-trip" },
    { id: "patient", label: "Patient Details", h: "/driver/profile" },
    { id: "settings", label: "Settings", h: "/driver/settings" },
];

const Toggle = ({ on, onToggle, color = "green" }: { on: boolean; onToggle: () => void; color?: "green" | "red" }) => (
    <button onClick={onToggle} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ backgroundColor: on ? (color === "red" ? "#ef4444" : "#22c55e") : "#d1d5db" }}>
        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
);

const MapThumb = ({ id, color }: { id: string; color: string }) => (
    <div className="w-36 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg,#0d1f2d,${color})` }}>
        <svg width="100%" height="100%" viewBox="0 0 144 96" preserveAspectRatio="xMidYMid slice">
            <rect width="144" height="96" fill="#0d1f2d" />
            {[16, 32, 48, 64, 80].map(y => <line key={y} x1="0" y1={y} x2="144" y2={y} stroke={color} strokeWidth="0.8" opacity="0.3" />)}
            {[24, 48, 72, 96, 120].map(x => <line key={x} x1={x} y1="0" x2={x} y2="96" stroke={color} strokeWidth="0.8" opacity="0.3" />)}
            <polyline points="10,80 40,60 72,45 100,30 130,15" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            <circle cx="100" cy="30" r="6" fill="#ef4444" opacity="0.9" />
            <circle cx="100" cy="30" r="12" fill="#ef4444" opacity="0.2" />
            <text x="8" y="92" fill="#6b7280" fontSize="8" fontFamily="monospace">TRIP_{id}</text>
        </svg>
    </div>
);

export default function SettingsPage() {
    const [bio, setBio] = useState(true);
    const [traffic, setTraffic] = useState(true);
    const [voice, setVoice] = useState(false);
    const [maxVol, setMaxVol] = useState(true);
    const [haptic, setHaptic] = useState(true);
    const [alerts, setAlerts] = useState(true);
    const [shiftEnded, setShiftEnded] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] overflow-hidden" style={{ fontFamily: "'Inter',sans-serif" }}>

            {/* 100% MATCHING SIDEBAR WITH CORRECT ROUTING & LABELS */}
            <aside className="w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-50" style={{ backgroundColor: SB }}>
                <div className="px-6 pt-7 pb-6">
                    <div className="font-bold text-[17px] leading-tight text-white">LifeLink AI</div>
                    <div className="text-green-400 text-xs mt-0.5 font-medium">Ambulance Unit 04</div>
                </div>

                <nav className="flex-1 px-4 space-y-0.5">
                    {NAV.map(n => {
                        const a = n.id === "settings"; // Active state highlighted on Settings
                        return (
                            <Link key={n.id} href={n.h} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                                style={{ backgroundColor: a ? SA : "transparent", color: a ? "#fff" : "#a7d870", borderLeft: a ? "3px solid #8fcc30" : "3px solid transparent" }}>
                                {n.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-5 pb-6">
                    <Link href="/driver/trip-requests" className="w-full font-bold text-sm py-2.5 rounded-lg flex items-center justify-center bg-[#d7f79c] text-[#1a3a0a]">
                        Dispatch Center
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 pl-64 h-screen overflow-y-auto flex flex-col bg-[#f8f9fa]">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900">Settings &amp; Records</h1>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />ONLINE
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border">
                            <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <main className="p-6 flex gap-5 items-start">
                    {/* Left column */}
                    <div className="w-60 shrink-0 flex flex-col gap-4">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center text-center">
                            <div className="relative mb-3">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-200 bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            </div>
                            <div className="font-bold text-gray-900 text-sm">Dr. Elias Sterling</div>
                            <div className="text-xs text-gray-500 mb-4">Lead Responder · Unit 04</div>
                            <div className="grid grid-cols-2 gap-2 w-full mb-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-left">
                                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Shift Timing</div>
                                    <div className="text-sm font-bold text-gray-800 mt-0.5">06:00 -<br />18:00</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-left">
                                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Rating</div>
                                    <div className="text-sm font-bold text-gray-800 mt-0.5">4.95 ★</div>
                                </div>
                            </div>
                            <button onClick={() => setShiftEnded(!shiftEnded)}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold mb-2 transition-colors ${shiftEnded ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"} text-white`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                {shiftEnded ? "Shift Ended" : "End Shift"}
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                Logout
                            </button>
                        </div>

                        {/* System Alerts */}
                        {alerts && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-gray-900 text-sm">System Alerts</span>
                                    <button onClick={() => setAlerts(false)} className="text-xs text-green-600 font-semibold hover:text-green-800">Clear all</button>
                                </div>
                                <div className="space-y-3">
                                    <div className="border-l-4 border-green-500 pl-3 py-1">
                                        <div className="flex items-start gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mt-0.5 shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-800">Protocol Update v2.4</div>
                                                <div className="text-[11px] text-gray-400">New trauma guidelines synced.</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Today, 08:24 AM</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-3 py-1">
                                        <div className="flex items-start gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="mt-0.5 shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h18" /></svg>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-800">Maintenance Check</div>
                                                <div className="text-[11px] text-gray-400">Unit 04 tire pressure high.</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Yesterday, 14:10 PM</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right/Main column */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                        {/* Trip History */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900">Emergency Trip History</h2>
                                <div className="flex gap-2">
                                    <span className="border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50">This Week</span>
                                    <button className="border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">Export CSV</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { id: "#4829", name: "Downtown Medical Center", addr: "214 North Michigan Ave, Chicago", arrival: "14:02:11", handover: "14:15:30", sev: "Level 2 (Critical)", sevColor: "text-red-500", col: "#1a5a8a" },
                                    { id: "#4828", name: "Riverdale Residential Park", addr: "902 S Oakley Blvd, Chicago", arrival: "11:45:05", handover: "12:02:18", sev: "Level 4 (Stable)", sevColor: "text-gray-600", col: "#1a5a3a" },
                                ].map(t => (
                                    <div key={t.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <MapThumb id={t.id} color={t.col} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                        {t.addr}
                                                    </div>
                                                </div>
                                                <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0">COMPLETED</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 mt-3">
                                                <div>
                                                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Arrival</div>
                                                    <div className="text-xs font-bold text-gray-800 mt-0.5 font-mono">{t.arrival}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Handover</div>
                                                    <div className="text-xs font-bold text-gray-800 mt-0.5 font-mono">{t.handover}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Severity</div>
                                                    <div className={`text-xs font-bold mt-0.5 ${t.sevColor}`}>{t.sev}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preferences + Navigation row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* App Preferences */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="2" /><circle cx="4" cy="18" r="2" /></svg>
                                    <span className="font-bold text-gray-900 text-sm">App Preferences</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Biometric Authentication</span>
                                        <Toggle on={bio} onToggle={() => setBio(!bio)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Data Refresh Rate</span>
                                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">Real-time
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                                    <span className="font-bold text-gray-900 text-sm">Navigation</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Provider</span>
                                        <span className="text-sm font-semibold text-gray-700">Google Maps API</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Traffic Awareness</span>
                                        <Toggle on={traffic} onToggle={() => setTraffic(!traffic)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Voice Guidance</span>
                                        <Toggle on={voice} onToggle={() => setVoice(!voice)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Critical Emergency Alerts */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span className="font-bold text-red-500 text-sm">Critical Emergency Alerts</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-red-100 bg-red-50 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                            <span className="font-bold text-gray-900 text-sm">Max Override Volume</span>
                                        </div>
                                        <Toggle on={maxVol} onToggle={() => setMaxVol(!maxVol)} color="red" />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">Alerts will bypass system silent mode during Level 1 calls.</p>
                                </div>
                                <div className="border border-green-100 bg-green-50 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                                            <span className="font-bold text-gray-900 text-sm">Haptic Feedback</span>
                                        </div>
                                        <Toggle on={haptic} onToggle={() => setHaptic(!haptic)} />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">High-intensity vibration pulses for incoming dispatch requests.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}