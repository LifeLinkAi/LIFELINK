'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminHeader from './components/AdminHeader/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isSettings = pathname.startsWith('/admin/settings');

  if (isSettings) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#EFF2EE] text-on-surface font-dmsans antialiased flex admin-theme">
      {/* Sidebar - fixed on the left (hidden on mobile, shown on lg screens) */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-grow lg:pl-[280px] flex flex-col min-h-screen min-w-0">
        {/* Top Header - sticky inside the main content wrapper */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
