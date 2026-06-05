"use client";
import React, { useState } from "react";

const IcoBot = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>;

export default function AvailabilityStatus() {
    const [isEmergencyMode, setIsEmergencyMode] = useState(true);
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dates = [
        { date: '', type: 'empty' }, { date: 1, type: 'normal' }, { date: 2, type: 'normal' },
        { date: 3, type: 'selected-outline' }, { date: 4, type: 'selected-outline' },
        { date: 5, type: 'unavailable' }, { date: 6, type: 'unavailable' },
        { date: 7, type: 'normal' }, { date: 8, type: 'selected-solid' },
        { date: 9, type: 'normal' }, { date: 10, type: 'normal' },
        { date: 11, type: 'normal' }, { date: 12, type: 'normal' }, { date: 13, type: 'normal' },
    ];

    return (
        <main className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-3 tracking-tight">Availability Status</h2>
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                    Manage your active donation windows and opt-in for emergency alerts based on real-time hospital needs in your area.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Emergency Mode Card */}
                    <div className="bg-gradient-to-r from-white to-[#f4f7ed] rounded-[2rem] border border-[#e1ead2] p-8 shadow-sm flex items-center justify-between">
                        <div className="max-w-xs">
                            <span className="bg-[#d5dec3] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-5 inline-block border border-[#c1d0ab]">High Priority Area</span>
                            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4 leading-tight">Emergency<br />Mode</h3>
                            <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                Activate to instantly notify local hospitals that you are available for urgent, immediate transport.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                                className={`relative w-28 h-12 rounded-full transition-colors duration-300 shadow-inner flex items-center px-1.5 ${isEmergencyMode ? "bg-[#5b8a3e]" : "bg-gray-300"}`}
                            >
                                <div className={`w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${isEmergencyMode ? "translate-x-16" : "translate-x-0"}`}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isEmergencyMode ? "#5b8a3e" : "#9ca3af"} strokeWidth="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                                </div>
                            </button>
                            <span className={`text-sm font-black tracking-widest ${isEmergencyMode ? "text-[#5b8a3e]" : "text-gray-400"}`}>{isEmergencyMode ? "ACTIVE" : "INACTIVE"}</span>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Availability Window</h3>
                            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-full px-1.5 py-1">
                                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>
                                <span className="text-xs font-bold text-gray-800">October 2024</span>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-8 px-4">
                            {days.map(day => (<div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{day}</div>))}
                            {dates.map((d, i) => (
                                <div key={i} className="flex justify-center">
                                    {d.type === 'empty' ? <div className="w-12 h-12" /> :
                                        d.type === 'normal' ? <div className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 hover:border-green-300 cursor-pointer">{d.date}</div> :
                                            d.type === 'selected-outline' ? <div className="w-12 h-12 rounded-2xl border-2 border-[#5b8a3e] flex flex-col items-center justify-center text-sm font-bold text-gray-900 cursor-pointer relative bg-[#f9fdf5]"><span>{d.date}</span><span className="w-1 h-1 bg-[#5b8a3e] rounded-full absolute bottom-2" /></div> :
                                                d.type === 'selected-solid' ? <div className="w-12 h-12 rounded-2xl bg-[#5b8a3e] flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer">{d.date}</div> :
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-400 cursor-not-allowed">{d.date}</div>}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-6 px-4">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-[3px] border-[#5b8a3e]" /><span className="text-xs text-gray-500 font-medium">Selected</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-xs text-gray-500 font-medium">Unavailable</span></div>
                            </div>
                            <button className="text-xs font-bold text-[#5b8a3e] hover:underline uppercase tracking-wider">Edit Schedule</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Readiness Score */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-0.5">Readiness Score</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Based on recent health sync</p>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
                            </button>
                        </div>
                        <div className="flex items-baseline gap-2 mb-8 border-b border-gray-50 pb-6">
                            <span className="text-6xl font-black text-[#2d3a24]">94</span>
                            <span className="text-xl font-bold text-gray-400">/ 100</span>
                            <div className="w-6 h-6 rounded-full bg-[#cbf275] flex items-center justify-center ml-2 border-2 border-white shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {[{ label: "Iron Levels", value: 95, status: "Optimal", color: "#3b5e2b" },
                            { label: "Hydration", value: 80, status: "Good", color: "#cbf275" },
                            { label: "Recovery Time", value: 100, status: "Complete", color: "#9ca3af" }].map(m => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-[11px] font-bold mb-2">
                                        <span className="text-gray-500">{m.label}</span>
                                        <span style={{ color: m.color }}>{m.status}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-[#eaf1f7] rounded-[2rem] p-6 border border-[#d3e3f0] shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded bg-[#cbf275] flex items-center justify-center shadow-sm"><IcoBot /></div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm"> Insights</h3>
                                <p className="text-[10px] text-gray-500 font-medium">Optimizing your impact</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-white">
                            <div className="flex gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 mt-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">High Demand: O- Negative</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">City General Hospital is reporting critically low reserves. Scheduling a donation this Thursday is highly recommended.</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 ml-11">Book Slot</button>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-white">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500 mt-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Optimal Time: Morning</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Based on your historical vitals, morning donations yield faster recovery times for you.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}