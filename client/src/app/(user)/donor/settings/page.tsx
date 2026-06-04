"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Settings() {
    const [bloodEnabled, setBloodEnabled] = useState(true);
    const [organEnabled, setOrganEnabled] = useState(true);
    const [twoFactor, setTwoFactor] = useState(true);

    return (
        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Settings</h1>
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                    Manage your personal profile, adjust biological donation parameters, and configure security preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Profile */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-b from-[#f2f8e8] to-white border border-[#e1ead2] p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7f79c] opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="relative inline-block mb-4 mt-2">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-[#3b5e2b] text-[#cbf275] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#2d4721] transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                        </div>
                        <h2 className="font-serif font-bold text-2xl text-gray-900 mb-1">Alex Mercer</h2>
                        <div className="flex items-center justify-center gap-1.5 mb-8">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span className="text-xs text-gray-600 font-medium">Verified Status</span>
                        </div>
                        <div className="space-y-5 text-left relative z-10">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">Email Address</label>
                                <input className="w-full bg-[#f8f9fa] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300" defaultValue="alex.mercer@example.com" readOnly />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1">Phone Number</label>
                                <input className="w-full bg-[#f8f9fa] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-300" defaultValue="+1 (555) 019-2834" readOnly />
                            </div>
                            <button className="w-full bg-[#e8f1f8] text-blue-600 border border-blue-100 py-3.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors mt-2">
                                Update Profile Info
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Parameters & Security */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Donation Parameters */}
                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f5e8] text-[#4d7532] flex items-center justify-center shadow-sm border border-[#d2e4c0]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                </div>
                                <h3 className="font-serif font-bold text-xl text-gray-900">Donation Parameters</h3>
                            </div>
                            <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Active Donor</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                                        <span className="font-bold text-sm text-gray-900">Blood Donation</span>
                                    </div>
                                    <button onClick={() => setBloodEnabled(!bloodEnabled)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${bloodEnabled ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${bloodEnabled ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Blood Type</span>
                                        <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800">O- Negative</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Availability Radius</span>
                                        <select className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 focus:outline-none">
                                            <option>10 Miles</option>
                                            <option defaultValue="25">25 Miles</option>
                                            <option>50 Miles</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><circle cx="12" cy="10" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
                                        <span className="font-bold text-sm text-gray-900">Organ Registration</span>
                                    </div>
                                    <button onClick={() => setOrganEnabled(!organEnabled)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${organEnabled ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${organEnabled ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-600 leading-relaxed mb-4">
                                    Registered as a full organ and tissue donor under the National Healthcare Registry.
                                </p>
                                <Link href="#" className="text-xs font-bold text-[#5b8a3e] hover:underline flex items-center gap-1">
                                    View Legal Registry
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#e8f1f8] text-[#3b82f6] flex items-center justify-center shadow-sm border border-[#d3e3f0]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
                            </div>
                            <h3 className="font-serif font-bold text-xl text-gray-900">Security &amp; Authentication</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="text-[#3b5e2b] mt-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-1">Two-Factor Authentication (2FA)</h4>
                                        <p className="text-[11px] text-gray-500">Adds an extra layer of security requiring a code from your mobile device.</p>
                                    </div>
                                </div>
                                <button onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${twoFactor ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${twoFactor ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                            </div>
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 mb-1">Account Password</h4>
                                    <p className="text-[11px] text-gray-500">Last updated 45 days ago.</p>
                                </div>
                                <button className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors">Change</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">Discard Changes</button>
                        <button className="bg-[#3b5e2b] text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#2d4721] transition-colors">Save Settings</button>
                    </div>
                </div>
            </div>
        </main>
    );
}