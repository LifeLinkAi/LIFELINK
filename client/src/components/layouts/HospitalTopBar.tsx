'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Plus, Search, Settings, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Cookies from 'js-cookie';
import { clearUser } from '@/features/auth/authSlice';
import NotificationBell from '../ui/NotificationBell';

const HOSPITAL_ALERTS = [
  'Critical: O- Negative request escalated',
  'ER Alert: Level 1 Elevated',
  'Organ review: Kidney match awaiting approval',
];

const IcoMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

interface HospitalTopBarProps {
  onMenuClick?: () => void;
}

export function HospitalTopBar({ onMenuClick }: HospitalTopBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    // 1. Clear client-side auth state
    dispatch(clearUser());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lifelink-auth');
    Cookies.remove('ll_access_token');
    sessionStorage.clear();

    // 2. Fire backend logout to clear httpOnly refresh cookie (best-effort)
    (async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        if (!apiUrl.endsWith('/api')) apiUrl = `${apiUrl}/api`;
        await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        // ignore network errors
      } finally {
        router.push('/login');
      }
    })();
  };

  return (
    <header className="h-14 bg-white border-b border-[#E8E4D8] flex items-center justify-between px-4 lg:px-7 flex-shrink-0 sticky top-0 z-40">
      <div className="flex items-center gap-3 relative">
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900 shrink-0"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <IcoMenu />
        </button>
        <div className="relative hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search records..."
            className="pl-8 pr-4 h-8 w-40 md:w-64 text-[13px] bg-cream border border-[#E8E4D8] rounded-full outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <StatusChip label="ICU: 92%"        variant="warn"     />
        <StatusChip label="Blood: Critical" variant="critical" />
        <StatusChip label="ER: Level 1"     variant="warn"     />
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationBell />

        <Link
          href="/hospital/settings"
          aria-label="Settings"
          className="w-8 h-8 rounded-lg border border-[#E8E4D8] bg-white flex items-center justify-center text-[#6B7A5A] hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brand-400/25 transition-colors"
        >
          <Settings size={16} />
        </Link>

        <IconBtn label="New">
          <Plus size={16} />
        </IconBtn>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(open => !open);
            }}
            className="h-8 rounded-full bg-brand-600 text-white text-[11px] font-semibold pl-3 pr-2 flex items-center gap-1.5 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/25 transition-colors"
          >
            DR
            <ChevronDown size={12} className={cn('transition-transform', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-[#E8E4D8] shadow-lg overflow-hidden">
              <Link
                href="/hospital/profile"
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-[#3A4A2A] hover:bg-cream transition-colors"
              >
                <UserRound size={14} /> Hospital Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function StatusChip({ label, variant }: { label: string; variant: 'critical' | 'warn' | 'ok' }) {
  return (
    <span className={cn(
      'flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border',
      variant === 'critical' && 'text-red-700 bg-red-50 border-red-200',
      variant === 'warn' && 'text-amber-700 bg-amber-50 border-amber-200',
      variant === 'ok' && 'text-green-700 bg-green-50 border-green-200',
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'critical' && 'bg-red-600',
        variant === 'warn' && 'bg-amber-500',
        variant === 'ok' && 'bg-green-500',
      )} />
      {label}
    </span>
  );
}

function IconBtn({
  children, label, badge = 0, onClick,
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative w-8 h-8 rounded-lg border border-[#E8E4D8] bg-white flex items-center justify-center text-[#6B7A5A] hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brand-400/25 transition-colors"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
