'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';

interface SidebarItem {
  name: string;
  icon: string;
  href: string;
  fillIcon?: boolean;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const controls = useAnimation();

  useEffect(() => {
    // Initial entrance animation
    controls.start("animate");

    // Loop wave animation every 3 seconds
    const interval = setInterval(() => {
      controls.start("loopWave");
    }, 3000);

    return () => clearInterval(interval);
  }, [controls]);

  const logoVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    },
    loopWave: {
      transition: {
        staggerChildren: 0.05
      }
    },
    hover: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const letterVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    loopWave: {
      y: [0, -8, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    hover: {
      y: [0, -8, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

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

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col bg-primary border-r border-outline-variant/30 shadow-md py-10 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 lg:hidden p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Close Sidebar"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        {/* Notion-style Workspace Header */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-150 group">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img src="/images/logo.png" alt="LifeLink Logo" className="w-full h-full object-cover" />
            </div>
            {/* Titles */}
            <div className="flex-1 min-w-0">
              <motion.h2 
                initial="initial"
                animate={controls}
                whileHover="hover"
                variants={logoVariants}
                className="font-syne text-[18px] font-bold text-white tracking-tight leading-tight flex"
              >
                {"LifeLink".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h2>
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
                onClick={onClose}
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
                onClick={onClose}
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
                onClick={onClose}
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

          {/* Logout */}
          <button
            onClick={() => {
              // 1. Clear local session keys
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // 2. Fire backend logout route to clear httpOnly cookie
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              fetch(`${apiUrl}/auth/logout`, { method: 'POST' }).finally(() => {
                // 3. Redirect back to login screen
                window.location.href = '/login';
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-[#ffdad6] hover:bg-white/10 transition-all duration-200 group text-left"
          >
            <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1">
              logout
            </span>
            <span className="font-dmsans text-[12px] tracking-[0.05em] uppercase font-normal">
              Logout
            </span>
          </button>
        </div>

      </nav>
    </>
  );
}
