"use client";
import React from "react";
import { useDonorAvailability } from "@/hooks/useDonorAvailability";

/**
 * Self-contained availability toggle card.
 * Reads and writes to /donors/me/availability via the hook.
 */
export function AvailabilityToggle() {
  const { isAvailable, isLoading, isSaving, error, toggle } = useDonorAvailability();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-8 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-6 shadow-sm transition-colors duration-300 ${
      isAvailable ? "bg-white border-[#d2e4c0]" : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
            isAvailable ? "bg-[#eef4e2] border-[#d2e4c0] text-[#3b5e2b]" : "bg-gray-100 border-gray-200 text-gray-400"
          }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Donation Availability</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isAvailable
                ? "You are visible to hospitals and can receive donation requests."
                : "You are hidden from matching. No new requests will be sent to you."}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={toggle}
          disabled={isSaving}
          aria-label={isAvailable ? "Set unavailable" : "Set available"}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 flex items-center px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3b5e2b] ${
            isAvailable ? "bg-[#3b5e2b]" : "bg-gray-300"
          } ${isSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            isAvailable ? "translate-x-6" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Status badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-[#5b8a3e]" : "bg-gray-400"}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          isAvailable ? "text-[#3b5e2b]" : "text-gray-500"
        }`}>
          {isSaving ? "Saving…" : isAvailable ? "Available for Requests" : "Currently Unavailable"}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 font-semibold">{error}</p>
      )}
    </div>
  );
}
