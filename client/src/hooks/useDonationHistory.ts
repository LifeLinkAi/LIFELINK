'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchDonationHistory, fetchDonationStats, DonationRecord, DonationStats } from '@/services/historyService';

interface UseDonationHistoryReturn {
  history: DonationRecord[];
  stats: DonationStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_STATS: DonationStats = { totalDonations: 0, totalVolumeLiters: 0, livesImpacted: 0 };

/**
 * Fetches donation history records and stats in parallel.
 */
export function useDonationHistory(): UseDonationHistoryReturn {
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [stats, setStats] = useState<DonationStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchDonationHistory(), fetchDonationStats()])
      .then(([records, statsData]) => {
        if (!cancelled) {
          setHistory(records);
          setStats(statsData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load history.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { history, stats, isLoading, error, refetch };
}
