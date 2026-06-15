'use client';
import { useState, useCallback } from 'react';
import { respondToRequest, RequestResponseResult } from '@/services/requestResponseService';

interface UseRequestResponseReturn {
  respond: (requestId: string, action: 'ACCEPTED' | 'DECLINED') => Promise<RequestResponseResult | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook wrapping the POST /donors/requests/:id/respond call.
 * Returns respond function + loading/error state.
 */
export function useRequestResponse(): UseRequestResponseReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respond = useCallback(
    async (requestId: string, action: 'ACCEPTED' | 'DECLINED'): Promise<RequestResponseResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await respondToRequest(requestId, action);
      } catch (err: any) {
        const msg = err.response?.data?.message ?? err.message ?? 'Failed to respond to request.';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { respond, isLoading, error };
}
