"use client";
import React from "react";

export default function EmergencyAlerts() {
    return (
        <main className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Live Feed</h2>
                    <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                        Real-time alerts for critical shortages and urgent broadcasts in your verified region. High-priority matches are highlighted based on your biological profile.
                    </p>
                </div>
                <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-red-600">3 Active Critical Alerts</span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Critical Match Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-red-100 shadow-sm p-8 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none opacity-60" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-widest border border-red-100">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                                    Critical Match
                                </span>
                                <span className="text-xs text-gray-400 font-medium">0 mins ago</span>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Immediate Request: O-Negative Blood</h3>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-lg mb-8">
                            Mass casualty incident reported at Central City Hospital. Severe depletion of universal donor stock. Your profile is a <span className="font-bold text-gray-900">100% biological match</span> for a critically injured pediatric patient.
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Central City Hospital</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">1.8 miles away • Emergency Wing</p>
                            </div>
                        </div>
                        <button className="bg-[#dc2626] text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Accept Request
                        </button>
                    </div>
                </div>

                {/* Map Radius Card */}
                <div className="bg-[#eef4f9] rounded-3xl border border-[#d2e4f0] shadow-sm relative overflow-hidden flex flex-col h-[380px]">
                    <div className="absolute inset-0 opacity-40">
                        <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
                            <path d="M-20,50 Q100,120 200,80 T400,200" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M50,-20 Q120,100 80,200 T200,400" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className="p-6 relative z-10 flex justify-between items-start">
                        <div className="bg-white/90 backdrop-blur-sm border border-white px-3 py-2 rounded-xl shadow-sm">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Active Radius</div>
                            <div className="text-sm font-black text-gray-900">5 Mile Proximity</div>
                        </div>
                        <div className="w-10 h-10 bg-[#3b5e2b] rounded-full flex items-center justify-center text-[#cbf275] shadow-md border-2 border-white">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping absolute" />
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                        </div>
                    </div>
                    <div className="mt-auto p-6 relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm border border-white p-4 rounded-2xl shadow-sm flex items-start gap-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">Location tracking is currently active to prioritize urgent regional requests.</p>
                        </div>
                    </div>
                </div>

                {/* High Priority & other cards */}
                {[
                    { priority: "High Priority", priorityColor: "bg-[#f0f5e8] text-[#4d7532]", dot: true, time: "12 mins ago", title: "Platelets Needed", desc: "Oncology ward requires immediate platelet transfusion. Your O- profile is compatible.", location: "Mercy General • 8mi", action: "Details", actionStyle: "text-[#3b5e2b]" },
                    { priority: "Broadcast", priorityColor: "bg-gray-100 text-gray-600", dot: false, time: "1 hr ago", title: "System Status Update", desc: "Routine maintenance on diagnostic systems at West Side Clinic completed. Services restored.", location: "Network Admin", action: "Dismiss", actionStyle: "text-gray-500" },
                    { priority: "Standard Request", priorityColor: "bg-[#f0f5e8] text-[#5b8a3e]", dot: false, time: "2 hrs ago", title: "A+ Whole Blood", desc: "Routine stock replenishment needed for upcoming scheduled elective surgeries this weekend.", location: "Schedule Now", action: "Book", actionStyle: "text-[#3b5e2b]" },
                ].map(card => (
                    <div key={card.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`${card.priorityColor} text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1`}>
                                {card.dot && <span className="w-1.5 h-1.5 bg-[#4d7532] rounded-full" />}
                                {card.priority}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{card.time}</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h4>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1">{card.desc}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <p className="text-xs text-gray-500 font-medium">{card.location}</p>
                            <button className={`text-xs font-bold ${card.actionStyle} hover:underline`}>{card.action}</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}