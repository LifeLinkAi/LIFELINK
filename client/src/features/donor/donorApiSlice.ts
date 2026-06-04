import { apiSlice } from '@/store/apiSlice';

// ── Types ──────────────────────────────────────────────────────────────────
export interface DonorProfile {
  _id: string;
  user: string;
  bloodType: string;
  isAvailable: boolean;
  isEmergencyMode: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  livesImpacted: number;
  availabilityRadius: number;
  bloodDonationEnabled: boolean;
  organDonationEnabled: boolean;
  phone: string;
  address: string;
}

export interface BloodRequest {
  _id: string;
  requestedBy: { _id: string; name: string; email: string };
  bloodType: string;
  urgency: 'Critical' | 'High' | 'Standard';
  hospitalName: string;
  hospitalAddress: string;
  notes: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Dismissed';
  acceptedBy: string | null;
  createdAt: string;
}

export interface DonationRecord {
  _id: string;
  donor: string;
  donationType: 'Whole Blood' | 'Platelet' | 'Plasma' | 'Organ';
  bloodType: string;
  hospitalName: string;
  volumeMl: number;
  donationDate: string;
  status: 'Completed' | 'Cancelled' | 'Pending';
  notes: string;
}

export interface DonorStats {
  totalDonations: number;
  totalVolumeLiters: number;
  livesImpacted: number;
}

// ── Donor API slice ─────────────────────────────────────────────────────────
export const donorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── Donor Profile CRUD ──────────────────────────────────────────────
    getDonorProfile: builder.query<DonorProfile, void>({
      query: () => '/donor/profile',
      transformResponse: (res: any) => res.data,
      providesTags: ['User'],
    }),

    createDonorProfile: builder.mutation<DonorProfile, Partial<DonorProfile>>({
      query: (body) => ({ url: '/donor/profile', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['User'],
    }),

    updateDonorProfile: builder.mutation<DonorProfile, Partial<DonorProfile>>({
      query: (body) => ({ url: '/donor/profile', method: 'PUT', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['User'],
    }),

    deleteDonorProfile: builder.mutation<void, void>({
      query: () => ({ url: '/donor/profile', method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // ── Blood Requests CRUD ─────────────────────────────────────────────
    getBloodRequests: builder.query<BloodRequest[], { urgency?: string }>({
      query: (params) => ({ url: '/requests', params }),
      transformResponse: (res: any) => res.data,
      providesTags: ['BloodRequest'],
    }),

    getBloodRequestById: builder.query<BloodRequest, string>({
      query: (id) => `/requests/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: ['BloodRequest'],
    }),

    createBloodRequest: builder.mutation<BloodRequest, Partial<BloodRequest>>({
      query: (body) => ({ url: '/requests', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['BloodRequest'],
    }),

    acceptBloodRequest: builder.mutation<BloodRequest, string>({
      query: (id) => ({ url: `/requests/${id}/accept`, method: 'PUT' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['BloodRequest'],
    }),

    dismissBloodRequest: builder.mutation<BloodRequest, string>({
      query: (id) => ({ url: `/requests/${id}/dismiss`, method: 'PUT' }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['BloodRequest'],
    }),

    deleteBloodRequest: builder.mutation<void, string>({
      query: (id) => ({ url: `/requests/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BloodRequest'],
    }),

    // ── Donation History CRUD ───────────────────────────────────────────
    getDonationHistory: builder.query<DonationRecord[], void>({
      query: () => '/history',
      transformResponse: (res: any) => res.data,
      providesTags: ['DonationMonitor'],
    }),

    getDonationStats: builder.query<DonorStats, void>({
      query: () => '/history/stats',
      transformResponse: (res: any) => res.data,
      providesTags: ['DonationMonitor'],
    }),

    createDonationRecord: builder.mutation<DonationRecord, Partial<DonationRecord>>({
      query: (body) => ({ url: '/history', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['DonationMonitor'],
    }),

    updateDonationRecord: builder.mutation<DonationRecord, { id: string; data: Partial<DonationRecord> }>({
      query: ({ id, data }) => ({ url: `/history/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['DonationMonitor'],
    }),

    deleteDonationRecord: builder.mutation<void, string>({
      query: (id) => ({ url: `/history/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DonationMonitor'],
    }),
  }),
});

export const {
  // Profile
  useGetDonorProfileQuery,
  useCreateDonorProfileMutation,
  useUpdateDonorProfileMutation,
  useDeleteDonorProfileMutation,
  // Requests
  useGetBloodRequestsQuery,
  useGetBloodRequestByIdQuery,
  useCreateBloodRequestMutation,
  useAcceptBloodRequestMutation,
  useDismissBloodRequestMutation,
  useDeleteBloodRequestMutation,
  // History
  useGetDonationHistoryQuery,
  useGetDonationStatsQuery,
  useCreateDonationRecordMutation,
  useUpdateDonationRecordMutation,
  useDeleteDonationRecordMutation,
} = donorApiSlice;
