"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearUser } from "@/features/auth/authSlice";
import Cookies from "js-cookie";
import api from "@/lib/axios";

// ── Icons ──────────────────────────────────────────────────────────────────
const IcoDash  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const IcoReq   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>;
const IcoBlood = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const IcoOrgan = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>;
const IcoAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const IcoHist  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoChart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoSet   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoHelp  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoOut   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoCal = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;


// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",         href: "/donor/dashboard",        icon: <IcoDash  /> },
  { label: "Donation Requests", href: "/donor/incoming-requests", icon: <IcoReq  /> },
  { label: "Blood Donation",    href: "/donor/donate-blood",     icon: <IcoBlood /> },
  { label: "Campaigns",         href: "/donor/campaigns",        icon: <IcoCal /> },
  { label: "Organ Donation",    href: "/donor/donate-organ",     icon: <IcoOrgan /> },
  { label: "Emergency Alerts",  href: "/donor/emergency-alerts", icon: <IcoAlert /> },
  { label: "History",           href: "/donor/history",          icon: <IcoHist  /> },
  { label: "Reports",           href: "/donor/reports",          icon: <IcoChart /> },
  { label: "Settings",          href: "/donor/settings",         icon: <IcoSet   /> },
];

interface DonorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonorSidebar({ isOpen, onClose }: DonorSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const dispatch = useDispatch();
  const [donorName, setDonorName]   = useState("Donor");
  const [donorAvatar, setDonorAvatar] = useState("");

  useEffect(() => {
    api.get("/donors/me").then((res) => {
      if (res.data?.name)   setDonorName(res.data.name);
      if (res.data?.avatar) setDonorAvatar(res.data.avatar);
    }).catch(() => {});
  }, []);

  const handleSignOut = () => {
    dispatch(clearUser());
    // Clear all session tokens
    Cookies.remove("ll_access_token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      sessionStorage.clear();
    }
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-gray-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ── Header ── */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
              {donorAvatar ? (
                <img src={donorAvatar} alt={donorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#dcf594] flex items-center justify-center text-[#3b5e2b] text-sm font-bold">
                  {donorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-[#2d3a24] truncate leading-tight">{donorName}</h2>
              <p className="text-[11px] text-gray-500 truncate">Verified Donor</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-700 shrink-0" onClick={onClose}>
            <IcoClose />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3
                  px-3 py-2.5 rounded-xl
                  text-sm font-semibold
                  transition-all duration-150
                  ${isActive
                    ? "bg-[#dcf594] text-[#2d3a24]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={`shrink-0 ${isActive ? "text-[#2d3a24]" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1 shrink-0">
          <button className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 rounded-lg hover:bg-gray-50 transition-colors">
            <IcoHelp />
            Help Center
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <IcoOut />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
