"use client";
import React from "react";

export default function NearbyHospitals() {
    return (
        <main className="p-6 lg:p-8 flex-1 max-w-6xl mx-auto w-full">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#3b5e2b]">Facility Discovery</h1>
                    <p className="text-[11px] text-gray-500 font-medium">Real-time resource tracking and routing for critical care networks.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">All Specialties</button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Within 15 Miles</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                {/* Map placeholder */}
                <div className="bg-[#1b2a24] rounded-3xl h-[600px] flex items-center justify-center text-gray-500 relative overflow-hidden shadow-inner border border-[#30473a]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="w-9 h-9 bg-white/10 rounded-lg text-white font-bold text-lg hover:bg-white/20 transition-colors">+</button>
                        <button className="w-9 h-9 bg-white/10 rounded-lg text-white font-bold text-lg hover:bg-white/20 transition-colors">−</button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">Map View</p>
                            <p className="text-gray-500 text-xs mt-1">Configure API key to enable</p>
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur rounded-xl p-4 border border-white/10 text-white w-48">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Network Status</p>
                        <div className="flex items-center gap-2 text-xs font-bold mb-1"><span className="w-2 h-2 rounded-full bg-green-500" />Optimal Capacity</div>
                        <div className="flex items-center gap-2 text-xs font-bold mb-1"><span className="w-2 h-2 rounded-full bg-red-500" />Critical Need</div>
                        <div className="flex items-center gap-2 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-[#5b8a3e]" />Transplant Hub</div>
                    </div>
                </div>
            </div>
        </main>
    );
}