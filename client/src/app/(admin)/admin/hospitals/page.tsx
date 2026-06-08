'use client';

import React, { useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';

// Define Interface for Hospital
interface Hospital {
  id: string;
  licenseId: string;
  name: string;
  city: string;
  location: string;
  logo: string;
  specialties: string[];
  status: 'Verified' | 'Pending' | 'Active' | 'Suspended';
  patientCount: number;
  rating: number | string;
  bloodHealthLevels: number[]; // represents level heights for the bar chart
  bloodHealthStatus: 'Critical' | 'Stable' | 'Optimal';
  bloodStock: {
    [key: string]: number;
  };
  documents: {
    name: string;
    image: string;
  }[];
  recentActivity: {
    title: string;
    description: string;
    time: string;
    type: 'admission' | 'blood' | 'dispatch' | 'other';
  }[];
  governmentLicenseId?: string;
  hospitalLicenseUrl?: string;
  kidneyTransplantLicenseUrl?: string;
  liverTransplantLicenseUrl?: string;
  heartTransplantLicenseUrl?: string;
  lungTransplantLicenseUrl?: string;
  contactPerson?: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  phone?: string;
  website?: string;
  isSetupComplete?: boolean;
}

export default function HospitalManagementPage() {
  // Page states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [bloodHealthFilter, setBloodHealthFilter] = useState('All');

  // Checkbox Selection
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  
  // Side drawer panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Modals & Toasts
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real Database State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields State
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalLicense, setNewHospitalLicense] = useState('');
  const [newHospitalCity, setNewHospitalCity] = useState('San Francisco');
  const [newHospitalSpecialties, setNewHospitalSpecialties] = useState('');
  const [newHospitalEmail, setNewHospitalEmail] = useState('');

  // Helper to show interactive toast notifications
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Hospitals from Database
  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/hospitals');
      const mapped: Hospital[] = res.data.map((h: any) => ({
        id: h.id,
        licenseId: h.licenseId || 'LIC-UNKNOWN',
        name: h.name,
        city: h.city || 'San Francisco',
        location: h.location || h.city || 'San Francisco, CA',
        logo: h.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(h.name)}`,
        specialties: h.specialties || ['General'],
        status: h.status || 'Pending',
        patientCount: h.patientCount || 0,
        rating: h.rating || '--',
        bloodHealthLevels: h.bloodHealthLevels || [60, 40, 80, 50],
        bloodHealthStatus: h.bloodHealthStatus || 'Stable',
        bloodStock: h.bloodStock || {
          'A+': 120, 'A-': 40, 'B+': 32, 'B-': 18,
          'O+': 200, 'O-': 12, 'AB+': 45, 'AB-': 10
        },
        documents: h.documents || [
          { name: 'State License 2024', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW' }
        ],
        recentActivity: h.recentActivity || [
          { title: 'Facility Synchronized', description: 'Central registry connection verified', time: 'Just now', type: 'other' }
        ],
        governmentLicenseId: h.governmentLicenseId || '',
        hospitalLicenseUrl: h.hospitalLicenseUrl || '',
        kidneyTransplantLicenseUrl: h.kidneyTransplantLicenseUrl || '',
        liverTransplantLicenseUrl: h.liverTransplantLicenseUrl || '',
        heartTransplantLicenseUrl: h.heartTransplantLicenseUrl || '',
        lungTransplantLicenseUrl: h.lungTransplantLicenseUrl || '',
        contactPerson: h.contactPerson || { name: '', designation: '', email: '', phone: '' },
        phone: h.phone || '',
        website: h.website || '',
        isSetupComplete: h.isSetupComplete || false
      }));
      setHospitals(mapped);
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to fetch hospitals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Compute stats based on real database records
  const stats = useMemo(() => {
    const total = hospitals.length;
    const verified = hospitals.filter(h => h.status === 'Verified').length;
    const pending = hospitals.filter(h => h.status === 'Pending').length;
    const active = hospitals.filter(h => h.status === 'Active').length;
    const suspended = hospitals.filter(h => h.status === 'Suspended').length;
    return { total, verified, pending, active, suspended };
  }, [hospitals]);

  // Submit handler for registering a new hospital
  const handleAddHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalName || !newHospitalEmail) {
      showToast('❌ Hospital Name and Email are required.');
      return;
    }
    try {
      const payload = {
        name: newHospitalName,
        email: newHospitalEmail,
      };
      const res = await api.post('/hospitals', payload);
      
      // Map return value
      const newHosp: Hospital = {
        id: res.data.id,
        licenseId: res.data.licenseId || 'LIC-PENDING',
        name: res.data.name,
        city: res.data.city || 'Pending Setup',
        location: res.data.location || 'Pending Setup',
        logo: res.data.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.data.name)}`,
        specialties: res.data.specialties || ['General'],
        status: res.data.status || 'Pending',
        patientCount: 0,
        rating: '--',
        bloodHealthLevels: [60, 40, 80, 50],
        bloodHealthStatus: 'Stable',
        bloodStock: {
          'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
          'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0
        },
        documents: [],
        recentActivity: [
          { title: 'Facility Invited', description: 'Institutional activation email sent', time: 'Just now', type: 'other' }
        ]
      };
      
      setHospitals(prev => [newHosp, ...prev]);
      setIsAddHospitalOpen(false);
      
      // Reset form
      setNewHospitalName('');
      setNewHospitalEmail('');
      showToast('🎉 Facility registered successfully!');
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to register facility.';
      showToast(`❌ ${errMsg}`);
    }
  };

  // Update Hospital Status (Verify / Suspend)
  const handleUpdateHospitalStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/hospitals/${id}`, { status: newStatus });
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: res.data.status } : h));
      if (selectedHospital && selectedHospital.id === id) {
        setSelectedHospital(prev => prev ? { ...prev, status: res.data.status } : null);
      }
      showToast(`Facility status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to update facility status.');
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility? This will remove its account from the network.')) return;
    try {
      await api.delete(`/hospitals/${id}`);
      setHospitals(prev => prev.filter(h => h.id !== id));
      setIsPanelOpen(false);
      setSelectedHospital(null);
      showToast('🗑️ Facility deleted successfully.');
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to delete facility.');
    }
  };

  // Filter logic
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => {
      const matchesSearch = 
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.licenseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || hospital.status === statusFilter;
      const matchesCity = cityFilter === 'All' || hospital.city === cityFilter;
      const matchesBloodHealth = bloodHealthFilter === 'All' || hospital.bloodHealthStatus === bloodHealthFilter;
      
      const matchesSpecialty = 
        specialtyFilter === 'All' || 
        hospital.specialties.includes(specialtyFilter);

      return matchesSearch && matchesStatus && matchesCity && matchesSpecialty && matchesBloodHealth;
    });
  }, [hospitals, searchQuery, statusFilter, cityFilter, specialtyFilter, bloodHealthFilter]);

  // Handle stats card click to set category filters
  const handleStatCardClick = (status: string) => {
    setStatusFilter(status);
    setSearchQuery('');
    showToast(`Filtering lists to: ${status === 'All' ? 'All Hospitals' : status}`);
  };

  // Handle multi-checkbox selection
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedHospitals(filteredHospitals.map(h => h.id));
    } else {
      setSelectedHospitals([]);
    }
  };

  const handleToggleSelectHospital = (id: string) => {
    if (selectedHospitals.includes(id)) {
      setSelectedHospitals(selectedHospitals.filter(hId => hId !== id));
    } else {
      setSelectedHospitals([...selectedHospitals, id]);
    }
  };

  // Open side drawer panel
  const handleOpenPanel = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsPanelOpen(true);
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
            Verify, monitor, and manage every hospital in the LifeLink network.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => {
              setStatusFilter('All');
              setCityFilter('All');
              setSpecialtyFilter('All');
              setBloodHealthFilter('All');
              setSearchQuery('');
              setSelectedHospitals([]);
              showToast('Filters cleared');
            }}
            className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-primary rounded-xl font-label-caps text-[12px] bg-white transition-colors"
          >
            Reset Filters
          </button>
          <button 
            onClick={() => showToast('Data export initiated...')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-outline-variant/50 text-primary hover:bg-neutral-50 rounded-xl font-label-caps text-[12px] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button 
            onClick={() => setIsAddHospitalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps text-[12px]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Hospital
          </button>
        </div>
      </div>

      {/* Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Hospitals Card */}
        <div 
          onClick={() => handleStatCardClick('All')}
          className={`p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
            statusFilter === 'All' 
              ? 'bg-primary text-white ring-2 ring-primary/40 shadow-lg' 
              : 'bg-primary/95 text-white/95 hover:brightness-105'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="material-symbols-outlined text-white/80 text-3xl">local_hospital</span>
          </div>
          <p className="font-body-sm text-body-sm text-white/80 mb-1">Total Hospitals</p>
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
            <p className="font-body-sm text-body-sm text-on-surface-variant">Verified</p>
          </div>
          <div className="flex items-center justify-between mt-sm">
            <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.verified}</h3>
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(18,62,32,0.4)]"></div>
          </div>
        </div>

        {/* Pending Approval Card */}
        <div 
          onClick={() => handleStatCardClick('Pending')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Pending' 
              ? 'bg-white border-yellow-600 ring-2 ring-yellow-200 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Pending Approval</p>
          </div>
          <div className="flex items-center justify-between mt-sm">
            <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.pending}</h3>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
          </div>
        </div>

        {/* Active Today Card */}
        <div 
          onClick={() => handleStatCardClick('Active')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 relative ${
            statusFilter === 'Active' 
              ? 'bg-white border-secondary ring-2 ring-secondary/20 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Active Today</p>
          </div>
          <div className="flex items-center justify-between mt-sm">
            <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.active}</h3>
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-wider animate-pulse">Live</span>
          </div>
        </div>

        {/* Suspended Card */}
        <div 
          onClick={() => handleStatCardClick('Suspended')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Suspended' 
              ? 'bg-white border-red-600 ring-2 ring-red-200 shadow-md' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Suspended</p>
          </div>
          <div className="flex items-center justify-between mt-sm">
            <h3 className="font-syne font-bold text-[28px] text-on-surface leading-none">{stats.suspended}</h3>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Pills Row */}
      <div className="flex flex-wrap items-center gap-sm bg-surface-container/30 p-md rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-xs px-4 py-2 bg-white rounded-full border border-outline-variant/30 shadow-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">bloodtype</span>
          <span className="text-xs font-semibold text-on-surface">Blood Stock: <span className="text-primary font-bold">18,420 Units</span></span>
        </div>
        <div className="flex items-center gap-xs px-4 py-2 bg-white rounded-full border border-outline-variant/30 shadow-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">patient_list</span>
          <span className="text-xs font-semibold text-on-surface">Patients: <span className="text-primary font-bold">1,847</span></span>
        </div>
        <div className="flex items-center gap-xs px-4 py-2 bg-white rounded-full border border-outline-variant/30 shadow-sm">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">timer</span>
          <span className="text-xs font-semibold text-on-surface">Avg Response Time: <span className="text-primary font-bold">8.4 min</span></span>
        </div>
      </div>

      {/* Main Table view & filtering */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
        {/* Filter Bar */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col lg:flex-row gap-4 items-center justify-between bg-surface-bright/50">
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F1E8]/50 focus:bg-white rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all placeholder:text-on-surface-variant/60"
              placeholder="Search by name, ID, or license number..."
              type="text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Select */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">Status (All)</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* City Select */}
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">City (All)</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Oakland">Oakland</option>
              <option value="San Jose">San Jose</option>
              <option value="Sacramento">Sacramento</option>
            </select>

            {/* Specialty Select */}
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">Specialty (All)</option>
              <option value="ER">Emergency Room (ER)</option>
              <option value="Trauma">Trauma Unit</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="General">General Practice</option>
            </select>

            {/* Blood Health Select */}
            <select 
              value={bloodHealthFilter}
              onChange={(e) => setBloodHealthFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
            >
              <option value="All">Blood Health (All)</option>
              <option value="Optimal">Optimal</option>
              <option value="Stable">Stable</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EFF2EE] text-on-surface border-b border-outline-variant/30">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleToggleSelectAll}
                    checked={filteredHospitals.length > 0 && selectedHospitals.length === filteredHospitals.length}
                    className="rounded text-primary focus:ring-primary h-4 w-4 border-outline-variant cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Specialties</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Blood Health</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital) => (
                  <tr 
                    key={hospital.id} 
                    onClick={() => handleOpenPanel(hospital)}
                    className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                  >
                    {/* Checkbox select */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        onChange={() => handleToggleSelectHospital(hospital.id)}
                        checked={selectedHospitals.includes(hospital.id)}
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-outline-variant cursor-pointer"
                      />
                    </td>

                    {/* Hospital details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-outline-variant/30 flex items-center justify-center shadow-sm shrink-0">
                          <img className="w-full h-full object-cover" src={hospital.logo} alt={`${hospital.name} Logo`} />
                        </div>
                        <div>
                          <div className="font-syne font-bold text-[15px] text-on-surface group-hover:text-primary transition-colors">{hospital.name}</div>
                          <div className="text-xs text-on-surface-variant">{hospital.licenseId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Address / Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        {hospital.location}
                      </div>
                    </td>

                    {/* Specialties */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {hospital.specialties.map(spec => (
                          <span 
                            key={spec}
                            className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {hospital.status === 'Verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified
                        </span>
                      )}
                      {hospital.status === 'Active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      )}
                      {hospital.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
                        </span>
                      )}
                      {hospital.status === 'Suspended' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspended
                        </span>
                      )}
                    </td>

                    {/* Blood Health Indicator Bar Chart */}
                    <td className="px-6 py-4">
                      <div className="flex items-end gap-1 h-8">
                        {hospital.bloodHealthLevels.map((val, idx) => (
                          <div 
                            key={idx}
                            style={{ height: `${val}%` }}
                            className={`w-1.5 rounded-t-sm ${
                              hospital.status === 'Suspended' || val < 30 ? 'bg-red-500' : 'bg-primary'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Patients/Rating Summary */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs text-on-surface">
                        <div className="flex justify-between gap-md">
                          <span className="text-on-surface-variant">Patients:</span> 
                          <span className="font-bold">{hospital.patientCount}</span>
                        </div>
                        <div className="flex justify-between gap-md">
                          <span className="text-on-surface-variant">Rating:</span> 
                          <span className="font-bold">{hospital.rating}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions Button */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleOpenPanel(hospital)}
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
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant font-dmsans">
                    <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">domain_disabled</span>
                    No hospitals found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/30 bg-surface-bright/30">
          <span className="text-xs text-on-surface-variant">
            Showing 1-{filteredHospitals.length} of {filteredHospitals.length} hospitals
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-7 h-7 rounded bg-primary text-white font-bold text-xs">1</button>
            <button className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Side Drawer Panel */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsPanelOpen(false)}
      />

      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedHospital && (
          <>
            {/* Panel Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-outline-variant/30 flex items-center justify-center shadow-sm shrink-0">
                  <img className="w-full h-full object-cover" src={selectedHospital.logo} alt={`${selectedHospital.name} Logo`} />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-base text-primary leading-tight">{selectedHospital.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{selectedHospital.city} • Registry: {selectedHospital.id}</p>
                </div>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsPanelOpen(false)}
                aria-label="Close details"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              {/* Blood Stock Units */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Blood Stock Units</h4>
                <div className="grid grid-cols-4 gap-sm">
                  {Object.entries(selectedHospital.bloodStock).map(([group, units]) => {
                    const isCritical = units <= 15;
                    return (
                      <div 
                        key={group}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCritical 
                            ? 'bg-red-50/50 border-red-200 text-red-700 shadow-sm' 
                            : 'bg-white border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <span className={`block font-bold text-sm ${isCritical ? 'text-red-600' : 'text-primary'}`}>
                          {group}
                        </span>
                        <span className="block text-xs font-semibold text-on-surface-variant mt-0.5">
                          {units}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Onboarding & Verification Audit */}
              <div className="space-y-md pt-4 border-t border-outline-variant/20">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Verification Audit Profile</h4>
                
                {!selectedHospital.isSetupComplete ? (
                  <div className="p-4 bg-amber-50/60 border border-amber-200/50 text-amber-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                      Setup Incomplete
                    </div>
                    <p className="text-[11px] text-amber-700/95 leading-relaxed">
                      This facility node was registered by the admin but has not yet completed the first-login Setup Wizard. Awaiting document submissions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* General Metadata */}
                    <div className="grid grid-cols-2 gap-3 bg-neutral-50/50 p-3 rounded-xl border border-outline-variant/20">
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Govt License ID</span>
                        <span className="block text-xs font-semibold text-gray-700">{selectedHospital.governmentLicenseId || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Direct Phone</span>
                        <span className="block text-xs font-semibold text-gray-700">{selectedHospital.phone || 'Not provided'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Official Website</span>
                        {selectedHospital.website ? (
                          <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            {selectedHospital.website}
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        ) : (
                          <span className="block text-xs font-semibold text-gray-700">Not provided</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Person Details */}
                    {selectedHospital.contactPerson && (
                      <div className="p-3 bg-neutral-50/50 rounded-xl border border-outline-variant/20 space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Primary Contact Person</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="block text-[9px] text-gray-400">Name</span>
                            <span className="font-semibold text-gray-700">{selectedHospital.contactPerson.name || '--'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400">Designation</span>
                            <span className="font-semibold text-gray-700">{selectedHospital.contactPerson.designation || '--'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400">Direct Phone</span>
                            <span className="font-semibold text-gray-700">{selectedHospital.contactPerson.phone || '--'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-gray-400">Email Address</span>
                            <span className="font-semibold text-gray-700 truncate block">{selectedHospital.contactPerson.email || '--'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Certificates */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Verification Certificates</span>
                      
                      {/* Compulsory Hospital License */}
                      {selectedHospital.hospitalLicenseUrl ? (
                        <a 
                          href={selectedHospital.hospitalLicenseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 p-3 bg-white hover:bg-[#f3f9ea] border border-outline-variant/30 rounded-xl transition-all group shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-bold text-gray-800">Hospital License Certificate</span>
                            <span className="block text-[10px] text-gray-400 truncate">Compulsory Operating License</span>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary transition-colors shrink-0">open_in_new</span>
                        </a>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">error</span>
                          Compulsory Hospital License Certificate is missing!
                        </div>
                      )}

                      {/* Kidney Transplant Cert */}
                      {selectedHospital.specialties.includes('Kidney Transplant') && (
                        selectedHospital.kidneyTransplantLicenseUrl ? (
                          <a 
                            href={selectedHospital.kidneyTransplantLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f3f9ea] border border-outline-variant/30 rounded-xl transition-all group shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-gray-800">Kidney Transplant Certification</span>
                              <span className="block text-[10px] text-gray-400 truncate">Specialty Operating License</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary transition-colors shrink-0">open_in_new</span>
                          </a>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Kidney Certification is missing!
                          </div>
                        )
                      )}

                      {/* Liver Transplant Cert */}
                      {selectedHospital.specialties.includes('Liver Transplant') && (
                        selectedHospital.liverTransplantLicenseUrl ? (
                          <a 
                            href={selectedHospital.liverTransplantLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f3f9ea] border border-outline-variant/30 rounded-xl transition-all group shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-gray-800">Liver Transplant Certification</span>
                              <span className="block text-[10px] text-gray-400 truncate">Specialty Operating License</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary transition-colors shrink-0">open_in_new</span>
                          </a>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Liver Certification is missing!
                          </div>
                        )
                      )}

                      {/* Heart Transplant Cert */}
                      {selectedHospital.specialties.includes('Heart Transplant') && (
                        selectedHospital.heartTransplantLicenseUrl ? (
                          <a 
                            href={selectedHospital.heartTransplantLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f3f9ea] border border-outline-variant/30 rounded-xl transition-all group shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-gray-800">Heart Transplant Certification</span>
                              <span className="block text-[10px] text-gray-400 truncate">Specialty Operating License</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary transition-colors shrink-0">open_in_new</span>
                          </a>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Heart Certification is missing!
                          </div>
                        )
                      )}

                      {/* Lung Transplant Cert */}
                      {selectedHospital.specialties.includes('Lung Transplant') && (
                        selectedHospital.lungTransplantLicenseUrl ? (
                          <a 
                            href={selectedHospital.lungTransplantLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 p-3 bg-white hover:bg-[#f3f9ea] border border-outline-variant/30 rounded-xl transition-all group shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-gray-800">Lung Transplant Certification</span>
                              <span className="block text-[10px] text-gray-400 truncate">Specialty Operating License</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary transition-colors shrink-0">open_in_new</span>
                          </a>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Lung Certification is missing!
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Activity Timeline */}
                <div className="space-y-sm pt-4 border-t border-outline-variant/20">
                  <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Recent Activity</h4>
                  <div className="space-y-4 pt-2">
                    {selectedHospital.recentActivity.map((act, idx) => (
                      <div key={idx} className="flex gap-4">
                        {/* Timeline Node Icon/Dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-1 ${
                            act.type === 'admission' ? 'bg-primary' :
                            act.type === 'blood' ? 'bg-amber-500' :
                            act.type === 'dispatch' ? 'bg-red-600' : 'bg-neutral-400'
                          }`} />
                          {idx < selectedHospital.recentActivity.length - 1 && (
                            <div className="w-[1px] bg-outline-variant/40 flex-1 my-1" />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-bold text-on-surface leading-tight">{act.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{act.description} • <span className="italic">{act.time}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

              {/* Sticky Bottom Actions */}
              <div className="p-6 bg-white border-t border-outline-variant/30 flex flex-col gap-sm shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateHospitalStatus(selectedHospital.id, selectedHospital.status === 'Suspended' ? 'Active' : 'Suspended')}
                    className="flex-1 py-3 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-colors text-center"
                  >
                    {selectedHospital.status === 'Suspended' ? 'Activate' : 'Suspend'}
                  </button>
                  <button 
                    onClick={() => handleUpdateHospitalStatus(selectedHospital.id, 'Active')}
                    className="flex-1 py-3 px-4 bg-primary hover:brightness-110 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all text-center"
                    disabled={selectedHospital.status === 'Active' || !selectedHospital.isSetupComplete}
                  >
                    {selectedHospital.status === 'Active' ? 'Verified ✓' : 'Verify & Activate'}
                  </button>
                </div>
              <button 
                onClick={() => handleDeleteHospital(selectedHospital.id)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-syne font-bold text-sm shadow-md transition-colors text-center"
              >
                Delete Account
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Add Hospital Modal */}
      {isAddHospitalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm"
            onClick={() => setIsAddHospitalOpen(false)}
          />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full z-10 border border-outline-variant/30 shadow-2xl relative animate-scale-in">
            <h3 className="font-syne font-bold text-xl text-primary mb-1">Add Facility</h3>
            <p className="text-xs text-on-surface-variant mb-4">Register a new healthcare facility in the coordinate system matrix.</p>
            
            <form onSubmit={handleAddHospitalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Hospital Name</label>
                <input 
                  type="text" 
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  placeholder="e.g. Hope General Hospital" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                <input 
                  type="email" 
                  value={newHospitalEmail}
                  onChange={(e) => setNewHospitalEmail(e.target.value)}
                  placeholder="hospital@example.com" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddHospitalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
