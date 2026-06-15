"use client";
import React from "react";
import { DonorResponseStatus } from "@/services/incomingRequestService";

const IcoLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface RequestActionsProps {
  requestId: string;
  donorResponse: DonorResponseStatus;
  isBlocked: boolean; // 56-day eligibility blocked
  daysRemaining: number;
  isLoading: boolean;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

/**
 * Accept / Decline button pair for a single request card.
 * Handles eligibility blocking, already-responded state, and loading states.
 */
export function RequestActions({
  requestId,
  donorResponse,
  isBlocked,
  daysRemaining,
  isLoading,
  onAccept,
  onDecline,
}: RequestActionsProps) {
  // Already responded
  if (donorResponse === "ACCEPTED") {
    return (
      <div className="flex items-center gap-2 bg-[#eef4e2] border border-[#d2e4c0] text-[#3b5e2b] text-xs font-bold px-5 py-3 rounded-xl select-none">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Accepted
      </div>
    );
  }

  if (donorResponse === "DECLINED") {
    return (
      <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-400 text-xs font-bold px-5 py-3 rounded-xl select-none">
        Declined
      </div>
    );
  }

  // Eligibility blocked
  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 border border-gray-200 bg-gray-100 text-gray-400 text-xs font-bold px-5 py-3 rounded-xl cursor-not-allowed select-none">
        <IcoLock /> Accept — {daysRemaining}d remaining
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-[#3b5e2b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-medium">Saving…</span>
      </div>
    );
  }

  // Default: PENDING
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onAccept(requestId)}
        className="bg-[#3b5e2b] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#2d4721] transition-colors shadow-sm"
      >
        Accept
      </button>
      <button
        onClick={() => onDecline(requestId)}
        className="border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Decline
      </button>
    </div>
  );
}
