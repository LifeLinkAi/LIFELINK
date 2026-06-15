'use client';
import { useState, useCallback } from 'react';
import {
  updateDonorProfile,
  UpdateProfilePayload,
  DonorProfileResponse,
} from '@/services/donorProfileService';

interface UseUpdateDonorProfileReturn {
  update: (data: UpdateProfilePayload) => Promise<DonorProfileResponse | null>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

/**
 * Hook wrapping the PATCH /donors/me service call.
 * Returns update function, loading/error/success state.
 */
export function useUpdateDonorProfile(): UseUpdateDonorProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const update = useCallback(async (data: UpdateProfilePayload): Promise<DonorProfileResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updateDonorProfile(data);
      setSuccess(true);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? 'Failed to save profile.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error, success, reset };
}
