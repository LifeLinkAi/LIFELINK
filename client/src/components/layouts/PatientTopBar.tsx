'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';

const NOTIFICATIONS = [
  'Your blood request is updated',
  'A donor match is under review',
  'Hospital verification completed',
];

export function PatientTopBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dispatch = useAppDispatch();

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
    <header className="sticky top-0 z-40 h-16 bg-[#F5F2E8]/95 backdrop-blur border-b border-[#E8E4D8] px-6 flex items-center justify-between">
      <div className="relative w-full max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search requests, hospitals..."
          className="h-10 w-full rounded-lg border border-[#D0CCBC] bg-white pl-9 pr-3 text-[13px] text-[#1a2e0a] outline-none transition-all placeholder:text-[#8A9A7A] focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(open => !open);
              setProfileOpen(false);
            }}
            className="relative h-10 w-10 rounded-lg border border-[#D0CCBC] bg-white text-[#3A4A2A] flex items-center justify-center hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#E8E4D8] bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F0EDE3]">
                <p className="text-[13px] font-bold text-[#1a2e0a]">Notifications</p>
              </div>
              {NOTIFICATIONS.map(item => (
                <button
                  key={item}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-[#FAFAF7] transition-colors"
                >
                  <p className="text-[12.5px] font-medium text-[#3A4A2A]">{item}</p>
                  <p className="text-[11px] text-[#8A9A7A] mt-0.5">Just now</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/patient/settings"
          className="h-10 w-10 rounded-lg border border-[#D0CCBC] bg-white text-[#3A4A2A] flex items-center justify-center hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
          aria-label="Settings"
        >
          <Settings size={17} />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(open => !open);
              setNotificationsOpen(false);
            }}
            className="h-10 rounded-lg border border-[#D0CCBC] bg-white pl-2 pr-2.5 flex items-center gap-2 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
          >
            <span className="h-7 w-7 rounded-lg bg-red-700 text-white text-[12px] font-bold flex items-center justify-center">
              PT
            </span>
            <ChevronDown size={14} className={cn('text-[#8A9A7A] transition-transform', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#E8E4D8] bg-white shadow-lg overflow-hidden">
              <Link
                href="/patient/profile"
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-[#3A4A2A] hover:bg-[#FAFAF7] transition-colors"
              >
                <User size={14} /> My Profile
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

export default PatientTopBar;
