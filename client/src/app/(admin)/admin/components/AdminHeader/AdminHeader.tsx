'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/admin/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/admin/donors')) return 'Donor Management';
    if (path.startsWith('/admin/hospitals')) return 'Hospital Management';
    if (path.startsWith('/admin/drivers')) return 'Ambulance Management';
    if (path.startsWith('/admin/emergencies')) return 'Emergency Hub';
    if (path.startsWith('/admin/blood-requests')) return 'Blood Management';
    if (path.startsWith('/admin/organ-requests')) return 'Organ Management';
    if (path.startsWith('/admin/analytics')) return 'Analytics';
    if (path.startsWith('/admin/campaigns')) return 'Campaigns';
    if (path.startsWith('/admin/settings')) return 'Settings';
    return 'Admin Control';
  };

  return (
    <>
      {/* Load Material Symbols for icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-primary hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Dynamic Bold Page Title */}
          <h1 className="font-syne font-bold text-[16px] sm:text-lg md:text-[22px] text-primary tracking-tight">
            {getPageTitle(pathname).toUpperCase()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <button
            aria-label="Settings"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2">
            <img
              alt="Medical Professional Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR1ddKrVvcxZjGY50uCPA46yZa5hX9s3_drT-2yKnJXv9QG0P6LJy1h40PtVrtRx8ybMBsDHjs41hXGR5EtbK9qyDSyWgahHmtqY5maRiFYY9Uu5ejnHv_CeFE7EByE1EuDrbJ9_0nieSRRvt8Z7uiImkF7-pvdl6aqimbdMxhNNDFebSY9Ot9qeePcjeDOCfy-2chD2ljV-QoD0vxrOEapgylPujltuCS2Y1iPGBcVT_a35HWAa2_QN8nqTMkvH62iRGHE6PSz1Lj"
            />
          </div>
        </div>
      </header>
    </>
  );
}
