'use client';

import React from 'react';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminHeader from './components/AdminHeader/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7F0] text-on-surface font-dmsans antialiased flex">
      {/* Sidebar - fixed on the left (hidden on mobile, shown on lg screens) */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-grow lg:pl-[280px] flex flex-col min-h-screen">
        {/* Top Header - sticky inside the main content wrapper */}
        <AdminHeader />

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
