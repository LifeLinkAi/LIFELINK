'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboards if they are logged in but have the wrong role
        if (user.role === 'Admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'Hospital') {
          router.push('/hospital/dashboard');
        } else if (user.role === 'Donor') {
          router.push('/donor/dashboard');
        } else if (user.role === 'Patient') {
          router.push('/patient/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fcfdfa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
          <p className="font-syne font-semibold text-emerald-800 text-sm tracking-wide">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!loading && (!isAuthenticated || !user)) {
    // THE KILL SWITCH: Instantly redirect and return Spinner, NEVER return children.
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fcfdfa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
          <p className="font-syne font-semibold text-emerald-800 text-sm tracking-wide">Redirecting to secure login...</p>
        </div>
      </div>
    );
  }

  // If authenticated and role matches, render children
  if (isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>;
  }

  return null;
}
