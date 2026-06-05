 'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setLoading } from '@/features/auth/authSlice';
import { Toaster } from 'react-hot-toast';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        dispatch(setLoading(false));
      }
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '13.5px' },
          }}
        />
      </AuthInitializer>
    </Provider>
  );
}
