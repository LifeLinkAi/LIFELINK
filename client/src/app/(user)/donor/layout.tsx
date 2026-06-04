"use client";

import React, { useState } from "react";
import { DonorSidebar } from "@/components/layouts/DonorSidebar";
import { DonorTopBar } from "@/components/layouts/DonorTopBar";

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /*
     * This layout intentionally does NOT render the parent (user)/layout.tsx
     * sidebar or top-bar. Next.js nested layouts compose automatically, so we
     * wrap with a full-screen div that overrides the parent's padding/ml.
     * The parent layout renders PatientSidebar + PatientTopBar — to prevent
     * those from showing on donor routes we use a route group approach:
     * the donor folder sits inside (user)/ but its own layout.tsx takes full
     * control of the viewport via fixed positioning for the sidebar.
     */
    <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden">
      {/* Fixed sidebar — positioned independently of parent layout */}
      <DonorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column — pushed right by sidebar width on desktop */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        <DonorTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
