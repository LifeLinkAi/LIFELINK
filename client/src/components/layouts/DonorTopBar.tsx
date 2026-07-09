"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import NotificationBell from "../ui/NotificationBell";

const IcoMenu   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

interface DonorTopBarProps {
  onMenuClick: () => void;
  searchPlaceholder?: string;
}

export function DonorTopBar({ onMenuClick, searchPlaceholder = "Search..." }: DonorTopBarProps) {
  const [avatar, setAvatar] = useState("");
  const [name, setName]     = useState("Donor");

  useEffect(() => {
    api.get("/donors/me").then((res) => {
      if (res.data?.avatar) setAvatar(res.data.avatar);
      if (res.data?.name)   setName(res.data.name);
    }).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3.5 shrink-0">
      <div className="flex items-center justify-between gap-4">

        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 shrink-0"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <IcoMenu />
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <IcoSearch />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all"
            />
          </div>
        </div>

        {/* Right: SOS + avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="/donor/emergency-alerts" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors whitespace-nowrap shadow-sm">
            ✱ SOS
          </a>
          <NotificationBell />

          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0" title={name}>
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#dcf594] flex items-center justify-center text-[#3b5e2b] text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
