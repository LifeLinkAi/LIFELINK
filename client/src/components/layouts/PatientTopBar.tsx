'use client';
import { Bell, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export function PatientTopBar() {
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  return (
    <header className="h-14 bg-white border-b border-[#E8E4D8] flex items-center justify-between px-7 flex-shrink-0 sticky top-0 z-40">

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A7A]" />
        <input
          type="text"
          placeholder="Search hospitals, requests..."
          className="pl-8 pr-4 h-8 w-64 text-[13px] bg-[#F5F2E8] border border-[#E8E4D8] rounded-full outline-none focus:border-red-400 transition-colors"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <StatusChip label="Blood: O+" variant="info" />
        <StatusChip label="No Active SOS" variant="ok" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <IconBtn label="Notifications" badge={unreadCount}>
          <Bell size={16} />
        </IconBtn>
        <IconBtn label="Settings">
          <Settings size={16} />
        </IconBtn>
        <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-[11px] font-semibold ml-1 cursor-pointer">
          PT
        </div>
      </div>
    </header>
  );
}

function StatusChip({ label, variant }: { label: string; variant: 'ok' | 'warn' | 'critical' | 'info' }) {
  return (
    <span className={cn(
      'flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border',
      variant === 'critical' && 'text-red-700   bg-red-50   border-red-200',
      variant === 'warn'     && 'text-amber-700 bg-amber-50 border-amber-200',
      variant === 'ok'       && 'text-green-700 bg-green-50 border-green-200',
      variant === 'info'     && 'text-blue-700  bg-blue-50  border-blue-200',
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'critical' && 'bg-red-600',
        variant === 'warn'     && 'bg-amber-500',
        variant === 'ok'       && 'bg-green-500',
        variant === 'info'     && 'bg-blue-500',
      )} />
      {label}
    </span>
  );
}

function IconBtn({
  children, label, badge = 0,
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      aria-label={label}
      className="relative w-8 h-8 rounded-lg border border-[#E8E4D8] bg-white flex items-center justify-center text-[#6B7A5A] hover:bg-[#F5F2E8] transition-colors"
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
