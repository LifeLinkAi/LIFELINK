import api from '@/lib/axios';

export type DonorResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface IncomingRequest {
  id: string;
  patientName: string;
  facility: string;
  bloodGroup: string;
  organType?: string;
  urgency: string;
  status: string;
  type: 'Blood' | 'Organ';
  distance: string;
  notes: string;
  registeredDate: string;
  createdAt: string;
  donorResponse: DonorResponseStatus;
  units?: number;
  contactPhone?: string;
}

/**
 * GET /donors/requests — fetch all requests with this donor's response status injected
 */
export async function fetchIncomingRequests(type?: 'Blood' | 'Organ'): Promise<IncomingRequest[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  const res = await api.get('/donors/requests', { params });
  return res.data.data ?? [];
}
