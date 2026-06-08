"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";

// Build the correct server base URL (strips /v1 or /v2 if accidentally present)
const SERVER_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api")
    .replace(/\/v\d+\/?$/, "");

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ show, message, sub }: { show: boolean; message: string; sub: string }) {
    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#1f2937] text-white px-5 py-4 rounded-2xl shadow-2xl transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-bold leading-tight">{message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
        </div>
    );
}

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 shrink-0 ${enabled ? "bg-[#3b5e2b]" : "bg-gray-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
        </button>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Settings() {
    const [name, setName]   = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [bloodEnabled, setBloodEnabled] = useState(true);
    const [organEnabled, setOrganEnabled] = useState(true);

    // Certificate upload state
    const [certFile, setCertFile]                 = useState<File | null>(null);
    const [isUploading, setIsUploading]           = useState(false);
    const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
    const [uploadError, setUploadError]           = useState<string | null>(null);
    const [isDragOver, setIsDragOver]             = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast
    const [toast, setToast] = useState(false);

    // ── Load saved profile from DB on mount ──────────────────────────────────
    useEffect(() => {
        api.get("/donors/me")
            .then((res) => {
                const d = res.data;
                if (d.name)  setName(d.name);
                if (d.phone) setPhone(d.phone);
                if (d.email) setEmail(d.email);
                // If a certificate date was previously saved, restore it
                if (d.lastDonation && d.lastDonation !== "N/A") {
                    setLastDonationDate(d.lastDonation);
                    // Show the saved-state card without a file object
                    setCertFile(new File([], "(saved certificate)", { type: "application/pdf" }));
                }
            })
            .catch(() => { /* silently ignore — user may not be fully authenticated yet */ });
    }, []);

    // ── Upload to backend ─────────────────────────────────────────────────
    const processFile = useCallback(async (file: File) => {
        // Client-side pre-validation
        if (file.type !== "application/pdf") {
            setUploadError("Only PDF files are accepted.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File size must not exceed 10 MB.");
            return;
        }

        setCertFile(file);
        setIsUploading(true);
        setLastDonationDate(null);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("certificate", file);

            const { data } = await api.post(`${SERVER_BASE}/donors/upload-certificate`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 30000,
            });

            if (data.success && data.lastDonationDate) {
                setLastDonationDate(data.lastDonationDate);
            } else {
                setUploadError("Server returned an unexpected response.");
                setCertFile(null);
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                (err.code === "ECONNABORTED" ? "Request timed out. Please try again." : "Upload failed. Please check your connection.");
            setUploadError(message);
            setCertFile(null);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);

    const resetCertificate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCertFile(null);
        setLastDonationDate(null);
        setUploadError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = () => {
        setToast(true);
        setTimeout(() => setToast(false), 3500);
    };

    return (
        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full relative">
            <Toast show={toast} message="Settings Saved" sub="Your profile and preferences have been updated." />

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Settings</h1>
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                    Manage your personal profile, adjust donation parameters, and upload your medical certificates.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── LEFT: Profile ─────────────────────────────────────── */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-b from-[#f2f8e8] to-white border border-[#e1ead2] p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7f79c] opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                        <div className="relative inline-block mb-5 mt-2">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 mb-6">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            <span className="text-xs text-gray-600 font-semibold">Verified Donor</span>
                        </div>

                        <div className="space-y-4 text-left relative z-10">
                            {/* Full Name — editable */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                                    className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#5b8a3e] focus:ring-2 focus:ring-[#5b8a3e]/20 transition-all" />
                            </div>

                            {/* Email — read-only */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                                    Email Address <span className="text-[9px] text-gray-400 normal-case font-normal ml-1">(cannot be changed)</span>
                                </label>
                                <input type="email" value={email} readOnly
                                    className="w-full bg-[#f3f4f6] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
                            </div>

                            {/* Phone — editable */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Phone Number</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (000) 000-0000"
                                    className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#5b8a3e] focus:ring-2 focus:ring-[#5b8a3e]/20 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Parameters + Certificate ──────────────────── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Donation Parameters */}
                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f5e8] text-[#4d7532] flex items-center justify-center shadow-sm border border-[#d2e4c0]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                </div>
                                <h3 className="font-serif font-bold text-xl text-gray-900">Donation Parameters</h3>
                            </div>
                            <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Active Donor</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Blood */}
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                                        <span className="font-bold text-sm text-gray-900">Blood Donation</span>
                                    </div>
                                    <Toggle enabled={bloodEnabled} onChange={() => setBloodEnabled(!bloodEnabled)} />
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Blood Type</span>
                                        <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-800">O− Negative</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Radius</span>
                                        <select className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-800 focus:outline-none">
                                            <option>10 Miles</option>
                                            <option>25 Miles</option>
                                            <option>50 Miles</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Organ */}
                            <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><circle cx="12" cy="10" r="4" /><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" /></svg>
                                        <span className="font-bold text-sm text-gray-900">Organ Registration</span>
                                    </div>
                                    <Toggle enabled={organEnabled} onChange={() => setOrganEnabled(!organEnabled)} />
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">Registered as a full organ and tissue donor under the National Healthcare Registry.</p>
                                <Link href="#" className="text-xs font-bold text-[#5b8a3e] hover:underline flex items-center gap-1">
                                    View Legal Registry
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Medical Certificate ───────────────────────────── */}
                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#fff8ec] text-[#d97706] flex items-center justify-center shadow-sm border border-[#fde8b4]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-xl text-gray-900">Donation Certificate</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Upload your latest donation certificate (PDF). Last donation date will be extracted automatically.</p>
                            </div>
                        </div>

                        {/* ── Step 1: Drop zone (no file selected) */}
                        {!certFile && !uploadError && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none ${isDragOver ? "border-[#5b8a3e] bg-[#f0f8e8] scale-[1.01]" : "border-[#d2e4c0] hover:border-[#5b8a3e] hover:bg-[#f8fbf4]"}`}
                            >
                                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileSelect} />
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f0f5e8] border border-[#d2e4c0] flex items-center justify-center text-[#5b8a3e]">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">{isDragOver ? "Drop to upload" : "Click to upload or drag & drop"}</p>
                                <p className="text-xs text-gray-400">PDF files only · Max 10 MB</p>
                            </div>
                        )}

                        {/* ── Error state with retry */}
                        {uploadError && !certFile && (
                            <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                </div>
                                <p className="text-sm font-bold text-red-700 mb-1">Upload Failed</p>
                                <p className="text-xs text-red-500 mb-4">{uploadError}</p>
                                <button
                                    onClick={() => { setUploadError(null); setTimeout(() => fileInputRef.current?.click(), 100); }}
                                    className="text-xs font-bold text-[#5b8a3e] bg-white border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8] transition-colors"
                                >
                                    Try Again
                                </button>
                                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileSelect} />
                            </div>
                        )}

                        {/* ── File selected (Step 2: processing / Step 3: success) */}
                        {certFile && (
                            <div className="border border-[#d2e4c0] rounded-2xl overflow-hidden">
                                {/* File bar */}
                                <div className="flex items-center justify-between px-5 py-3.5 bg-[#f6fbf0]">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-[#e1f0d0] flex items-center justify-center shrink-0">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{certFile.name}</p>
                                            <p className="text-[11px] text-gray-400">{(certFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    {!isUploading && (
                                        <button onClick={resetCertificate} className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-3">
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* Step 2 – Processing */}
                                {isUploading && (
                                    <div className="px-5 py-6 flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-[3px] border-[#d2e4c0] border-t-[#5b8a3e] rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-[#3b5e2b]">Extracting Data...</p>
                                        <p className="text-xs text-gray-400">Sending to server · Parsing PDF · Detecting date</p>
                                    </div>
                                )}

                                {/* Step 3 – Success */}
                                {!isUploading && lastDonationDate && (
                                    <div className="px-5 py-5">
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-[#e8f5d8] border border-[#d2e4c0] flex items-center justify-center">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">Certificate Processed Successfully</p>
                                            <div className="bg-[#f6fbf0] border border-[#d2e4c0] rounded-xl px-5 py-3 inline-flex items-center gap-2 shadow-sm">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                                <span className="text-xs text-gray-500 font-medium">Last Donation Date:</span>
                                                <span className="text-sm font-bold text-[#3b5e2b]">{lastDonationDate}</span>
                                            </div>
                                            <button onClick={resetCertificate} className="text-xs font-bold text-[#5b8a3e] bg-[#f0f8e8] border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#e4f0d4] transition-colors mt-1">
                                                Upload Another Certificate
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end items-center gap-4 pt-2">
                        <button
                            onClick={() => {
                                api.get("/donors/me").then((res) => {
                                    const d = res.data;
                                    if (d.name)  setName(d.name);
                                    if (d.phone) setPhone(d.phone);
                                    if (d.email) setEmail(d.email);
                                }).catch(() => {});
                            }}
                            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
                        >
                            Discard Changes
                        </button>
                        <button onClick={handleSave} className="bg-[#3b5e2b] text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#2d4721] hover:shadow-lg transition-all active:scale-95">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}