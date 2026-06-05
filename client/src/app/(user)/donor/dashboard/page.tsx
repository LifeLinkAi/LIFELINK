"use client";

import React from "react";

export default function DonorDashboard() {
    return (
        <main className="p-4 sm:p-6 lg:p-8">
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
                                Welcome back,<br />
                                <span className="text-[#3b5e2b] font-bold">Alexander.</span>
                            </h2>
                            <p className="text-sm text-gray-600 max-w-md mt-4 mb-6 leading-relaxed">
                                Your readiness status is active and nearby hospitals have adequate reserves.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/70 p-4 rounded-2xl">
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Lives Impacted</div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">12</div>
                                </div>
                                <div className="bg-white/70 p-4 rounded-2xl">
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Donations</div>
                                    <div className="text-2xl sm:text-3xl font-black text-[#2d3a24]">8</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATUS CARD */}
                    <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                            <h3 className="text-lg font-bold text-gray-900">Readiness Status</h3>
                            <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-2 rounded-full uppercase border border-[#d2e4c0] w-fit">
                                Ready To Donate
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-32 h-32 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path strokeWidth="3" stroke="#e5e7eb" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path strokeWidth="3" stroke="#a5d84a" strokeLinecap="round" fill="none" strokeDasharray="100,100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-[#3b5e2b]">100%</div>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="bg-[#f8fafd] p-4 rounded-xl border border-gray-100 mb-4">
                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Last Donation</div>
                                    <div className="font-bold text-gray-900">March 14, 2024</div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold py-3 rounded-xl hover:bg-gray-50 transition">Update Info</button>
                                    <button className="flex-1 bg-[#3b5e2b] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#2d4721] transition">Schedule Visit</button>
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
                            <h3 className="text-2xl font-serif font-bold">Nearby Alerts</h3>
                            <button className="text-[#cbf275] text-xs font-black tracking-widest uppercase">View Map</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-bold text-gray-900 truncate">O- Negative Needed URGENTLY</h4>
                                        <p className="text-sm text-gray-500 truncate">City General Hospital</p>
                                    </div>
                                </div>
                                <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit">Critical</span>
                            </div>
                            <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-[#eef4e2] flex items-center justify-center shrink-0">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-bold text-gray-900 truncate">Platelet Donation Request</h4>
                                        <p className="text-sm text-gray-500 truncate">Metro Regional Blood Center</p>
                                    </div>
                                </div>
                                <span className="bg-[#eef4e2] text-[#5b8a3e] text-[10px] font-black px-3 py-2 rounded uppercase tracking-wider w-fit">Standard</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}