'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Droplet, Heart, Settings, HelpCircle, Plus, LogOut, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/features/auth/authSlice';

const NAV = [
  { label: 'Dashboard',          href: '/hospital/dashboard',              icon: LayoutDashboard },
  { label: 'Emergencies',        href: '/hospital/emergencies',            icon: AlertTriangle   },
  { label: 'Blood Management',   href: '/hospital/blood-management',       icon: Droplet         },
  { label: 'Organ Management',   href: '/hospital/organ-management',       icon: Heart           },
];

export function HospitalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-brand-900 flex flex-col z-50 overflow-hidden">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-[13px]">L</span>
        </div>
        <div>
          <p className="text-white font-semibold text-[14.5px] leading-none">LifeLink AI</p>
          <p className="text-brand-400 text-[11px] mt-0.5">Hospital Portal</p>
        </div>
      </div>

      {/* New Request button */}
      <div className="px-3 pt-4 pb-2 flex-shrink-0">
        <button className="w-full bg-brand-600 hover:bg-brand-400 text-white text-[13px] font-medium px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-150">
          <Plus size={15} />
          New Request
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto scrollbar-hide space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150',
                active
                  ? 'bg-brand-400 text-white font-medium'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/[0.07]'
              )}
            >
              <Icon size={16} className="flex-shrink-0 opacity-90" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-2 py-2 flex-shrink-0 space-y-0.5">
        <Link href="/hospital/settings" className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/support" className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <HelpCircle size={16} /> Support
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
