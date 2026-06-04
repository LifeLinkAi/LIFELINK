'use client';

import React, { useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';

// Define the interface for our Donor data model
interface Donor {
  id: string;
  name: string;
  location: string;
  bloodType: string;
  tier: 'Gold' | 'Silver' | 'Platinum' | 'Bronze';
  status: 'Verified' | 'Pending' | 'Available' | 'Blocked';
  avatar: string;
  email: string;
  phone: string;
  lastDonation: string;
  totalDonated: string;
  details: string;
}

export default function DonorManagementPage() {
  // State for search query and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // State for slide-over side panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // State for interactive toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State for modal (e.g. Add Donor)
  const [isAddDonorOpen, setIsAddDonorOpen] = useState(false);

  // Real Database Donors State
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Donor Form Fields
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorEmail, setNewDonorEmail] = useState('');
  const [newDonorLocation, setNewDonorLocation] = useState('');
  const [newDonorPhone, setNewDonorPhone] = useState('');
  const [newDonorBlood, setNewDonorBlood] = useState('O-');
  const [newDonorTier, setNewDonorTier] = useState('Bronze');

  // Helper to show interactive toast notifications
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Donors from Database
  const fetchDonors = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/donors');
      setDonors(res.data);
    } catch (error) {
      console.error('Error fetching donors:', error);
      showToast('❌ Failed to load donors from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Compute stats based on real database records
  const stats = useMemo(() => {
    const total = donors.length;
    const verified = donors.filter(d => d.status === 'Verified').length;
    const pending = donors.filter(d => d.status === 'Pending').length;
    const available = donors.filter(d => d.status === 'Available').length;
    const blocked = donors.filter(d => d.status === 'Blocked').length;
    return { total, verified, pending, available, blocked };
  }, [donors]);

  // Filter donor list dynamically based on search query, blood group, and status filter
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = 
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBlood = bloodFilter === 'All' || donor.bloodType === bloodFilter;
      const matchesStatus = statusFilter === 'All' || donor.status === statusFilter;
      
      return matchesSearch && matchesBlood && matchesStatus;
    });
  }, [donors, searchQuery, bloodFilter, statusFilter]);

  // Open details slide panel
  const handleOpenPanel = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsPanelOpen(true);
  };

  // Set status filter and clear search when clicking stats bento cards for dashboard feeling
  const handleStatCardClick = (status: string) => {
    setStatusFilter(status);
    setSearchQuery('');
    showToast(`Filtering lists to: ${status === 'All' ? 'All Donors' : status}`);
  };

  // Submit hander for adding new donor to database
  const handleAddDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName || !newDonorEmail || !newDonorLocation) {
      showToast('❌ Name, email, and location are required.');
      return;
    }
    try {
      const payload = {
        name: newDonorName,
        email: newDonorEmail,
        bloodType: newDonorBlood,
        tier: newDonorTier,
        location: newDonorLocation,
        phone: newDonorPhone || '+1 (555) 0199',
        status: 'Pending',
        details: 'Registered donor. Verification and documentation pending review.',
      };
      const res = await api.post('/donors', payload);
      setDonors(prev => [res.data, ...prev]);
      setIsAddDonorOpen(false);
      // Reset inputs
      setNewDonorName('');
      setNewDonorEmail('');
      setNewDonorLocation('');
      setNewDonorPhone('');
      setNewDonorBlood('O-');
      setNewDonorTier('Bronze');
      showToast('🎉 Donor successfully registered in the database!');
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to register donor.';
      showToast(`❌ ${errMsg}`);
    }
  };

  // Update donor status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/donors/${id}`, { status: newStatus });
      setDonors(prev => prev.map(d => d.id === id ? res.data : d));
      setSelectedDonor(res.data);
      showToast(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to update donor status.');
    }
  };

  // Delete donor from database
  const handleDeleteDonor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    try {
      await api.delete(`/donors/${id}`);
      setDonors(prev => prev.filter(d => d.id !== id));
      setIsPanelOpen(false);
      setSelectedDonor(null);
      showToast('🗑️ Donor deleted successfully.');
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to delete donor.');
    }
  };


  return (
    <div className="space-y-lg pb-xxl w-full relative">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123e20] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-slide-in">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">info</span>
          <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sub-Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/30 pb-lg">
        <div>
          <p className="text-on-surface-variant font-body-md mt-1">
            Coordinate, filter, and review verified life-saving donors across the network.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => handleStatCardClick('All')}
            className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-primary rounded-xl font-label-caps text-[12px] bg-white transition-colors"
          >
            Reset Filters
          </button>
          <button 
            onClick={() => setIsAddDonorOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps text-[12px]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Donor
          </button>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Donors Card */}
        <div 
          onClick={() => handleStatCardClick('All')}
          className={`p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
            statusFilter === 'All' 
              ? 'bg-primary text-white ring-2 ring-primary/40 shadow-lg' 
              : 'bg-primary/90 text-white/90 hover:brightness-105'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="material-symbols-outlined text-white/80 text-3xl">groups</span>
          </div>
          <p className="font-body-sm text-body-sm text-white/80 mb-1">Total Donors</p>
          <h3 className="font-syne font-bold text-[32px] tracking-tight leading-none">{stats.total}</h3>
        </div>

        {/* Verified Card */}
        <div 
          onClick={() => handleStatCardClick('Verified')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Verified' 
              ? 'bg-white border-primary ring-2 ring-primary/20 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Verified</p>
          <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.verified}</h3>
        </div>

        {/* Pending Card */}
        <div 
          onClick={() => handleStatCardClick('Pending')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Pending' 
              ? 'bg-white border-yellow-600 ring-2 ring-yellow-200 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-yellow-600 text-3xl">hourglass_empty</span>
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Pending Review</p>
          <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.pending}</h3>
        </div>

        {/* Available Now Card (Pulsing live indicator) */}
        <div 
          onClick={() => handleStatCardClick('Available')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 relative ${
            statusFilter === 'Available' 
              ? 'bg-white border-secondary ring-2 ring-secondary/20 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <div className="relative w-1.5 h-1.5 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </div>
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Live</span>
          </div>
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary text-3xl text-green-700">emergency_home</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Available Now</p>
          <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.available}</h3>
        </div>

        {/* Blocked Card */}
        <div 
          onClick={() => handleStatCardClick('Blocked')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Blocked' 
              ? 'bg-white border-red-600 ring-2 ring-red-200 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">block</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Ineligible / Blocked</p>
          <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.blocked}</h3>
        </div>
      </div>

      {/* Main Data Section (Table and filters) */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col min-h-[500px] shadow-sm">
        {/* Filter Bar */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-bright/50">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F1E8]/50 focus:bg-white rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all placeholder:text-on-surface-variant/60"
              placeholder="Search donors by name, ID, or location..."
              type="text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Blood Type Selection Dropdown */}
            <select 
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">Blood Group (All)</option>
              <option value="O-">O-Negative (O-)</option>
              <option value="O+">O-Positive (O+)</option>
              <option value="A+">A-Positive (A+)</option>
              <option value="A-">A-Negative (A-)</option>
              <option value="B+">B-Positive (B+)</option>
              <option value="B-">B-Negative (B-)</option>
              <option value="AB-">AB-Negative (AB-)</option>
              <option value="AB+">AB-Positive (AB+)</option>
            </select>

            {/* Status Selection Dropdown */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">Status (All)</option>
              <option value="Verified">Verified</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>

            <button 
              onClick={() => {
                setSearchQuery('');
                setBloodFilter('All');
                setStatusFilter('All');
                showToast('Filters cleared');
              }}
              aria-label="Clear Filters"
              className="h-10 w-10 flex items-center justify-center border border-outline-variant/50 rounded-xl text-on-surface-variant hover:bg-neutral-50 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list_off</span>
            </button>
          </div>
        </div>

        {/* Donors Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#EFF2EE] text-on-surface z-10 border-b border-outline-variant/30">
              <tr>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase tracking-wider">Donor Info</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase tracking-wider">Blood Type</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase tracking-wider">Tier</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase tracking-wider">Status</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredDonors.length > 0 ? (
                filteredDonors.map((donor) => (
                  <tr 
                    key={donor.id} 
                    onClick={() => handleOpenPanel(donor)}
                    className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                  >
                    {/* Donor Avatar, Name, Location */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          alt={`${donor.name} avatar`}
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-sm"
                          src={donor.avatar}
                        />
                        <div>
                          <p className="font-syne text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors">{donor.name}</p>
                          <p className="text-xs text-on-surface-variant">ID: {donor.id} • {donor.location}</p>
                        </div>
                      </div>
                    </td>

                    {/* Blood Type Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-primary text-white rounded-lg font-bold text-xs min-w-[32px] shadow-sm">
                        {donor.bloodType}
                      </span>
                    </td>

                    {/* Donor Tier Badge */}
                    <td className="py-4 px-6">
                      {donor.tier === 'Platinum' && (
                        <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg w-max border border-purple-200 shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-purple-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Platinum</span>
                        </div>
                      )}
                      {donor.tier === 'Gold' && (
                        <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg w-max border border-amber-200 shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Gold</span>
                        </div>
                      )}
                      {donor.tier === 'Silver' && (
                        <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg w-max border border-slate-200 shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-slate-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Silver</span>
                        </div>
                      )}
                      {donor.tier === 'Bronze' && (
                        <div className="flex items-center gap-1 text-amber-800 bg-amber-50/50 px-2.5 py-1 rounded-lg w-max border border-amber-200/50 shadow-sm">
                          <span className="material-symbols-outlined text-[16px] text-amber-700" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Bronze</span>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {donor.status === 'Verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Verified
                        </span>
                      )}
                      {donor.status === 'Available' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Available
                        </span>
                      )}
                      {donor.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          Pending
                        </span>
                      )}
                      {donor.status === 'Blocked' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Blocked
                        </span>
                      )}
                    </td>

                    {/* Actions Button */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          setSelectedDonor(donor);
                          setIsPanelOpen(true);
                        }}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-neutral-100"
                        aria-label="View Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant font-dmsans">
                    <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">person_search</span>
                    No donors found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Slide-Over Drawer Details Panel */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsPanelOpen(false)}
      />
      
      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDonor && (
          <>
            {/* Panel Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div>
                <h3 className="font-syne font-bold text-lg text-primary">Donor Profile Details</h3>
                <p className="text-xs text-on-surface-variant">System File: {selectedDonor.id}</p>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsPanelOpen(false)}
                aria-label="Close details"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Panel Scrollable Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              {/* Profile Card Intro */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/20">
                <img 
                  alt={selectedDonor.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-3"
                  src={selectedDonor.avatar}
                />
                <h4 className="font-syne font-bold text-xl text-on-surface">{selectedDonor.name}</h4>
                <p className="text-sm text-on-surface-variant mb-3 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  {selectedDonor.location}
                </p>

                {/* Badges Inline Row */}
                <div className="flex gap-2 flex-wrap justify-center mt-1">
                  <span className="inline-flex items-center justify-center px-3 py-1 bg-primary text-white rounded-lg font-bold text-xs shadow-sm">
                    Blood Group: {selectedDonor.bloodType}
                  </span>
                  
                  {selectedDonor.status === 'Verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      Verified
                    </span>
                  )}
                  {selectedDonor.status === 'Available' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  )}
                  {selectedDonor.status === 'Pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                      Pending Review
                    </span>
                  )}
                  {selectedDonor.status === 'Blocked' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Bio & Details Notes */}
              <div className="space-y-sm">
                <h5 className="font-syne font-bold text-sm text-primary uppercase tracking-wider">Clinical Notes & Summary</h5>
                <p className="text-sm text-on-surface-variant bg-[#EFF2EE]/50 p-4 rounded-xl border border-outline-variant/20 italic">
                  &ldquo;{selectedDonor.details}&rdquo;
                </p>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Donor Tier</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">workspace_premium</span>
                    {selectedDonor.tier}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Donated</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">volunteer_activism</span>
                    {selectedDonor.totalDonated}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 col-span-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Last Donation Date</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                    {selectedDonor.lastDonation === 'N/A' ? 'No donations logged yet' : selectedDonor.lastDonation}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-sm border-t border-outline-variant/20 pt-6">
                <h5 className="font-syne font-bold text-sm text-primary uppercase tracking-wider">Contact Information</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
                    <a href={`mailto:${selectedDonor.email}`} className="text-sm text-primary hover:underline font-dmsans">{selectedDonor.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
                    <span className="text-sm font-dmsans text-on-surface">{selectedDonor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Operations Area */}
              <div className="space-y-3 border-t border-outline-variant/20 pt-6">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Modify Account Status</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedDonor.id, 'Verified')}
                    className="flex-1 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-syne font-bold text-xs shadow-sm transition-colors text-center"
                  >
                    Verify
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedDonor.id, 'Available')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-syne font-bold text-xs shadow-sm transition-colors text-center"
                  >
                    Set Available
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedDonor.id, 'Blocked')}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-syne font-bold text-xs shadow-sm transition-colors text-center"
                  >
                    Block
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteDonor(selectedDonor.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-syne font-bold text-sm shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete Donor Profile
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Add Donor Mock Dialog Modal */}
      {isAddDonorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#121c2a]/40 backdrop-blur-sm"
            onClick={() => setIsAddDonorOpen(false)}
          />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full z-10 border border-outline-variant/30 shadow-2xl relative animate-scale-in">
            <h3 className="font-syne font-bold text-xl text-primary mb-2">Register New Donor</h3>
            <p className="text-xs text-on-surface-variant mb-4">Input donor credentials to register them on the coordination matrix.</p>
            
            <form onSubmit={handleAddDonorSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                <input 
                  type="text" 
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  placeholder="e.g. Liam Neeson" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Blood Group</label>
                  <select 
                    value={newDonorBlood}
                    onChange={(e) => setNewDonorBlood(e.target.value)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option value="O-">O-</option>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tier Level</label>
                  <select 
                    value={newDonorTier}
                    onChange={(e) => setNewDonorTier(e.target.value)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Location (City, State)</label>
                <input 
                  type="text" 
                  value={newDonorLocation}
                  onChange={(e) => setNewDonorLocation(e.target.value)}
                  placeholder="e.g. New York, NY" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                <input 
                  type="email" 
                  value={newDonorEmail}
                  onChange={(e) => setNewDonorEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  value={newDonorPhone}
                  onChange={(e) => setNewDonorPhone(e.target.value)}
                  placeholder="+1 (555) 0199" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddDonorOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
