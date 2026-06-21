'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Droplets, Heart,
  Clock, FileHeart,
  Settings, HelpCircle, LogOut,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Dashboard',         href: '/patient/dashboard',          icon: LayoutDashboard },
  { label: 'Request Blood',     href: '/patient/request-blood',      icon: Droplets        },
  { label: 'My Requests',       href: '/patient/request-status',     icon: Clock           },
  { label: 'Medical History',   href: '/patient/medical-history',    icon: FileHeart       },
];

interface PatientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientSidebar({ isOpen, onClose }: PatientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // clear client state
    dispatch(clearUser());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lifelink-auth');
    Cookies.remove('ll_access_token');
    sessionStorage.clear();

    // best-effort backend logout
    (async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        if (!apiUrl.endsWith('/api')) apiUrl = `${apiUrl}/api`;
        await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        // ignore
      } finally {
        router.push('/login');
      }
    })();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close patient navigation"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col overflow-hidden bg-[#1a0a0a] transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-[13px]">L</span>
        </div>
        <div>
          <p className="text-white font-semibold text-[14.5px] leading-none">LifeLink AI</p>
          <p className="text-red-400 text-[11px] mt-0.5">Patient Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto scrollbar-hide space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                active
                  ? 'bg-red-700 text-white font-medium'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/[0.07]'
              )}
            >
              <Icon size={16} className="flex-shrink-0 opacity-90" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Role switch + bottom */}
      <div className="border-t border-white/10 px-2 py-2 flex-shrink-0 space-y-0.5">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
        <Link href="/patient/settings" onClick={onClose} className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/support" onClick={onClose} className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <HelpCircle size={16} /> Support
        </Link>
      </div>
      </aside>
    </>
  );
}
