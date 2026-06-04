'use client';

import React, { useState } from 'react';

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'weekly' | 'monthly'>('today');

  return (
    <div className="space-y-lg pb-xxl w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <p className="text-on-surface-variant font-body-md mt-1">
            Welcome back, Sarah. Here is what's happening today in the network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container rounded-xl p-1">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-4 py-1.5 rounded-lg font-label-caps text-[12px] transition-all ${
                timeFilter === 'today' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-1.5 rounded-lg font-label-caps text-[12px] transition-all ${
                timeFilter === 'weekly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-1.5 rounded-lg font-label-caps text-[12px] transition-all ${
                timeFilter === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'
              }`}
            >
              Monthly
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-gradient-to-r from-error to-[#ef4444] p-lg rounded-xl text-white flex items-center gap-lg shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-8 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[160px]">emergency_share</span>
        </div>
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px] pulse-red">emergency</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline-md text-headline-md font-bold">3 Critical Emergencies</h3>
          <p className="opacity-90 font-body-md">
            Requires immediate dispatcher allocation for O- negative blood transport in Central District.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-error font-bold rounded-xl shadow-sm hover:bg-neutral-50 transition-colors whitespace-nowrap">
          View All
        </button>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Total Users */}
        <div className="glass-card p-lg rounded-xl flex flex-col gap-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <span className="text-secondary font-bold text-body-sm">+12.5%</span>
          </div>
          <div className="mt-2">
            <p className="text-on-surface-variant font-label-caps text-[12px] uppercase">Total Users</p>
            <h4 className="font-display-lg text-[32px] text-primary">12,847</h4>
          </div>
        </div>

        {/* Active Donors */}
        <div className="glass-card p-lg rounded-xl flex flex-col gap-sm relative overflow-hidden hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <span className="text-secondary font-bold text-body-sm">+8.2%</span>
          </div>
          <div className="mt-2">
            <p className="text-on-surface-variant font-label-caps text-[12px] uppercase">Active Donors</p>
            <h4 className="font-display-lg text-[32px] text-primary">3,254</h4>
          </div>
        </div>

        {/* Active Emergencies (Live) */}
        <div className="bg-primary p-lg rounded-xl flex flex-col gap-sm relative overflow-hidden shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined pulse-red">sensors</span>
            </div>
            <span className="bg-error text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Live</span>
          </div>
          <div className="mt-2">
            <p className="text-white/70 font-label-caps text-[12px] uppercase">Active Emergencies</p>
            <h4 className="font-display-lg text-[32px] text-white">27</h4>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-card p-lg rounded-xl flex flex-col gap-sm relative overflow-hidden border-2 border-secondary/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">Needs Review</span>
          </div>
          <div className="mt-2">
            <p className="text-on-surface-variant font-label-caps text-[12px] uppercase">Pending Verifications</p>
            <h4 className="font-display-lg text-[32px] text-primary">84</h4>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md bg-surface-container/30 p-md rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Hospitals</p>
            <p className="font-headline-sm text-headline-sm">142</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-l border-outline-variant/50">
          <div className="w-2 h-2 rounded-full bg-error"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Blood Requests</p>
            <p className="font-headline-sm text-headline-sm">56</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-l border-outline-variant/50">
          <div className="w-2 h-2 rounded-full bg-primary-container"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Organ Requests</p>
            <p className="font-headline-sm text-headline-sm">8</p>
          </div>
        </div>
      </div>

      {/* Visual Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Donations Area Chart Mockup */}
        <div className="lg:col-span-2 glass-card rounded-xl p-lg space-y-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-primary">Donations This Month</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-[12px] font-label-caps">Blood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-[12px] font-label-caps">Organs</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full relative flex items-end justify-between px-2 overflow-hidden">
            {/* Chart Lines (Simulated with SVG lines) */}
            <div className="absolute inset-x-0 bottom-0 h-full flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                <path d="M0,80 Q50,20 100,50 T200,30 T300,60 T400,10" fill="none" stroke="#ba1a1a" strokeWidth="3"></path>
                <path d="M0,100 Q50,40 100,70 T200,50 T300,80 T400,30" fill="none" stroke="#556b2f" strokeWidth="3"></path>
              </svg>
            </div>
            {/* X-Axis Labels */}
            <div className="w-full flex justify-between pt-4 border-t border-outline-variant/30 mt-auto">
              <span className="text-[10px] font-bold text-outline">01 Sep</span>
              <span className="text-[10px] font-bold text-outline">08 Sep</span>
              <span className="text-[10px] font-bold text-outline">15 Sep</span>
              <span className="text-[10px] font-bold text-outline">22 Sep</span>
              <span className="text-[10px] font-bold text-outline">29 Sep</span>
            </div>
          </div>
        </div>

        {/* Blood Stock Overview */}
        <div className="glass-card rounded-xl p-lg space-y-md">
          <h3 className="font-headline-md text-headline-md text-primary">Blood Stock</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                <span>A+ POSITIVE</span>
                <span className="text-secondary font-bold">Optimal</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary-container" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                <span>O- NEGATIVE</span>
                <span className="text-error font-bold">Critical</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-error" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                <span>B+ POSITIVE</span>
                <span className="text-on-surface-variant font-bold">Stable</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                <span>AB- NEGATIVE</span>
                <span className="text-error font-bold">Critical</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-error" style={{ width: '18%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                <span>O+ POSITIVE</span>
                <span className="text-secondary font-bold">Optimal</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary-container" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Emergency Response Times */}
        <div className="glass-card rounded-xl p-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <h3 className="font-headline-md text-headline-md text-primary mb-lg">Response Times (min)</h3>
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            <div className="flex flex-col justify-end items-center gap-2 flex-1 h-full group">
              <span className="text-[11px] font-bold text-secondary transition-all opacity-85 group-hover:opacity-100">8 min</span>
              <div className="w-full bg-secondary rounded-t-lg transition-all group-hover:brightness-110" style={{ height: '40%' }}></div>
              <span className="text-[10px] font-bold text-outline">URGENT</span>
            </div>
            <div className="flex flex-col justify-end items-center gap-2 flex-1 h-full group">
              <span className="text-[11px] font-bold text-primary transition-all opacity-85 group-hover:opacity-100">13 min</span>
              <div className="w-full bg-primary-container rounded-t-lg transition-all group-hover:brightness-110" style={{ height: '65%' }}></div>
              <span className="text-[10px] font-bold text-outline">ROUTINE</span>
            </div>
            <div className="flex flex-col justify-end items-center gap-2 flex-1 h-full group">
              <span className="text-[11px] font-bold text-error transition-all opacity-85 group-hover:opacity-100">18 min</span>
              <div className="w-full bg-error rounded-t-lg transition-all group-hover:brightness-110" style={{ height: '90%' }}></div>
              <span className="text-[10px] font-bold text-outline">CRITICAL</span>
            </div>
            <div className="flex flex-col justify-end items-center gap-2 flex-1 h-full group">
              <span className="text-[11px] font-bold text-primary transition-all opacity-85 group-hover:opacity-100">11 min</span>
              <div className="w-full bg-primary rounded-t-lg transition-all group-hover:brightness-110" style={{ height: '55%' }}></div>
              <span className="text-[10px] font-bold text-outline">ORGAN</span>
            </div>
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="glass-card rounded-xl p-lg relative overflow-hidden h-[320px]">
          <div className="absolute inset-0 z-0 bg-[#27313f]">
            <img
              alt="Emergency Map"
              className="w-full h-full object-cover opacity-40 grayscale contrast-125 pointer-events-none select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaXEt1t042HphNdorfn35jDp0SWmrD4Fbs9QwTAjhF5Bw6S9igqtTw_fx76C_99KmKBeDB99tnUYBz6T8PqhEISZYdZwAPu6cHJLyf_wIqypODGK5oaNSN1wxKATcVE1NgVgzw-CWAJE7qznjgOTRaq3ctj3YhY98yH1hZLg0sToYnUB9X8rQc-wKgAMnfpFqlF-ukfbxRevUemQQ77lUykvlAts1XfwR_1Ft_sCvzIwEASjBspz9QTkYsHzwrgKQKMG8SATwxw9Rl"
            />
            {/* Heatmap Pulses */}
            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-error/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-error/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <h3 className="font-headline-md text-headline-md text-white">Live Alert Heatmap</h3>
            <span className="bg-surface-container-lowest/10 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full border border-white/20">
              Updated 2s ago
            </span>
          </div>
        </div>
      </div>

      {/* Activity Section (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {/* Recent Emergencies */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Recent Emergencies</h3>
            <span className="material-symbols-outlined text-outline cursor-pointer select-none">more_vert</span>
          </div>
          <div className="divide-y divide-outline-variant/30 flex-1">
            <div className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
              <div className="w-10 h-10 bg-error-container rounded-lg flex items-center justify-center text-error">
                <span className="material-symbols-outlined">ambulance</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">M. J*** S***</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-error/10 text-error text-[10px] rounded font-bold uppercase">Critical</span>
                  <span className="text-[11px] text-on-surface-variant italic">12 mins ago</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
            </div>
            <div className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
              <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">bloodtype</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">R. K*** V***</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded font-bold uppercase">Stable</span>
                  <span className="text-[11px] text-on-surface-variant italic">24 mins ago</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Pending Reviews</h3>
            <span className="text-secondary font-bold text-[12px]">84 New</span>
          </div>
          <div className="divide-y divide-outline-variant/30 flex-1">
            <div className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
              <img
                alt="Dr. Alan"
                className="w-10 h-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9Q6x_cZrKxGcKZfZTNVF7viNm7xbOLzO7IwS6ipp5gELdBh2RMv9xS3c8Ae209XvLJ1tIPe3TKQD7gyTblrEMeHINAwD-0wzHePgLevj9DuUaJLp6iGYgzKB378dbQgvOMke-gGdYJ3KqGrTXauuHEzLIeA4CZYycv-CzCMYXMVDM627F-7Os4vY4h6xO24zW99Y682ayaETnFETJnaMCWAUUuNT_eafM3Z2x2PbxyDmq6DE3YWaclcTeq2nnaB9nPFUSVQzEXrL-"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate">Dr. Alan Miller</p>
                <p className="text-[11px] text-on-surface-variant">Cardiologist · Hosp #12</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  aria-label="Approve Dr. Alan"
                  className="w-8 h-8 flex items-center justify-center bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
                <button
                  aria-label="Reject Dr. Alan"
                  className="w-8 h-8 flex items-center justify-center bg-error/10 text-error rounded-lg hover:bg-error hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Success Log</h3>
            <span className="material-symbols-outlined text-outline">history</span>
          </div>
          <div className="divide-y divide-outline-variant/30 flex-1">
            <div className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">Emma Watson</p>
                <p className="text-[11px] text-on-surface-variant italic">2 Liters · AB+ Positive</p>
              </div>
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] rounded-full font-bold uppercase">
                Success
              </span>
            </div>
            <div className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  nephrology
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold">Liam Neeson</p>
                <p className="text-[11px] text-on-surface-variant italic">Renal Match · Hospital #03</p>
              </div>
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] rounded-full font-bold uppercase">
                Success
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
