"use client";
import React from "react";

const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcoReq = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /></svg>;
const IcoCal = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /></svg>;

export default function BloodManagement() {
    return (
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-serif text-[#1e293b] font-bold mb-2">Blood Management</h2>
                    <p className="text-sm text-gray-500">Monitor your donor profile, eligibility, and schedules.</p>
                </div>
                <button className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-4 py-3 hover:bg-gray-50 transition-colors bg-white shadow-sm">Download Report</button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* Profile */}
                <div className="xl:col-span-2 bg-gradient-to-br from-[#f6fbee] to-[#ffffff] border border-[#e1ead2] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-10 relative z-10">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-full bg-[#cbf275] flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                                <span className="text-xl font-black text-[#2d3a24]">O-</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Universal Donor Profile</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-2 py-1 rounded uppercase">Verified</span>
                                    <span className="text-[11px] font-medium text-gray-500">ID: D-99482-L</span>
                                </div>
                            </div>
                        </div>
                        <span className="bg-[#eef4e2] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-[#d2e4c0] w-fit">
                            <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full" />Eligible to Donate
                        </span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Donation Cooldown</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-[#5b8a3e]">Ready<br />Now</span>
                                <span className="text-[11px] text-gray-500 font-medium">Last donation:<br />62 days ago</span>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto bg-[#3b5e2b] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-md hover:bg-[#2d4721] transition-colors">Schedule Donation</button>
                    </div>
                </div>

                <div className="xl:col-span-1 flex flex-col gap-6">
                    {[{ icon: <IcoBlood />, bg: "blue", label: "Total Donated", value: "4.5", unit: "Liters" },
                    { icon: <IcoReq />, bg: "red", label: "Lives Impacted", value: "12", unit: "Patients" }].map(s => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-${s.bg}-50 flex items-center justify-center text-${s.bg}-500 shrink-0`}>{s.icon}</div>
                                <div>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                                    <p className="text-2xl font-black text-gray-900">{s.value}<span className="text-sm font-medium text-gray-400 ml-1">{s.unit}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Appointments */}
            <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 className="text-lg font-bold text-gray-900">Appointments</h3>
                    <button className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:underline w-fit">View Calendar</button>
                </div>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4"><IcoCal /></div>
                    <h4 className="font-bold text-gray-800 mb-2">No upcoming appointments</h4>
                    <p className="text-xs text-gray-500 mb-6">Your cooldown period has ended. Local clinics have available slots today.</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button className="flex-1 bg-[#f0f7fb] text-blue-600 border border-blue-100 font-bold text-xs py-3 rounded-xl hover:bg-blue-50 transition-colors">Today, 2:00 PM</button>
                        <button className="flex-1 border border-gray-200 text-gray-600 font-bold text-xs py-3 rounded-xl hover:bg-gray-50 transition-colors">Tomorrow, 10:00 AM</button>
                    </div>
                </div>
            </div>

            {/* Urgent Needs */}
            <div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Urgent Nearby Needs</h3>
                        <p className="text-xs text-gray-500 mt-1">Matched with your O- profile within 10 miles.</p>
                    </div>
                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-2 rounded-full border border-red-100 w-fit">2 Critical Matches</span>
                </div>
                <div className="space-y-4">
                    {[1, 2].map(item => (
                        <div key={item} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-500 border border-red-100 shrink-0">O-</div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">Surgical Ward - St. Jude Hospital</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">2.4 miles away</span>
                                        <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded uppercase">Critical</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                <button className="w-full sm:w-auto text-xs font-bold text-gray-600 border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">Details</button>
                                <button className="w-full sm:w-auto bg-[#3b5e2b] text-white text-xs font-bold px-4 py-3 rounded-lg hover:bg-[#2d4721] transition-colors shadow-sm">Accept Request</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}