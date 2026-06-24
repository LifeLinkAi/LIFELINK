'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'weekly' | 'monthly'>('today');

  // Database States
  const [requests, setRequests] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Requests
      const reqRes = await api.get('/requests');
      const reqList = Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []);
      setRequests(reqList);

      // 2. Fetch Donors
      const donorRes = await api.get('/donors');
      const donorList = Array.isArray(donorRes.data) ? donorRes.data : (donorRes.data?.data || []);
      setDonors(donorList);

      // 3. Fetch Hospitals
      const hospRes = await api.get('/hospitals');
      const hospList = Array.isArray(hospRes.data) ? hospRes.data : (hospRes.data?.data || []);
      setHospitals(hospList);

      // 4. Fetch Users
      const userRes = await api.get('/auth/users');
      const userList = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
      setUsers(userList);

      // 5. Fetch Donations
      const donationRes = await api.get('/donations');
      const donationList = Array.isArray(donationRes.data) ? donationRes.data : (donationRes.data?.data || []);
      setDonations(donationList);

    } catch (error) {
      console.error(error);
      showToast('❌ Failed to fetch dashboard data from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Approvals & Rejections Action Handlers
  const handleApprove = async (item: { id: string; role: string; name: string }) => {
    try {
      if (item.role === 'Hospital') {
        await api.put(`/hospitals/${item.id}`, { status: 'Verified' });
      } else {
        await api.put(`/donors/${item.id}`, { status: 'Available' });
      }
      showToast(`Successfully verified ${item.role}: ${item.name}`);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to approve verification.');
    }
  };

  const handleReject = async (item: { id: string; role: string; name: string }) => {
    try {
      if (item.role === 'Hospital') {
        await api.put(`/hospitals/${item.id}`, { status: 'Suspended' });
      } else {
        await api.put(`/donors/${item.id}`, { status: 'Blocked' });
      }
      showToast(`Rejected/Suspended ${item.role}: ${item.name}`);
      fetchData();
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to reject verification.');
    }
  };

  // Derive display values from real database records
  const totalUsers = useMemo(() => {
    return users.length;
  }, [users]);

  const monthlyDonationsChartPaths = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bloodCounts = [0, 0, 0, 0, 0];
    const organCounts = [0, 0, 0, 0, 0];

    donations.forEach(d => {
      const date = new Date(d.donationDate || d.createdAt);
      if (date >= thirtyDaysAgo) {
        const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
        const bucketIndex = Math.max(0, Math.min(4, 4 - Math.floor(diffDays / 6)));
        if (d.donationType === 'Blood') {
          bloodCounts[bucketIndex] += d.volumeMl > 0 ? Math.round(d.volumeMl / 450) : 1;
        } else if (d.donationType === 'Organ') {
          organCounts[bucketIndex]++;
        }
      }
    });

    const maxVal = Math.max(1, ...bloodCounts, ...organCounts);
    const bloodY = bloodCounts.map(count => 90 - (count / maxVal) * 80);
    const organY = organCounts.map(count => 90 - (count / maxVal) * 80);

    const bloodPath = `M0,${bloodY[0]} L100,${bloodY[1]} L200,${bloodY[2]} L300,${bloodY[3]} L400,${bloodY[4]}`;
    const organPath = `M0,${organY[0]} L100,${organY[1]} L200,${organY[2]} L300,${organY[3]} L400,${organY[4]}`;

    return { bloodPath, organPath };
  }, [donations]);

  const activeDonorsCount = useMemo(() => {
    return donors.length;
  }, [donors]);

  const activeEmergenciesCount = useMemo(() => {
    return requests.filter(r => r.type === 'Blood' && r.urgency === 'Critical' && r.status !== 'FULFILLED').length;
  }, [requests]);

  const pendingVerificationsCount = useMemo(() => {
    // Include pending waitlist patients, pending hospitals, pending donors
    const pendingRequests = requests.filter(r => ['Pending', 'Verification', 'Waitlisted'].includes(r.status)).length;
    const pendingHosp = hospitals.filter(h => h.status === 'Pending').length;
    const pendingDon = donors.filter(d => d.status === 'Verification' || d.status === 'Pending').length;
    return pendingRequests + pendingHosp + pendingDon;
  }, [requests, hospitals, donors]);

  const hospitalsCount = useMemo(() => {
    return hospitals.length;
  }, [hospitals]);

  const bloodRequestsCount = useMemo(() => {
    return requests.filter(r => r.type === 'Blood').length;
  }, [requests]);

  const organRequestsCount = useMemo(() => {
    return requests.filter(r => r.type === 'Organ').length;
  }, [requests]);

  // Aggregate blood stock
  const bloodStockAgg = useMemo(() => {
    const stock: Record<string, { units: number; max: number }> = {
      'A+': { units: 0, max: 0 },
      'A-': { units: 0, max: 0 },
      'B+': { units: 0, max: 0 },
      'B-': { units: 0, max: 0 },
      'AB+': { units: 0, max: 0 },
      'AB-': { units: 0, max: 0 },
      'O+': { units: 0, max: 0 },
      'O-': { units: 0, max: 0 },
    };

    hospitals.forEach((h: any) => {
      if (h.bloodInventory && Array.isArray(h.bloodInventory)) {
        h.bloodInventory.forEach((item: any) => {
          const bg = item.bloodGroup;
          if (stock[bg]) {
            stock[bg].units += item.units || 0;
            stock[bg].max += item.maxCapacity || 100;
          }
        });
      }
    });

    return stock;
  }, [hospitals]);

  const getFullName = (g: string) => {
    if (g.endsWith('+')) return `${g.replace('+', '')}+ POSITIVE`;
    if (g.endsWith('-')) return `${g.replace('-', '')}- NEGATIVE`;
    return g;
  };

  // Recent Emergencies list
  const recentEmergenciesList = useMemo(() => {
    return requests
      .filter(r => r.type === 'Blood')
      .slice(0, 5)
      .map(r => {
        const maskName = (name?: string) => {
          if (!name) return 'Anonymous Recipient';
          return name.split(' ').map(part => part[0] + '*'.repeat(Math.max(0, part.length - 1))).join(' ');
        };
        return {
          id: r.id || r._id,
          patientName: maskName(r.patientName),
          urgency: r.urgency,
          timeAgo: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'
        };
      });
  }, [requests]);

  // Pending reviews combined list
  const pendingReviewsList = useMemo(() => {
    const pendingHosp = hospitals.filter(h => h.status === 'Pending').map(h => ({
      id: h.id,
      name: h.name,
      role: 'Hospital',
      details: h.city || 'Government Registry Verification'
    }));
    const pendingDon = donors.filter(d => d.status === 'Verification' || d.status === 'Pending').map(d => ({
      id: d.id,
      name: d.donorName,
      role: 'Donor',
      details: `${d.organType} Donor`
    }));
    return [...pendingHosp, ...pendingDon].slice(0, 5);
  }, [hospitals, donors]);

  // Success completed requests log
  const successLogList = useMemo(() => {
    return requests
      .filter(r => r.status === 'Completed' || r.status === 'FULFILLED')
      .slice(0, 5)
      .map(r => {
        return {
          id: r.id || r._id,
          name: r.patientName || 'Anonymous Patient',
          details: r.type === 'Blood' ? `Blood Match • ${r.bloodGroup}` : `${r.organType} Match • ${r.facility || 'Coordinating Hub'}`
        };
      });
  }, [requests]);

  return (
    <div className="space-y-lg pb-xxl w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3e5219] text-white px-lg py-md rounded-xl shadow-2xl flex items-center gap-md border border-[#c8f17a]/30 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#c8f17a]">check_circle</span>
          <span className="font-body-md font-medium">{toastMessage}</span>
        </div>
      )}

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
          <h3 className="font-headline-md text-headline-md font-bold">{activeEmergenciesCount} Critical {activeEmergenciesCount === 1 ? 'Emergency' : 'Emergencies'}</h3>
          <p className="opacity-90 font-body-md">
            Requires dispatcher allocation for active emergency requests in the network.
          </p>
        </div>
        <button 
          onClick={() => {
            window.location.href = '/admin/organ-requests';
          }}
          className="px-6 py-3 bg-white text-error font-bold rounded-xl shadow-sm hover:bg-neutral-50 transition-colors whitespace-nowrap"
        >
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
            <h4 className="font-display-lg text-[32px] text-primary">{totalUsers}</h4>
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
            <h4 className="font-display-lg text-[32px] text-primary">{activeDonorsCount}</h4>
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
            <h4 className="font-display-lg text-[32px] text-white">{activeEmergenciesCount}</h4>
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
            <h4 className="font-display-lg text-[32px] text-primary">{pendingVerificationsCount}</h4>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md bg-surface-container/30 p-md rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Hospitals</p>
            <p className="font-headline-sm text-headline-sm">{hospitalsCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-l border-outline-variant/50">
          <div className="w-2 h-2 rounded-full bg-error"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Blood Requests</p>
            <p className="font-headline-sm text-headline-sm">{bloodRequestsCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-l border-outline-variant/50">
          <div className="w-2 h-2 rounded-full bg-primary-container"></div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">Organ Requests</p>
            <p className="font-headline-sm text-headline-sm">{organRequestsCount}</p>
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
                <path d={monthlyDonationsChartPaths.bloodPath} fill="none" stroke="#ba1a1a" strokeWidth="3"></path>
                <path d={monthlyDonationsChartPaths.organPath} fill="none" stroke="#556b2f" strokeWidth="3"></path>
              </svg>
            </div>
            {/* X-Axis Labels */}
            <div className="w-full flex justify-between pt-4 border-t border-outline-variant/30 mt-auto">
              <span className="text-[10px] font-bold text-outline">30d ago</span>
              <span className="text-[10px] font-bold text-outline">22d ago</span>
              <span className="text-[10px] font-bold text-outline">15d ago</span>
              <span className="text-[10px] font-bold text-outline">8d ago</span>
              <span className="text-[10px] font-bold text-outline">Today</span>
            </div>
          </div>
        </div>

        {/* Blood Stock Overview */}
        <div className="glass-card rounded-xl p-lg space-y-md">
          <h3 className="font-headline-md text-headline-md text-primary">Blood Stock</h3>
          <div className="space-y-4">
            {Object.entries(bloodStockAgg).slice(0, 5).map(([group, data]) => {
              const percentage = data.max > 0 ? Math.round((data.units / data.max) * 100) : 0;
              const status = percentage <= 15 ? 'Critical' : (percentage <= 35 ? 'Low' : (percentage >= 80 ? 'Optimal' : 'Stable'));
              const statusColor = status === 'Critical' || status === 'Low' ? 'text-error' : (status === 'Optimal' ? 'text-secondary' : 'text-on-surface-variant');
              return (
                <div key={group} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold uppercase font-dmsans">
                    <span>{getFullName(group)}</span>
                    <span className={`${statusColor} font-bold`}>{status} ({data.units} Units)</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${status === 'Critical' ? 'bg-[#ba1a1a]' : (status === 'Optimal' ? 'bg-[#556b2f]' : 'bg-[#3e5219]')}`} style={{ width: `${Math.max(8, percentage)}%` }}></div>
                  </div>
                </div>
              );
            })}
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
            {recentEmergenciesList.length === 0 ? (
              <p className="p-md text-xs text-on-surface-variant text-center">No recent emergency transport requests.</p>
            ) : (
              recentEmergenciesList.map((item) => (
                <div key={item.id} className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
                  <div className="w-10 h-10 bg-error-container rounded-lg flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">ambulance</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold">{item.patientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-error/10 text-error text-[10px] rounded font-bold uppercase">{item.urgency}</span>
                      <span className="text-[11px] text-on-surface-variant italic">{item.timeAgo}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Pending Reviews</h3>
            <span className="text-secondary font-bold text-[12px]">{pendingReviewsList.length} New</span>
          </div>
          <div className="divide-y divide-outline-variant/30 flex-1">
            {pendingReviewsList.length === 0 ? (
              <p className="p-md text-xs text-on-surface-variant text-center">No pending verifications or reviews.</p>
            ) : (
              pendingReviewsList.map((item) => (
                <div key={item.id} className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
                  <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">assignment_ind</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate">{item.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.role} · {item.details}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(item);
                      }}
                      aria-label={`Approve ${item.name}`}
                      className="w-8 h-8 flex items-center justify-center bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(item);
                      }}
                      aria-label={`Reject ${item.name}`}
                      className="w-8 h-8 flex items-center justify-center bg-error/10 text-error rounded-lg hover:bg-error hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Success Log</h3>
            <span className="material-symbols-outlined text-outline">history</span>
          </div>
          <div className="divide-y divide-outline-variant/30 flex-1">
            {successLogList.length === 0 ? (
              <p className="p-md text-xs text-on-surface-variant text-center">No successful matches logged yet.</p>
            ) : (
              successLogList.map((item) => (
                <div key={item.id} className="p-md hover:bg-white/40 transition-colors flex items-center gap-md">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold">{item.name}</p>
                    <p className="text-[11px] text-on-surface-variant italic">{item.details}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] rounded-full font-bold uppercase">
                    Success
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
