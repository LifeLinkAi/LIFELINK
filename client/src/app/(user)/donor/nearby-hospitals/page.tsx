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

export default function NearbyHospitals() {
    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
            <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" /></div>
                    <div><h2 className="font-bold text-green-900 text-sm leading-tight">LifeLink Portal</h2><p className="text-[10px] text-gray-500 font-medium">Verified Donor</p></div>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.id === "hospitals";
                        return (
                            <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-[#dcf594] text-[#2d3a24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                                <span className={isActive ? "text-[#2d3a24]" : "text-gray-400"}>{item.icon}</span>{item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-5 space-y-2 border-t border-gray-50">
                    <button className="w-full bg-[#f1f5eb] text-[#3b5e2b] text-xs font-bold py-2.5 rounded-xl">Live Chat Support</button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-gray-500">Help Center</button>
                </div>
            </aside>

            <div className="flex-1 pl-64 flex flex-col min-h-screen">
                <header className="bg-[#f8f9fa] px-8 py-5 flex items-center justify-between sticky top-0 z-40">
                    <div>
                        <h1 className="text-xl font-bold text-[#3b5e2b]">Facility Discovery</h1>
                        <p className="text-[11px] text-gray-500 font-medium">Real-time resource tracking and routing for critical care networks.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600">All Specialties</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600">Within 15 Miles</button>
                    </div>
                </header>

                <main className="p-8 pt-2 flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {[
                            { name: "Cedar Sinai Medical Hub", dist: "1.2 miles", icu: "Critical (2 Beds)", stock: "Adequate", needs: "O- Negative Blood, Type II Plasma" },
                            { name: "Mercy General Hospital", dist: "3.8 miles", icu: "Stable (14 Beds)", stock: "High", needs: "None" },
                            { name: "Pacific Biotech Institute", dist: "5.1 miles", icu: "Research Only", stock: "N/A", needs: "Specialized Logistics" }
                        ].map((h, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{h.name}</h3>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase">{h.dist} • Level 1 Trauma</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">Est. 8 min</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">ICU Capacity</p>
                                        <p className="font-bold text-gray-800">{h.icu}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Blood Stock</p>
                                        <p className="font-bold text-gray-800">{h.stock}</p>
                                    </div>
                                    <div className="col-span-2 bg-red-50 p-3 rounded-xl border border-red-100">
                                        <p className="text-[9px] font-bold text-red-500 uppercase">Active Needs</p>
                                        <p className="font-bold text-red-700 text-[11px]">{h.needs}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-[#3b5e2b] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#2d4721] transition-colors">Directions</button>
                                    <button className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors">Contact</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#1b2a24] rounded-3xl h-[600px] flex items-center justify-center text-gray-500 relative overflow-hidden shadow-inner border border-[#30473a]">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button className="w-9 h-9 bg-white/10 rounded-lg text-white font-bold text-lg">+</button>
                            <button className="w-9 h-9 bg-white/10 rounded-lg text-white font-bold text-lg">−</button>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur rounded-xl p-4 border border-white/10 text-white w-48">
                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Network Status</p>
                            <div className="flex items-center gap-2 text-xs font-bold mb-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Optimal Capacity</div>
                            <div className="flex items-center gap-2 text-xs font-bold mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Critical Need</div>
                            <div className="flex items-center gap-2 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-[#5b8a3e]"></span>Transplant Hub</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}