'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    // 1. Clear local session keys
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 2. Fire backend logout route to clear httpOnly cookie
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    if (!apiUrl.endsWith('/api')) {
      apiUrl = `${apiUrl}/api`;
    }
    fetch(`${apiUrl}/auth/logout`, { method: 'POST' }).finally(() => {
      // 3. Redirect back to login screen
      window.location.href = '/login';
    });
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith('/admin/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/admin/donors')) return 'Donor Management';
    if (path.startsWith('/admin/hospitals')) return 'Hospital Management';
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

        <div className="flex items-center gap-4 relative">
          <button
            aria-label="Notifications"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <Link
            href="/admin/settings"
            aria-label="Settings"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>

          {/* Profile Dropdown Trigger */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/20 transition-all ml-2 focus:outline-none"
            aria-label="User Profile"
          >
            <img
              alt="Medical Professional Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR1ddKrVvcxZjGY50uCPA46yZa5hX9s3_drT-2yKnJXv9QG0P6LJy1h40PtVrtRx8ybMBsDHjs41hXGR5EtbK9qyDSyWgahHmtqY5maRiFYY9Uu5ejnHv_CeFE7EByE1EuDrbJ9_0nieSRRvt8Z7uiImkF7-pvdl6aqimbdMxhNNDFebSY9Ot9qeePcjeDOCfy-2chD2ljV-QoD0vxrOEapgylPujltuCS2Y1iPGBcVT_a35HWAa2_QN8nqTMkvH62iRGHE6PSz1Lj"
            />
          </button>

          {/* Click-outside backdrop */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Floating Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 p-4 flex flex-col font-dmsans">
              {/* User Information */}
              <div className="pb-3 border-b border-outline-variant/60 mb-2">
                <p className="font-syne font-bold text-sm text-primary">Dr. Sarah Connor</p>
                <p className="text-xs text-on-surface-variant truncate">sarah.connor@lifelink.org</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                  System Admin
                </span>
              </div>

              {/* Action Links */}
              <div className="flex flex-col space-y-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high rounded-lg transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">
                    settings
                  </span>
                  <span>Account Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors group text-left w-full"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] group-hover:translate-x-0.5 transition-transform">
                    logout
                  </span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
