import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
    prepareHeaders: (headers) => {
      const token = Cookies.get('ll_access_token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'BloodRequest', 'OrganRequest', 'AmbulanceTrip',
    'DonationMonitor', 'Hospital', 'User', 'Notification',
  ],
  endpoints: () => ({}),
});
