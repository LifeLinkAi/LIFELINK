'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Siren, Droplets, Heart,
  Ambulance, Clock, MapPin, FileHeart,
  Settings, HelpCircle, ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Dashboard',         href: '/patient/dashboard',          icon: LayoutDashboard },
  { label: 'SOS Emergency',     href: '/patient/sos',                icon: Siren           },
  { label: 'Request Blood',     href: '/patient/request-blood',      icon: Droplets        },
  { label: 'Request Organ',     href: '/patient/request-organ',      icon: Heart           },
  { label: 'Request Ambulance', href: '/patient/request-ambulance',  icon: Ambulance       },
  { label: 'My Requests',       href: '/patient/request-status',     icon: Clock           },
  { label: 'Nearby Hospitals',  href: '/patient/nearby-hospitals',   icon: MapPin          },
  { label: 'Medical History',   href: '/patient/medical-history',    icon: FileHeart       },
];

export function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#1a0a0a] flex flex-col z-50 overflow-hidden">

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

      {/* SOS button - prominent */}
      <div className="px-3 pt-4 pb-2 flex-shrink-0">
        <Link
          href="/patient/sos"
          className="w-full bg-red-700 hover:bg-red-600 text-white text-[13px] font-bold px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 animate-pulse hover:animate-none"
        >
          <Siren size={15} />
          SOS EMERGENCY
        </Link>
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
        <Link
          href="/role-switch"
          className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all"
        >
          <ArrowLeftRight size={16} /> Switch to Donor
        </Link>
        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/support" className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-white/55 hover:text-white hover:bg-white/[0.07] transition-all">
          <HelpCircle size={16} /> Support
        </Link>
      </div>
    </aside>
  );
}
