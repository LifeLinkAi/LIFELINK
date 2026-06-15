import api from '@/lib/axios';

export interface RequestResponseResult {
  success: boolean;
  requestId: string;
  donorResponse: 'ACCEPTED' | 'DECLINED';
  respondedAt: string;
}

/**
 * POST /donors/requests/:id/respond — accept or decline a request
 */
export async function respondToRequest(
  requestId: string,
  action: 'ACCEPTED' | 'DECLINED'
): Promise<RequestResponseResult> {
  const res = await api.post(`/donors/requests/${requestId}/respond`, { action });
  return res.data;
}
