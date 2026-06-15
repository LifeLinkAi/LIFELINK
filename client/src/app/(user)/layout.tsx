"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from "next/navigation";
import { PatientSidebar } from "@/components/layouts/PatientSidebar";
import { PatientTopBar } from "@/components/layouts/PatientTopBar";
import AuthGuard from '@/components/shared/AuthGuard';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [patientNavOpen, setPatientNavOpen] = useState(false);

  useEffect(() => {
    setPatientNavOpen(false);
  }, [pathname]);

  // Donor routes manage their own full layout (sidebar + topbar).
  // Render only {children} so the donor layout.tsx has full control.
  const isDonorRoute = pathname.startsWith("/donor");

  const content = isDonorRoute ? (
    <>{children}</>
  ) : (
    <div className="flex min-h-screen bg-[#F5F2E8] md:h-screen md:overflow-hidden">
      <PatientSidebar isOpen={patientNavOpen} onClose={() => setPatientNavOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[240px] md:h-screen md:overflow-hidden">
        <PatientTopBar onMenuClick={() => setPatientNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6 md:overflow-y-auto md:p-7">
          {children}
        </main>
      </div>
    </div>
  );

  return <AuthGuard allowedRoles={['Patient', 'Donor']}>{content}</AuthGuard>;
}
