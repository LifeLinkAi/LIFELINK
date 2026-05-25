import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './apiSlice';
import authReducer from '@/features/auth/authSlice';
import hospitalReducer from '@/features/hospital/hospitalSlice';
import notificationReducer from '@/features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth:          authReducer,
    hospital:      hospitalReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
