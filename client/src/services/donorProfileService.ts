import api from '@/lib/axios';

export interface UpdateProfilePayload {
  phone?: string;
  bloodType?: string;
  location?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  details?: string;
  organsWillingToDonate?: string[];
  isAvailable?: boolean;
}

export interface DonorProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  coordinates: number[];
  details: string;
  organsWillingToDonate: string[];
  isAvailable: boolean;
  avatar: string;
  status: string;
  tier: string;
  lastDonation: string;
  totalDonated: string;
  isSetupComplete: boolean;
}

/**
 * PATCH /donors/me — update editable profile fields
 */
export async function updateDonorProfile(data: UpdateProfilePayload): Promise<DonorProfileResponse> {
  const res = await api.patch('/donors/me', data);
  return res.data;
}

/**
 * PATCH /donors/me/availability — toggle availability on/off
 */
export async function setDonorAvailability(isAvailable: boolean): Promise<{ success: boolean; isAvailable: boolean }> {
  const res = await api.patch('/donors/me/availability', { isAvailable });
  return res.data;
}
