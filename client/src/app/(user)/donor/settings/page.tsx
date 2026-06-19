"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import api from "@/lib/axios";
import { useUpdateDonorProfile } from "@/hooks/useUpdateDonorProfile";
import { AvailabilityToggle } from "@/components/donor/AvailabilityToggle";
import { OrganPreferenceSelector } from "@/components/donor/OrganPreferenceSelector";
import { LocationPicker, LocationValue } from "@/components/donor/LocationPicker";


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

export default function Settings() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bloodType, setBloodType] = useState("O-");
  const [details, setDetails] = useState("");
  const [organs, setOrgans] = useState<string[]>([]);
  const [locationValue, setLocationValue] = useState<LocationValue>({ label: "", coordinates: null });
  const [initialCoords, setInitialCoords] = useState<number[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Certificate upload state
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const { update, isLoading: isSaving } = useUpdateDonorProfile();

  // Load profile on mount
  useEffect(() => {
    setIsLoadingProfile(true);
    api.get("/donors/me").then((res) => {
      const d = res.data;
      if (d.name)   setName(d.name);
      if (d.phone)  setPhone(d.phone);
      if (d.email)  setEmail(d.email);
      if (d.bloodType) setBloodType(d.bloodType);
      if (d.details)   setDetails(d.details);
      if (d.avatar)    setAvatar(d.avatar);
      if (d.organsWillingToDonate) setOrgans(d.organsWillingToDonate);
      if (d.coordinates && d.coordinates.length === 2) setInitialCoords(d.coordinates);
      setLocationValue({ label: d.location ?? "", coordinates: d.coordinates?.length === 2 ? d.coordinates : null });
      if (d.lastDonation && d.lastDonation !== "N/A") {
        setLastDonationDate(d.lastDonation);
        setCertFile(new File([], "(saved certificate)", { type: "application/pdf" }));
      }
    }).catch((err) => {
      setProfileError(err.response?.data?.message ?? "Failed to load profile. Please refresh.");
    }).finally(() => {
      setIsLoadingProfile(false);
    });
  }, []);

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    setToastError(null);
    const payload: Record<string, any> = { phone, bloodType, details, organsWillingToDonate: organs };
    if (locationValue.label) payload.location = locationValue.label;
    if (locationValue.coordinates) payload.coordinates = locationValue.coordinates;

    const result = await update(payload);
    if (result) {
      setIsDirty(false);
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    } else {
      setToastError("Save failed. Please try again.");
    }
  };

  const handleDiscard = () => {
    api.get("/donors/me").then((res) => {
      const d = res.data;
      if (d.phone) setPhone(d.phone);
      if (d.bloodType) setBloodType(d.bloodType);
      if (d.details) setDetails(d.details);
      if (d.organsWillingToDonate) setOrgans(d.organsWillingToDonate);
      setLocationValue({ label: d.location ?? "", coordinates: d.coordinates?.length === 2 ? d.coordinates : null });
      setIsDirty(false);
    }).catch(() => {});
  };

  // Certificate upload
  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setUploadError("Only PDF files are accepted."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("File size must not exceed 10 MB."); return; }
    setCertFile(file);
    setIsUploading(true);
    setLastDonationDate(null);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("certificate", file);
      // Do NOT set Content-Type manually — axios must auto-set multipart/form-data
      // with the correct boundary when sending FormData. Overriding it without the
      // boundary breaks the server's multer parser.
      const { data } = await api.post("/donors/upload-certificate", formData, {
        timeout: 60000, // 60s — PDF parsing can take time
      });
      if (data.success && data.lastDonationDate) {
        setLastDonationDate(data.lastDonationDate);
        if (data.extractedBloodGroup) {
          setBloodType(data.extractedBloodGroup);
        }
        markDirty();
      } else {
        setUploadError("Server returned an unexpected response.");
        setCertFile(null);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED"
          ? "Upload timed out — the PDF may be too large or the server is busy."
          : err.message === "Network Error"
          ? "Network error — check your connection and try again."
          : "Upload failed. Please try again.");
      setUploadError(msg);
      setCertFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetCertificate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCertFile(null); setLastDonationDate(null); setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full relative">
      <Toast show={toast} message="Settings Saved" sub="Your profile and preferences have been updated." />

      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Settings</h1>
        <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
          Manage your personal profile, adjust donation parameters, and upload your medical certificates.
        </p>
      </div>

      {profileError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-semibold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {profileError}
        </div>
      )}

      {toastError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-semibold">
          {toastError}
        </div>
      )}

      {isLoadingProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-gray-100 rounded-3xl h-96" />
            <div className="bg-gray-100 rounded-3xl h-24" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gray-100 rounded-3xl h-40" />
            <div className="bg-gray-100 rounded-3xl h-40" />
            <div className="bg-gray-100 rounded-3xl h-60" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: Profile ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-gradient-to-b from-[#f2f8e8] to-white border border-[#e1ead2] p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7f79c] opacity-30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative inline-block mb-5 mt-2">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={name || "Donor"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#dcf594] flex items-center justify-center text-[#3b5e2b] text-4xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : "D"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-xs text-gray-600 font-semibold">Verified Donor</span>
            </div>
            <div className="space-y-4 text-left relative z-10">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Full Name</label>
                <input type="text" value={name} readOnly className="w-full bg-[#f3f4f6] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Email Address <span className="text-[9px] text-gray-400 normal-case font-normal ml-1">(cannot be changed)</span>
                </label>
                <input type="email" value={email} readOnly className="w-full bg-[#f3f4f6] border border-gray-200 p-3.5 rounded-xl text-sm text-gray-400 cursor-not-allowed focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); markDirty(); }} placeholder="+1 (000) 000-0000"
                  className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#5b8a3e] focus:ring-2 focus:ring-[#5b8a3e]/20 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Blood Type</label>
                <select value={bloodType} onChange={(e) => { setBloodType(e.target.value); markDirty(); }}
                  className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#5b8a3e] focus:ring-2 focus:ring-[#5b8a3e]/20 transition-all cursor-pointer">
                  {["O-", "O+", "A+", "A-", "B+", "B-", "AB-", "AB+"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 ml-1 uppercase tracking-wide">Personal Details</label>
                <textarea value={details} onChange={(e) => { setDetails(e.target.value); markDirty(); }} rows={3} placeholder="Brief bio or medical notes..."
                  className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:border-[#5b8a3e] focus:ring-2 focus:ring-[#5b8a3e]/20 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <AvailabilityToggle />
        </div>

        {/* ── RIGHT ─────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Location */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm border border-blue-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 14 8 14s8-8.5 8-14a8 8 0 0 0-8-8z"/></svg>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900">Location</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Used for nearby hospital matching and request proximity.</p>
              </div>
            </div>
            <LocationPicker
              initialLabel={locationValue.label}
              initialCoordinates={initialCoords}
              onChange={(v) => { setLocationValue(v); markDirty(); }}
            />
          </div>

          {/* Organ Preferences */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#f0f5e8] text-[#4d7532] flex items-center justify-center shadow-sm border border-[#d2e4c0]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="10" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900">Organ Donation Preferences</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Select organs you consent to donate.</p>
              </div>
            </div>
            <OrganPreferenceSelector selected={organs} onChange={(v) => { setOrgans(v); markDirty(); }} />
            {organs.length > 0 && (
              <p className="mt-3 text-[11px] text-[#5b8a3e] font-semibold">{organs.length} organ{organs.length !== 1 ? "s" : ""} selected.</p>
            )}
          </div>

          {/* Donation Certificate */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#fff8ec] text-[#d97706] flex items-center justify-center shadow-sm border border-[#fde8b4]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900">Donation Certificate</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Upload your latest PDF certificate — last donation date extracted automatically.</p>
              </div>
            </div>

            {!certFile && !uploadError && (
              <div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none ${isDragOver ? "border-[#5b8a3e] bg-[#f0f8e8] scale-[1.01]" : "border-[#d2e4c0] hover:border-[#5b8a3e] hover:bg-[#f8fbf4]"}`}>
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f0f5e8] border border-[#d2e4c0] flex items-center justify-center text-[#5b8a3e]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">{isDragOver ? "Drop to upload" : "Click to upload or drag & drop"}</p>
                <p className="text-xs text-gray-400">PDF files only · Max 10 MB</p>
              </div>
            )}

            {uploadError && !certFile && (
              <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-red-700 mb-1">Upload Failed</p>
                <p className="text-xs text-red-500 mb-4">{uploadError}</p>
                <button onClick={() => { setUploadError(null); setTimeout(() => fileInputRef.current?.click(), 100); }}
                  className="text-xs font-bold text-[#5b8a3e] bg-white border border-[#d2e4c0] px-4 py-2 rounded-xl hover:bg-[#f0f8e8] transition-colors">
                  Try Again
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
              </div>
            )}

            {certFile && (
              <div className="border border-[#d2e4c0] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#f6fbf0]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#e1f0d0] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{certFile.name}</p>
                      <p className="text-[11px] text-gray-400">{certFile.size > 0 ? `${(certFile.size / 1024).toFixed(1)} KB` : "Previously saved"}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button onClick={resetCertificate} className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-3">Remove</button>
                  )}
                </div>
                {isUploading && (
                  <div className="px-5 py-6 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-[#d2e4c0] border-t-[#5b8a3e] rounded-full animate-spin" />
                    <p className="text-sm font-bold text-[#3b5e2b]">Extracting Data...</p>
                    <p className="text-xs text-gray-400">Sending to server · Parsing PDF · Detecting date</p>
                  </div>
                )}
                {!isUploading && lastDonationDate && (
                  <div className="px-5 py-5">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#e8f5d8] border border-[#d2e4c0] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-sm font-bold text-gray-800">Certificate Processed Successfully</p>
                      <div className="bg-[#f6fbf0] border border-[#d2e4c0] rounded-xl px-5 py-3 inline-flex items-center gap-2 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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
            <button onClick={handleDiscard} className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">
              Discard Changes
            </button>
            <button onClick={handleSave} disabled={isSaving || !isDirty}
              className="bg-[#3b5e2b] text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#2d4721] hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
      )} {/* end isLoadingProfile conditional */}
    </main>
  );
}