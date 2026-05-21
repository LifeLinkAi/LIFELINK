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

  const scrollNavigation: SidebarItem[] = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
    { name: 'Donor Management', icon: 'volunteer_activism', href: '/admin/donors' },
    { name: 'Hospital Management', icon: 'local_hospital', href: '/admin/hospitals' },
    { name: 'Ambulance Management', icon: 'ambulance', href: '/admin/drivers' },
    { name: 'Blood Management', icon: 'bloodtype', href: '/admin/blood-requests' },
    { name: 'Organ Management', icon: 'nephrology', href: '/admin/organ-requests' },
    { name: 'Analytics', icon: 'insights', href: '/admin/analytics' },
    { name: 'Campaigns', icon: 'campaign', href: '/admin/campaigns' },
  ];

  const emergencyHubItem: SidebarItem = {
    name: 'Emergency Hub',
    icon: 'emergency',
    href: '/admin/emergencies',
  };

  const settingsItem: SidebarItem = {
    name: 'Settings',
    icon: 'settings',
    href: '/admin/settings',
  };

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
        <div className="flex-grow overflow-y-auto no-scrollbar px-2 space-y-1">
          {scrollNavigation.map((item) => {
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

        {/* Sticky Bottom Section */}
        <div className="mt-auto pt-4 border-t border-white/10 px-2 space-y-1 shrink-0">
          {/* Emergency Hub (Red, Sticky) */}
          {(() => {
            const active = isActive(emergencyHubItem.href);
            return (
              <Link
                href={emergencyHubItem.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 bg-red-600 text-white font-bold shadow-md hover:bg-red-700 group ${
                  active
                    ? 'ring-2 ring-white/40 scale-[0.98]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <span
                  className="material-symbols-outlined transition-transform duration-200 group-hover:scale-110 text-white"
                  style={
                    active
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {emergencyHubItem.icon}
                </span>
                <span className="font-dmsans text-[12px] tracking-[0.05em] uppercase font-bold text-white">
                  {emergencyHubItem.name}
                </span>
              </Link>
            );
          })()}

          {/* Settings */}
          {(() => {
            const active = isActive(settingsItem.href);
            return (
              <Link
                href={settingsItem.href}
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
                    active
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {settingsItem.icon}
                </span>
                <span className={`font-dmsans text-[12px] tracking-[0.05em] uppercase ${active ? 'font-bold' : 'font-normal'}`}>
                  {settingsItem.name}
                </span>
              </Link>
            );
          })()}
        </div>

      </nav>
    </>
  );
}
