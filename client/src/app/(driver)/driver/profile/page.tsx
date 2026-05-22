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

function SideBar() {
    return (
        <aside className="w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-50" style={{ backgroundColor: SB }}>
            <div className="px-6 pt-7 pb-4">
                <div className="font-bold text-[17px] leading-tight text-white">LifeLink AI</div>
                <div className="text-green-400 text-xs mt-0.5 font-medium">Ambulance Unit 04</div>
            </div>

            {/* Exact matching navigation layout with proper Next.js Link component */}
            <nav className="flex-1 px-4 space-y-0.5">
                {NAV.map((n) => {
                    const a = n.id === "patient"; // Active state for Patient Details
                    return (
                        <Link key={n.id} href={n.h}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                            style={{
                                backgroundColor: a ? SA : "transparent",
                                color: a ? "#fff" : "#a7d870",
                                borderLeft: a ? "3px solid #8fcc30" : "3px solid transparent" // Matching green strip
                            }}
                        >
                            {n.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-5 pb-6">
                <Link href="/driver/trip-requests" className="w-full font-bold text-sm py-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#d7f79c", color: "#1a3a0a" }}>
                    Dispatch Center
                </Link>
            </div>
        </aside>
    );
}

const Waveform = () => (
    <svg viewBox="0 0 200 40" className="w-full h-8 mt-2" preserveAspectRatio="none">
        <polyline fill="none" stroke="#fca5a5" strokeWidth="1.5"
            points="0,20 10,20 15,5 20,35 25,20 35,20 40,8 45,32 50,20 60,20 65,10 70,30 75,20 85,20 90,6 95,34 100,20 110,20 115,8 120,32 125,20 135,20 140,10 145,30 150,20 160,20 165,7 170,33 175,20 185,20 190,9 195,31 200,20" />
    </svg>
);

export default function PatientProfilePage() {
    const [notes, setNotes] = useState("");
    const [notified, setNotified] = useState(false);
    const [medAdded, setMedAdded] = useState(false);
    const [vitalsUpdated, setVitalsUpdated] = useState(false);

    const meds = [
        { name: "Aspirin", dose: "324mg PO", time: "14:22" },
        { name: "Nitroglycerin", dose: "0.4mg SL", time: "14:28" },
        ...(medAdded ? [{ name: "Morphine", dose: "2mg IV", time: "14:35" }] : []),
    ];

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] overflow-hidden" style={{ fontFamily: "'Inter',sans-serif" }}>
            <SideBar />

            {/* Clean independent scroll wrapper */}
            <div className="flex-1 pl-64 h-screen overflow-y-auto flex flex-col bg-[#f8f9fa] text-gray-900">

                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-green-800 text-base">LifeLink AI</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500 text-sm">Patient: #8821-9X</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />ONLINE
                            </span>
                            <button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                                ⚠ EMERGENCY
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 ml-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border">
                                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Patient Clinical Overview</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Incident ID: EM-2024-0402 • Priority 1 Red Alert</p>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setVitalsUpdated(true)} className={`border px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${vitalsUpdated ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                                {vitalsUpdated ? "✓ Vitals Updated" : "Update Vitals"}
                            </button>
                            <button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                                ✱ Critical Event Log
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Layout Grid */}
                <main className="p-6 grid grid-cols-3 gap-5 items-start">
                    {/* Left/Main Block */}
                    <div className="col-span-2 space-y-4">

                        {/* Live Vital Monitor */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500">📈</span>
                                    <span className="font-bold text-gray-900 text-base">Live Vital Monitor</span>
                                </div>
                                <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />LIVE TELEMETRY
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Heart Rate</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-red-500">114</span>
                                        <span className="text-gray-400 font-semibold text-sm">BPM</span>
                                    </div>
                                    <Waveform />
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">SpO2 Level</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-green-600">92</span>
                                        <span className="text-gray-400 font-semibold text-sm">%</span>
                                    </div>
                                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700 font-medium">
                                        Stable – On Oxygen
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 col-span-2">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Blood Pressure</div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-gray-900">142/98</span>
                                            <span className="text-gray-400 font-semibold text-sm">mmHg</span>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700 font-semibold">
                                            Elevated
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Patient Profile info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xl">👤</div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">Robert Harrison, 54</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">B+ POSITIVE</span>
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">DNR ON FILE</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">✏ Edit Profile</button>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-3 border-t border-gray-100">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Known Allergies</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {["Penicillin", "Latex"].map(a => (
                                            <span key={a} className="text-red-500 font-semibold text-sm">{a}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Chronic Conditions</div>
                                    <ul className="space-y-1">
                                        {["Type 2 Diabetes", "Hypertension"].map(c => (
                                            <li key={c} className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Incident Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-gray-700">📋</span>
                                <span className="font-bold text-gray-900 text-base">Incident &amp; Handover Details</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Emergency Type</div>
                                <div className="text-red-500 font-bold text-base mb-2">Acute Myocardial Infarction (Suspected)</div>
                                <p className="text-sm text-gray-600 leading-relaxed">Patient was found conscious but diaphoretic, complaining of substernal chest pain radiating to left arm. Pain score 8/10. Symptoms started approximately 25 mins prior to EMS arrival.</p>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Hospital Transfer Notes</div>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Enter handover notes for receiving facility..."
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Status Block */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Status</span>
                                <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">EN ROUTE</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-gray-400">🕒</div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">ETA St. Mary's</div>
                                    <div className="text-2xl font-black text-gray-900">12 MINS</div>
                                </div>
                            </div>
                        </div>

                        {/* Meds Administered */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Medication Administered</div>
                            <div className="space-y-3 mb-3">
                                {meds.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm">{m.name}</div>
                                            <div className="text-xs text-gray-400">{m.dose}</div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">{m.time}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setMedAdded(true)} disabled={medAdded}
                                className="w-full border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                                {medAdded ? "✓ Medication Added" : "Add Medication"}
                            </button>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1">👥 Emergency Contact</div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm">👩</div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">Sarah Harrison</div>
                                    <div className="text-xs text-gray-400">Spouse</div>
                                    <div className="text-xs text-gray-500 mt-0.5">+1 (555) 012-3456</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setNotified(true)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${notified ? "bg-green-600" : "bg-[#2d5a1a] hover:bg-[#1e3a0f]"} text-white`}>
                                    {notified ? "✓ Notified" : "📋 Notify"}
                                </button>
                                <button className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">🔗</button>
                            </div>
                        </div>

                        {/* Destination Card Mock */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold px-4 pt-4 mb-2">Destination Facility</div>
                            <div className="relative h-24 bg-gray-900 mx-4 rounded-lg overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                <div className="text-[10px] font-mono text-gray-500 absolute bottom-1 right-2">Mock Map</div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="font-bold text-gray-800 text-sm">St. Mary's General</span>
                                <span className="text-xs text-gray-500">3.4 mi away</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}