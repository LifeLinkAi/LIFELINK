"use client";

import React from 'react';
import { usePathname } from "next/navigation";
import { PatientSidebar } from "@/components/layouts/PatientSidebar";
import { PatientTopBar } from "@/components/layouts/PatientTopBar";
import AuthGuard from '@/components/shared/AuthGuard';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Donor routes manage their own full layout (sidebar + topbar).
  // Render only {children} so the donor layout.tsx has full control.
  const isDonorRoute = pathname.startsWith("/donor");

  const content = isDonorRoute ? (
    <>{children}</>
  ) : (
    <div className="flex h-screen bg-[#F5F2E8] overflow-hidden">
      <PatientSidebar />
      <div className="flex flex-col flex-1 ml-[240px] min-w-0 overflow-hidden">
        <PatientTopBar />
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );

  return <AuthGuard allowedRoles={['Patient', 'Donor']}>{content}</AuthGuard>;
}
