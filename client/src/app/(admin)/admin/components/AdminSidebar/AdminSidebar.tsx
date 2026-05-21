'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  icon: string;
  href: string;
  fillIcon?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const primaryNavigation: SidebarItem[] = [
    { name: 'Dashboards', icon: 'dashboard', href: '/admin/dashboard' },
    { name: 'Emergency Hubs', icon: 'emergency_home', href: '/admin/emergencies' },
    { name: 'Analytics', icon: 'insights', href: '/admin/analytics' },
    { name: 'Medical Intelligence', icon: 'psychology', href: '/admin/medical-intelligence' },
    { name: 'Verifications', icon: 'admin_panel_settings', href: '/admin/verifications', fillIcon: true },
    { name: 'Ambulance Management', icon: 'ambulance', href: '/admin/drivers' },
    { name: 'Coordination', icon: 'apartment', href: '/admin/hospitals' },
    { name: 'Campaigns', icon: 'campaign', href: '/admin/campaigns' },
    { name: 'Operational Reports', icon: 'assessment', href: '/admin/reports' },
    { name: 'Settings', icon: 'settings', href: '/admin/settings' },
  ];

  // Helper to check if a route is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Load Material Symbols for icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <nav className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-primary border-r border-outline-variant/30 shadow-md py-10 z-50">
        {/* Notion-style Workspace Header */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-150 group">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img src="/images/logo.png" alt="LifeLink Logo" className="w-full h-full object-cover" />
            </div>
            {/* Titles */}
            <div className="flex-1 min-w-0">
              <h2 className="font-syne text-[18px] font-bold text-white tracking-tight leading-tight truncate">
                LifeLink
              </h2>
              <p className="font-dmsans text-[12px] text-on-primary-container opacity-80 leading-tight truncate mt-0.5">
                Coordination
              </p>
            </div>
            {/* Dropdown Chevron */}
            <span className="material-symbols-outlined text-[18px] text-on-primary-container/70 group-hover:text-white transition-colors">
              unfold_more
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-1">
          {primaryNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-white text-primary scale-[0.98] shadow-sm font-bold'
                    : 'text-on-primary-container hover:bg-white/10 group'
                }`}
              >
                <span
                  className={`material-symbols-outlined transition-transform duration-200 ${
                    !active ? 'group-hover:translate-x-1' : ''
                  }`}
                  style={
                    active || item.fillIcon
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className={`font-dmsans text-[12px] tracking-[0.05em] uppercase ${active ? 'font-bold' : 'font-normal'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>


      </nav>
    </>
  );
}
