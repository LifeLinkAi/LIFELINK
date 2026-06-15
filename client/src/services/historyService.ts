import api from '@/lib/axios';

export interface DonationRecord {
  id: string;
  donationType: 'Blood' | 'Platelet' | 'Plasma' | 'Organ';
  bloodType: string;
  facility: string;
  donationDate: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  volumeMl: number;
  notes: string;
  requestId: string | null;
  createdAt: string;
}

export interface DonationStats {
  totalDonations: number;
  totalVolumeLiters: number;
  livesImpacted: number;
}

/**
 * GET /donors/history — donor's donation history records
 */
export async function fetchDonationHistory(): Promise<DonationRecord[]> {
  const res = await api.get('/donors/history');
  return res.data.data ?? [];
}

/**
 * GET /donors/history/stats — aggregated stats for the donor
 */
export async function fetchDonationStats(): Promise<DonationStats> {
  const res = await api.get('/donors/history/stats');
  return res.data.data ?? { totalDonations: 0, totalVolumeLiters: 0, livesImpacted: 0 };
}
