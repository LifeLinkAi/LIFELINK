'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchIncomingRequests, IncomingRequest } from '@/services/incomingRequestService';

interface UseIncomingRequestsReturn {
  requests: IncomingRequest[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the donor's incoming request feed (with per-donor response status).
 * Optional type filter: 'Blood' | 'Organ'
 */
export function useIncomingRequests(type?: 'Blood' | 'Organ'): UseIncomingRequestsReturn {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchIncomingRequests(type)
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message ?? 'Failed to load requests.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { requests, isLoading, error, refetch };
}
