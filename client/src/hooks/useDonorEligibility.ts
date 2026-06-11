import { useState, useEffect } from "react";
import api from "@/lib/axios";

export const ELIGIBILITY_DAYS = 56;

export interface EligibilityResult {
  isEligible: boolean;
  daysRemaining: number;    // 0 when eligible
  progressPercent: number;  // 0-100, 100 = fully recovered / eligible
  eligibleDate: string;     // "14 January 2026" — date eligible again
  lastDonation: string;     // raw stored string e.g. "25 November 2025"
  daysSince: number;        // how many days since last donation (could be > 56)
  isLoading: boolean;
}

/** Parse "14 March 2024", "14/03/2024", "2024-03-14" etc. into a Date */
function parseDate(raw: string): Date | null {
  if (!raw || raw === "N/A") return null;

  // Try "DD Month YYYY" first (our stored format)
  const wordMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (wordMatch) {
    const d = new Date(`${wordMatch[2]} ${wordMatch[1]}, ${wordMatch[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to native parse (handles ISO, MM/DD/YYYY, etc.)
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d;

  return null;
}

export function computeEligibility(lastDonation: string): Omit<EligibilityResult, "isLoading"> {
  const donationDate = parseDate(lastDonation);

  if (!donationDate) {
    return {
      isEligible: true,
      daysRemaining: 0,
      progressPercent: 100,
      eligibleDate: "",
      lastDonation,
      daysSince: 0,
    };
  }

  const now = new Date();
  // Normalise both to midnight to avoid time-of-day drift
  const donation = new Date(donationDate.getFullYear(), donationDate.getMonth(), donationDate.getDate());
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const msPerDay     = 1000 * 60 * 60 * 24;
  const daysSince    = Math.floor((today.getTime() - donation.getTime()) / msPerDay);
  const daysRemaining = Math.max(0, ELIGIBILITY_DAYS - daysSince);
  const progressPercent = Math.min(100, Math.round((daysSince / ELIGIBILITY_DAYS) * 100));
  const isEligible   = daysRemaining === 0;

  const eligibleDateObj = new Date(donation);
  eligibleDateObj.setDate(eligibleDateObj.getDate() + ELIGIBILITY_DAYS);
  const eligibleDate = eligibleDateObj.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return { isEligible, daysRemaining, progressPercent, eligibleDate, lastDonation, daysSince };
}

/** React hook — fetches lastDonation from the server and returns eligibility */
export function useDonorEligibility(): EligibilityResult {
  const [lastDonation, setLastDonation] = useState("N/A");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/donors/me")
      .then((res) => {
        setLastDonation(res.data?.lastDonation ?? "N/A");
      })
      .catch(() => {
        setLastDonation("N/A");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { ...computeEligibility(lastDonation), isLoading };
}
