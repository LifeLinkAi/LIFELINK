"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { OrganPreferenceSelector } from "@/components/donor/OrganPreferenceSelector";
import { useUpdateDonorProfile } from "@/hooks/useUpdateDonorProfile";

interface ProfileData {
  bloodType: string;
  organsWillingToDonate: string[];
  isSetupComplete: boolean;
}

export default function OrganDonation() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftOrgans, setDraftOrgans] = useState<string[]>([]);
  const { update, isLoading: isSaving } = useUpdateDonorProfile();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/donors/me").then((res) => {
      setProfile({
        bloodType: res.data.bloodType ?? "O-",
        organsWillingToDonate: res.data.organsWillingToDonate ?? [],
        isSetupComplete: res.data.isSetupComplete ?? false,
      });
      setDraftOrgans(res.data.organsWillingToDonate ?? []);
    }).catch(() => {});
  }, []);

  const handleSavePreferences = async () => {
    const result = await update({ organsWillingToDonate: draftOrgans });
    if (result) {
      setProfile((p) => p ? { ...p, organsWillingToDonate: draftOrgans } : p);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-serif text-[#1e293b] font-bold mb-2 tracking-tight">Organ Donation Management</h2>
          <p className="text-sm text-gray-500">Securely manage your registry preferences, track medical eligibility, and review legal consent workflows.</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="text-xs font-bold text-gray-600 border border-gray-300 rounded-full px-5 py-2.5 hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Update Preferences
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setDraftOrgans(profile?.organsWillingToDonate ?? []); }}
              className="text-xs font-bold text-gray-500 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSavePreferences} disabled={isSaving}
              className="text-xs font-bold bg-[#3b5e2b] text-white rounded-full px-5 py-2 hover:bg-[#2d4721] transition-colors disabled:opacity-60 flex items-center gap-2">
              {isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Save Preferences
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="mb-6 bg-[#eef4e2] border border-[#d2e4c0] rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold text-[#3b5e2b]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Organ preferences saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Registry Status */}
          <div className="bg-gradient-to-br from-[#f1f7e8] to-[#ffffff] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d7f79c] opacity-20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#cbf275] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#bce366]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d3a24" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Registry Status</h3>
              </div>

              {profile === null ? (
                <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse mb-4" />
              ) : profile.organsWillingToDonate.length > 0 ? (
                <>
                  <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-flex items-center gap-1.5 border border-[#bce366]">
                    <span className="w-1.5 h-1.5 bg-[#5b8a3e] rounded-full" />Active Registered Donor
                  </span>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3 mt-2">
                    {profile.organsWillingToDonate.length} Organ{profile.organsWillingToDonate.length !== 1 ? "s" : ""} Registered
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.organsWillingToDonate.map((organ) => (
                      <span key={organ} className="bg-white border border-[#d2e4c0] text-[#3b5e2b] text-xs font-bold px-3 py-1 rounded-full">
                        {organ}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-flex items-center gap-1.5 border border-gray-200">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />No Preferences Set
                  </span>
                  <p className="text-sm text-gray-500 mb-4">You have not selected any organs to donate. Click &quot;Update Preferences&quot; to configure.</p>
                </>
              )}

              <div className="border-t border-gray-200 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Blood Type", val: profile?.bloodType ?? "—" },
                  { label: "Organs Selected", val: profile ? String(profile.organsWillingToDonate.length) : "—" },
                  { label: "Registry", val: "National" },
                  { label: "Status", val: profile?.isSetupComplete ? "Active" : "Pending" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{f.label}</div>
                    <div className="text-xs font-bold text-gray-800">{f.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organ Preference Editor */}
          {editing && (
            <div className="bg-white border border-[#d2e4c0] rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><circle cx="12" cy="10" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
                <h3 className="text-lg font-serif font-bold text-gray-900">Select Organs to Donate</h3>
              </div>
              <OrganPreferenceSelector selected={draftOrgans} onChange={setDraftOrgans} />
              <p className="text-[11px] text-gray-400 mt-4">
                {draftOrgans.length === 0 ? "No organs selected." : `${draftOrgans.length} organ${draftOrgans.length !== 1 ? "s" : ""} selected.`}
              </p>
            </div>
          )}

          {/* Legal Workflow */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <h3 className="text-lg font-serif font-bold text-gray-900">Legal Approval Workflow</h3>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-100 bg-[#fbfdf9] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#eef4e2] flex items-center justify-center flex-shrink-0 border border-[#d2e4c0]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Initial Consent Directive</h4>
                    <p className="text-[11px] text-gray-500">Digitally signed &amp; notarized</p>
                  </div>
                </div>
                <span className="bg-[#cbf275] text-[#3b5e2b] text-[10px] font-black px-3 py-1 rounded uppercase">Valid</span>
              </div>
              <div className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Next of Kin Acknowledgment</h4>
                    <p className="text-[11px] text-gray-500">Awaiting designated contact review</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-gray-600 uppercase hover:text-gray-900">Remind</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Medical Eligibility */}
          <div className="bg-[#fcfdfa] border border-[#e1ead2] rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif font-bold text-gray-900">Medical Eligibility</h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2"><path d="M14 2v4a2 2 0 0 0 2 2h4l-4-4z"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            </div>
            <div className="relative pl-6 border-l-2 border-[#d2e4c0] space-y-8">
              {[
                { label: "Basic Health Screening", sub: "Cleared on Aug 15, 2023", done: true },
                { label: "HLA Tissue Typing", sub: "Profile completed & banked", done: true },
                { label: "In-Depth Organ Viability", sub: "Pending biannual review", done: false },
              ].map(s => (
                <div key={s.label} className="relative">
                  <div className={`absolute -left-[35px] top-0.5 w-6 h-6 ${s.done ? "bg-[#5b8a3e]" : "bg-[#f8f9fa]"} rounded-full border-[3px] border-white flex items-center justify-center shadow-sm`}>
                    {s.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div className="w-2.5 h-2.5 rounded-full border-2 border-[#3b5e2b]" />}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">{s.label}</h4>
                  <p className="text-xs text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a3e" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <h3 className="text-lg font-serif font-bold text-gray-900">Scheduling &amp; Updates</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#5b8a3e]" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mb-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <h4 className="font-bold text-gray-900 mb-2">Standby Status</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">No active procurement procedures scheduled. Your profile is continuously cross-referenced with national waitlists.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}