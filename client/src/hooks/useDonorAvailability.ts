'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { setDonorAvailability } from '@/services/donorProfileService';

interface UseDonorAvailabilityReturn {
  isAvailable: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  toggle: () => Promise<void>;
}

/**
 * Fetches current isAvailable from /donors/me and exposes a toggle function.
 */
export function useDonorAvailability(): UseDonorAvailabilityReturn {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/donors/me')
      .then((res) => {
        setIsAvailable(res.data?.isAvailable ?? true);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const toggle = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    const next = !isAvailable;
    try {
      await setDonorAvailability(next);
      setIsAvailable(next);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update availability.');
    } finally {
      setIsSaving(false);
    }
  }, [isAvailable]);

  return { isAvailable, isLoading, isSaving, error, toggle };
}
