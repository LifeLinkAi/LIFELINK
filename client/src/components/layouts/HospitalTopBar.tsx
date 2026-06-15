'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Plus, Search, Settings, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Cookies from 'js-cookie';
import { clearUser } from '@/features/auth/authSlice';

const HOSPITAL_ALERTS = [
  'Critical: O- Negative request escalated',
  'ER Alert: Level 1 Elevated',
  'Organ review: Kidney match awaiting approval',
];

export function HospitalTopBar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [query, setQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
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
    <header className="h-14 bg-white border-b border-[#E8E4D8] flex items-center justify-between px-7 flex-shrink-0 sticky top-0 z-40">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search records..."
          className="pl-8 pr-4 h-8 w-64 text-[13px] bg-cream border border-[#E8E4D8] rounded-full outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
        />
      </div>

      <div className="flex items-center gap-2">
        <StatusChip label="ICU: 92%"        variant="warn"     />
        <StatusChip label="Blood: Critical" variant="critical" />
        <StatusChip label="ER: Level 1"     variant="warn"     />
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <IconBtn
            label="Notifications"
            badge={unreadCount || HOSPITAL_ALERTS.length}
            onClick={() => {
              setAlertsOpen(open => !open);
              setProfileOpen(false);
            }}
          >
            <Bell size={16} />
          </IconBtn>
          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E8E4D8] shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F0EDE3]">
                <p className="text-[13px] font-bold text-[#1a2e0a]">Hospital Alerts</p>
              </div>
              {HOSPITAL_ALERTS.map((alert, index) => (
                <button
                  type="button"
                  key={alert}
                  className="w-full text-left px-4 py-3 hover:bg-cream transition-colors"
                >
                  <p className="text-[12.5px] font-semibold text-[#3A4A2A]">{alert}</p>
                  <p className="text-[11px] text-[#8A9A7A] mt-0.5">{index === 0 ? 'Just now' : `${index * 8} mins ago`}</p>
                </button>
              ))}
            </div>
          )}
        </div>

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
              setAlertsOpen(false);
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
