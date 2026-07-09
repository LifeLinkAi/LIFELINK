'use client';
import { useState } from 'react';
import { HospitalSidebar } from '@/components/layouts/HospitalSidebar';
import { HospitalTopBar }   from '@/components/layouts/HospitalTopBar';
import AuthGuard from '@/components/shared/AuthGuard';

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={['Hospital']}>
      <div className="flex h-screen bg-cream overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <HospitalSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex flex-col flex-1 lg:ml-[240px] min-w-0 overflow-hidden w-full">
          <HospitalTopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-7">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
