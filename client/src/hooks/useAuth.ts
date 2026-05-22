'use client';
import { useAppSelector } from '@/store/hooks';

export function useAuth() {
  const { user, isAuthenticated, loading } = useAppSelector((s) => s.auth);
  return { user, isAuthenticated, loading };
}
