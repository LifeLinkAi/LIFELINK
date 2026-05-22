'use client';

import React, { useState, useMemo } from 'react';

// Define structures for driver and fleet management
interface Driver {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  vehicleId: string;
  vehicleType: 'Advanced Life Support' | 'Basic Life Support' | 'Patient Transport';
  hospital: string;
  status: 'Online' | 'On Trip' | 'Available' | 'Pending Verification' | 'Offline';
  zone: 'Zone North' | 'Zone Central' | 'Zone East' | 'Zone South';
  tripsCount: number;
  rating: number;
  reviewsCount: number;
  eta?: string;
  destination?: string;
  severity: 'Critical' | 'Standard' | 'None';
  location: {
    top: string;
    left: string;
  };
  documents: {
    name: string;
    image: string;
  }[];
  recentTrips: {
    id: string;
    route: string;
    date: string;
    status: 'Completed' | 'Cancelled' | 'Active';
  }[];
  logs: {
    time: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
  }[];
}

export default function AmbulanceManagementPage() {
  // Navigation states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');

  // Active Fleet tabs selection: 'All' | 'On Trip' | 'Critical'
  const [fleetTab, setFleetTab] = useState<'All' | 'On Trip' | 'Critical'>('All');
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');

  // Selected driver for slide-over drawer
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Registration overlay modal
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Checked item IDs for batch actions
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);

  // Toast feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock driver dataset
  const initialDrivers: Driver[] = [
    {
      id: 'AMB-7482',
      name: 'Michael Scott',
      avatar: 'MS',
      email: 'm.scott@lifelink.org',
      phone: '+1 (555) 289-4012',
      vehicleId: 'NY-9921-ALS',
      vehicleType: 'Advanced Life Support',
      hospital: 'St. Jude Hospital',
      status: 'On Trip',
      zone: 'Zone North',
      tripsCount: 1240,
      rating: 4.9,
      reviewsCount: 28,
      eta: '2m 14s',
      destination: 'St. Jude Hospital',
      severity: 'Critical',
      location: { top: '33%', left: '25%' },
      documents: [
        {
          name: 'EMT License 2026',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        },
        {
          name: 'ALS Vehicle Certification',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0AbT1BI45mgH6mQWpPAc3gQmtFpFOnlg6-J6yWR0zWJlUDFi-OJO2w-e7VPbNMAEeSHncQP-4blghJExXX5scVA5PLm352sKu9m51CAIgtlNiB8M8kI-CFg9c13CzGZW-Jysg86HndpE85oHozhvcfJfosTaZoJW0fauyoXBDc6NKWIwrEiJSERIW8P8vhmVOxalPia8gXOCmKoXFC5STfDChVrM4aHZVsdJN4Rq_zmjjtXxBuqO5_w0NU8iubbhCixCH-881WrZk'
        }
      ],
      recentTrips: [
        { id: 'T-9002', route: 'Midtown East -> St. Jude', date: 'Today, 11:20 AM', status: 'Active' },
        { id: 'T-8941', route: 'Harlem -> St. Jude', date: 'Yesterday, 4:15 PM', status: 'Completed' },
        { id: 'T-8810', route: 'Midtown East -> Central Medicare', date: 'May 20, 2026', status: 'Completed' }
      ],
      logs: [
        { time: '11:22 AM', message: 'Sirens activated: Critical dispatch', type: 'alert' },
        { time: '11:20 AM', message: 'Assigned route to St. Jude Hospital', type: 'info' },
        { time: '10:45 AM', message: 'Refueled vehicle - 100% capacity', type: 'info' }
      ]
    },
    {
      id: 'AMB-1192',
      name: 'Jane Doe',
      avatar: 'JD',
      email: 'j.doe@lifelink.org',
      phone: '+1 (555) 782-9011',
      vehicleId: 'NY-8832-BLS',
      vehicleType: 'Basic Life Support',
      hospital: 'General Med',
      status: 'On Trip',
      zone: 'Zone Central',
      tripsCount: 856,
      rating: 4.7,
      reviewsCount: 19,
      eta: '14m 00s',
      destination: 'General Med',
      severity: 'Standard',
      location: { top: '50%', left: '66%' },
      documents: [
        {
          name: 'EMT Certification 2026',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [
        { id: 'T-9005', route: 'Upper West Side -> General Med', date: 'Today, 10:40 AM', status: 'Active' },
        { id: 'T-8922', route: 'Chelsea -> General Med', date: 'Yesterday, 1:10 PM', status: 'Completed' }
      ],
      logs: [
        { time: '10:40 AM', message: 'Dispatched to route to General Med', type: 'info' },
        { time: '09:00 AM', message: 'Logged in and device diagnostics OK', type: 'info' }
      ]
    },
    {
      id: 'AMB-5541',
      name: 'Robert Jones',
      avatar: 'RJ',
      email: 'r.jones@lifelink.org',
      phone: '+1 (555) 923-1108',
      vehicleId: 'NY-4481-PTS',
      vehicleType: 'Patient Transport',
      hospital: 'Central Medicare Center',
      status: 'Available',
      zone: 'Zone East',
      tripsCount: 412,
      rating: 4.6,
      reviewsCount: 14,
      severity: 'None',
      location: { top: '65%', left: '42%' },
      documents: [
        {
          name: 'Commercial Driver License',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [
        { id: 'T-8991', route: 'Queens -> Central Medicare', date: 'Today, 8:00 AM', status: 'Completed' },
        { id: 'T-8840', route: 'Brooklyn -> St. Jude', date: 'May 19, 2026', status: 'Completed' }
      ],
      logs: [
        { time: '08:45 AM', message: 'Trip completed successfully', type: 'info' },
        { time: '08:00 AM', message: 'Assigned standard patient transfer', type: 'info' }
      ]
    },
    {
      id: 'AMB-8833',
      name: 'Dwight Schrute',
      avatar: 'DS',
      email: 'd.schrute@lifelink.org',
      phone: '+1 (555) 192-3304',
      vehicleId: 'NY-3329-ALS',
      vehicleType: 'Advanced Life Support',
      hospital: 'St. Jude Hospital',
      status: 'Online',
      zone: 'Zone South',
      tripsCount: 1980,
      rating: 4.9,
      reviewsCount: 92,
      severity: 'None',
      location: { top: '80%', left: '72%' },
      documents: [
        {
          name: 'EMT License 2026',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [
        { id: 'T-8910', route: 'Upper East Side -> St. Jude', date: 'Yesterday, 2:40 PM', status: 'Completed' }
      ],
      logs: [
        { time: '02:50 PM', message: 'Completed trip, returned to Standby status', type: 'info' }
      ]
    },
    {
      id: 'AMB-2294',
      name: 'Pam Beesly',
      avatar: 'PB',
      email: 'p.beesly@lifelink.org',
      phone: '+1 (555) 441-2904',
      vehicleId: 'NY-1102-BLS',
      vehicleType: 'Basic Life Support',
      hospital: 'General Med',
      status: 'Pending Verification',
      zone: 'Zone North',
      tripsCount: 0,
      rating: 0.0,
      reviewsCount: 0,
      severity: 'None',
      location: { top: '20%', left: '55%' },
      documents: [
        {
          name: 'Pending EMT Lic Certificate',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [],
      logs: [
        { time: 'Yesterday', message: 'Document upload verification pending review', type: 'warning' }
      ]
    },
    {
      id: 'AMB-4402',
      name: 'Jim Halpert',
      avatar: 'JH',
      email: 'j.halpert@lifelink.org',
      phone: '+1 (555) 782-4402',
      vehicleId: 'NY-5501-BLS',
      vehicleType: 'Basic Life Support',
      hospital: 'Central Medicare Center',
      status: 'Available',
      zone: 'Zone Central',
      tripsCount: 940,
      rating: 4.8,
      reviewsCount: 41,
      severity: 'None',
      location: { top: '48%', left: '30%' },
      documents: [
        {
          name: 'EMT Certification 2026',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [
        { id: 'T-8899', route: 'Midtown East -> Central Medicare', date: 'May 18, 2026', status: 'Completed' }
      ],
      logs: [
        { time: '09:00 AM', message: 'Logged in successfully', type: 'info' }
      ]
    },
    {
      id: 'AMB-3312',
      name: 'Stanley Hudson',
      avatar: 'SH',
      email: 's.hudson@lifelink.org',
      phone: '+1 (555) 331-2900',
      vehicleId: 'NY-2210-PTS',
      vehicleType: 'Patient Transport',
      hospital: 'Central Medicare Center',
      status: 'On Trip',
      zone: 'Zone East',
      tripsCount: 1420,
      rating: 4.5,
      reviewsCount: 30,
      eta: '8m 30s',
      destination: 'Central Medicare Center',
      severity: 'Standard',
      location: { top: '60%', left: '78%' },
      documents: [
        {
          name: 'CDL License Verification',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [
        { id: 'T-8994', route: 'Brooklyn -> Central Medicare', date: 'Today, 11:00 AM', status: 'Active' }
      ],
      logs: [
        { time: '11:00 AM', message: 'Dispatched patient transport routing', type: 'info' }
      ]
    },
    {
      id: 'AMB-1104',
      name: 'Angela Martin',
      avatar: 'AM',
      email: 'a.martin@lifelink.org',
      phone: '+1 (555) 110-4009',
      vehicleId: 'NY-8899-ALS',
      vehicleType: 'Advanced Life Support',
      hospital: 'St. Jude Hospital',
      status: 'Pending Verification',
      zone: 'Zone South',
      tripsCount: 0,
      rating: 0.0,
      reviewsCount: 0,
      severity: 'None',
      location: { top: '85%', left: '15%' },
      documents: [
        {
          name: 'EMT Paramedic License Certificate',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y70gpE0tPIcMnCrXsXqPXSNqtaM6n-JBTDphwD4cWI5WkL7O7SBpKCTi0O_RP_qDeHvnAIgWYD8Kg8ut5ulvj7zcRH6TLhMQnX5U1yULQ3LVHRS4i4QZ7iWkWV2tSBTJeHZ0tr_U8Oku9AHlB9ZwSd_-cIMHWrrYB7MnUdoo6JPFi5MY5pYxXsR3_VwyBdf5Q78o2OMP_l5raVCKfuSS75azX5sTeAv_PFIaUyrv_acWdW5FLWzg30zYLePY1wsXDMolZYuwuGW'
        }
      ],
      recentTrips: [],
      logs: [
        { time: 'May 21', message: 'EMT credentials audit requested', type: 'warning' }
      ]
    }
  ];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Main table filters
  const filteredDriversForTable = useMemo(() => {
    return initialDrivers.filter(driver => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;
      const matchesType = vehicleTypeFilter === 'All' || driver.vehicleType === vehicleTypeFilter;
      const matchesHospital = hospitalFilter === 'All' || driver.hospital === hospitalFilter;

      return matchesSearch && matchesStatus && matchesType && matchesHospital;
    });
  }, [searchQuery, statusFilter, vehicleTypeFilter, hospitalFilter]);

  // Sidebar list filters
  const filteredDriversForList = useMemo(() => {
    return initialDrivers.filter(driver => {
      const matchesSearch =
        driver.name.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
        driver.id.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
        driver.zone.toLowerCase().includes(fleetSearchQuery.toLowerCase());

      if (fleetTab === 'On Trip') {
        return matchesSearch && driver.status === 'On Trip';
      } else if (fleetTab === 'Critical') {
        return matchesSearch && driver.status === 'On Trip' && driver.severity === 'Critical';
      } else {
        return matchesSearch;
      }
    });
  }, [fleetSearchQuery, fleetTab]);

  // Click card filters
  const handleStatCardClick = (status: string) => {
    setStatusFilter(status);
    setSearchQuery('');
    // Align sidebar listing for quick preview
    if (status === 'On Trip') {
      setFleetTab('On Trip');
    } else if (status === 'Pending Verification') {
      setFleetTab('All');
    }
    showToast(`Table filtered to drivers: ${status}`);
  };

  // Selection
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDriverIds(filteredDriversForTable.map(d => d.id));
    } else {
      setSelectedDriverIds([]);
    }
  };

  const handleToggleSelectDriver = (id: string) => {
    if (selectedDriverIds.includes(id)) {
      setSelectedDriverIds(selectedDriverIds.filter(dId => dId !== id));
    } else {
      setSelectedDriverIds([...selectedDriverIds, id]);
    }
  };

  // Drawer slide actions
  const handleOpenDrawer = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-lg pb-xxl w-full relative">
      {/* Toast Notification */}
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
            Track, verify, and manage every ambulance driver and vehicle across the network.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-outline-variant/30">
            <button 
              onClick={() => showToast('Switched to Live Map view')}
              className="px-4 py-2 rounded-lg bg-pale-mint text-forest-green font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              Live Map
            </button>
            <button 
              onClick={() => {
                document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' });
                showToast('Scrolled to Fleet List');
              }}
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-neutral-50 font-medium text-xs flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              Drivers
            </button>
            <button 
              onClick={() => showToast('Trips history view loading...')}
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-neutral-50 font-medium text-xs flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">route</span>
              Trips
            </button>
          </div>
          <button 
            onClick={() => showToast('Fleet telemetry logs exported successfully.')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline-variant/50 text-forest-green hover:bg-neutral-50 transition-colors shadow-sm"
            aria-label="Export Telemetry Data"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button 
            onClick={() => setIsAddDriverOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps text-[12px]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Driver
          </button>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="flex flex-wrap gap-md">
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">TOTAL TRIPS TODAY</span>
            <div className="font-syne font-bold text-base text-forest-green">1,248</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">AVG RESPONSE TIME</span>
            <div className="font-syne font-bold text-base text-forest-green">4m 12s</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-red-200">
          <div className="h-2 w-2 rounded-full bg-red-600 animate-ping shrink-0"></div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">CRITICAL TRIPS ACTIVE</span>
            <div className="font-syne font-bold text-base text-red-600">14</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary text-[20px]">star</span>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">AVG DRIVER RATING</span>
            <div className="font-syne font-bold text-base text-forest-green">4.8 / 5.0</div>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Drivers */}
        <div 
          onClick={() => handleStatCardClick('All')}
          className={`p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-primary text-white ring-2 ring-primary/40 shadow-lg'
              : 'bg-forest-green text-white/95 hover:brightness-105'
          }`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="material-symbols-outlined text-white/85 text-3xl">groups</span>
          </div>
          <h3 className="font-syne font-bold text-[32px] tracking-tight leading-none">452</h3>
          <p className="font-body-sm text-[12px] text-white/80 mt-1">Total Drivers</p>
        </div>

        {/* Online Now */}
        <div 
          onClick={() => handleStatCardClick('Online')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Online'
              ? 'bg-white border-primary ring-2 ring-primary/20 shadow-md'
              : 'bg-white border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-pale-mint rounded-lg">
              <span className="material-symbols-outlined text-primary text-[20px]">wifi</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary-container rounded-full text-[10px] font-bold text-on-secondary-container">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              LIVE
            </div>
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">318</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Online Now</p>
        </div>

        {/* On Trip */}
        <div 
          onClick={() => handleStatCardClick('On Trip')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'On Trip'
              ? 'bg-white border-blue-600 ring-2 ring-blue-200 shadow-md'
              : 'bg-white border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container-highest rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-[20px]">local_shipping</span>
            </div>
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">142</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">On Trip</p>
        </div>

        {/* Available */}
        <div 
          onClick={() => handleStatCardClick('Available')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 relative ${
            statusFilter === 'Available'
              ? 'bg-white border-secondary ring-2 ring-secondary/20 shadow-md'
              : 'bg-white border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
            </div>
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">176</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Available</p>
        </div>

        {/* Pending Verification */}
        <div 
          onClick={() => handleStatCardClick('Pending Verification')}
          className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
            statusFilter === 'Pending Verification'
              ? 'bg-white border-yellow-600 ring-2 ring-yellow-250 shadow-md'
              : 'bg-white border-outline-variant/30 hover:bg-neutral-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-variant rounded-lg">
              <span className="material-symbols-outlined text-outline text-[20px]">pending_actions</span>
            </div>
            <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Action Req</span>
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">24</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Pending Verif.</p>
        </div>
      </div>

      {/* Main Map & Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg h-auto lg:h-[700px]">
        {/* Map Area */}
        <div className="lg:col-span-7 xl:col-span-8 relative rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20 bg-surface-dim h-[400px] lg:h-full">
          <div 
            className="absolute inset-0 map-bg opacity-90 mix-blend-multiply"
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvxcubf7Oig1aKWuK6WycpE3MyGsPDuSzg-dmaEAaINecPVzvH39QpNckOKdYdqQMesO3WfWL2wNi1eGHhCq8f2MQNRyyY9pgqhfN48jS30AP51YGy8eXyBecYanc3hEyqnzSla-_2RK7MYVXBLDz-OW97CRrC8qnAwCyqjufIQnHlKGTvVn3yozhE7u2lS4paPhgCY0rXgZSrY2rWwt6ecLiyOfvCCblmKSBNreVv8_KPO9mmPCY2r91QyF-Set8Td0BWuEldgAf9')", 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-green/20 to-transparent pointer-events-none" />
          
          {/* Map Zoom Controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <button 
              onClick={() => showToast('Map zoomed in')}
              className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-sm flex items-center justify-center text-forest-green hover:bg-white transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button 
              onClick={() => showToast('Map zoomed out')}
              className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-sm flex items-center justify-center text-forest-green hover:bg-white transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <button 
              onClick={() => showToast('Map centered to default coordinates')}
              className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-sm flex items-center justify-center text-forest-green hover:bg-white transition-colors border border-outline-variant/20 mt-4"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* Interactive Map Pins */}
          {initialDrivers.map((driver) => {
            if (driver.status === 'Offline' || !driver.location) return null;
            const isCritical = driver.status === 'On Trip' && driver.severity === 'Critical';
            const isAvailable = driver.status === 'Available';
            
            return (
              <div
                key={driver.id}
                onClick={() => handleOpenDrawer(driver)}
                style={{ top: driver.location.top, left: driver.location.left }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                title={`${driver.name} - ${driver.id} (${driver.status})`}
              >
                <div 
                  className={`w-12 h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-110 ${
                    isCritical ? 'border-red-600' : isAvailable ? 'border-primary' : 'border-blue-500'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${
                    isCritical ? 'text-red-600' : isAvailable ? 'text-primary' : 'text-blue-500'
                  }`}>
                    {isCritical ? 'emergency' : 'local_shipping'}
                  </span>
                </div>
                <div className={`absolute -bottom-1 left-1/2 w-3.5 h-3.5 rotate-45 transform -translate-x-1/2 border-r border-b bg-white ${
                  isCritical ? 'border-red-600' : isAvailable ? 'border-primary' : 'border-blue-500'
                }`} />
                {isCritical && (
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-red-600/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping -z-10" />
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
            <h4 className="font-label-caps text-[10px] text-on-surface-variant mb-2.5 tracking-wider uppercase">FLEET MAP LEGEND</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-[11px] font-semibold text-on-surface">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[11px] font-semibold text-on-surface">On Trip (Std)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-[11px] font-semibold text-on-surface flex items-center gap-1">
                  On Trip (Critical)
                  <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Sidebar Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-2xl shadow-lg border border-outline-variant/30 overflow-hidden h-[500px] lg:h-full">
          <div className="p-5 border-b border-outline-variant/20 bg-pale-mint/30">
            <h3 className="font-syne font-bold text-base text-forest-green mb-3">Active Fleet</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-[20px]">search</span>
              <input 
                value={fleetSearchQuery}
                onChange={(e) => setFleetSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant/40 focus:border-primary rounded-xl text-xs outline-none transition-all placeholder:text-on-surface-variant/65"
                placeholder="Search driver, ID, or zone..."
                type="text"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-outline-variant/20 px-2 justify-between">
            <button 
              onClick={() => setFleetTab('All')}
              className={`flex-1 text-center py-3 border-b-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all px-1 truncate ${
                fleetTab === 'All' 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              All ({initialDrivers.length})
            </button>
            <button 
              onClick={() => setFleetTab('On Trip')}
              className={`flex-1 text-center py-3 border-b-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all px-1 truncate ${
                fleetTab === 'On Trip' 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              On Trip ({initialDrivers.filter(d => d.status === 'On Trip').length})
            </button>
            <button 
              onClick={() => setFleetTab('Critical')}
              className={`flex-1 text-center py-3 border-b-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all px-1 truncate ${
                fleetTab === 'Critical' 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              Critical ({initialDrivers.filter(d => d.status === 'On Trip' && d.severity === 'Critical').length})
            </button>
          </div>

          {/* Fleet Sidebar List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredDriversForList.length > 0 ? (
              filteredDriversForList.map((driver) => {
                const isCritical = driver.status === 'On Trip' && driver.severity === 'Critical';
                const isOnTrip = driver.status === 'On Trip';
                const isAvailable = driver.status === 'Available';

                return (
                  <div
                    key={driver.id}
                    onClick={() => handleOpenDrawer(driver)}
                    className="p-3 bg-neutral-50/50 hover:bg-pale-mint/10 rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-gradient-to-br from-primary-container to-primary text-white font-bold text-sm shrink-0">
                          {driver.avatar}
                        </div>
                        <div>
                          <h4 className="font-syne font-bold text-sm text-forest-green group-hover:text-primary transition-colors">{driver.name}</h4>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{driver.id} • {driver.zone}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        isCritical ? 'bg-red-50 text-red-700 border border-red-200' :
                        isOnTrip ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        isAvailable ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {isCritical ? 'Critical' : driver.status}
                      </span>
                    </div>

                    {/* Meta Detail block */}
                    {driver.status === 'On Trip' && (
                      <div className="bg-white rounded-lg p-2 flex items-center gap-2 text-xs border border-outline-variant/20 mt-2">
                        <span className={`material-symbols-outlined text-[15px] ${isCritical ? 'text-red-600' : 'text-blue-500'}`}>
                          {isCritical ? 'emergency' : 'navigation'}
                        </span>
                        <span className="text-on-surface font-semibold">ETA: {driver.eta}</span>
                        <span className="text-outline-variant/60">•</span>
                        <span className="text-on-surface-variant truncate max-w-[150px]">To: {driver.destination}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-on-surface-variant/70 text-xs">
                <span className="material-symbols-outlined text-3xl text-outline-variant block mb-2">sensor_occupied</span>
                No fleet units matching tab or search filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table view & filtering */}
      <section id="fleet-section" className="mt-xl">
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-md bg-neutral-50/50">
            <div>
              <h2 className="font-syne font-bold text-lg text-forest-green">Ambulance Fleet</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Manage and monitor all active ambulance units in your network.</p>
            </div>
            
            {/* Table Filter options */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-outline-variant/50 text-xs outline-none focus:border-primary placeholder:text-on-surface-variant/60" 
                  placeholder="Search driver, vehicle ID..."
                  type="text"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Status Dropdown */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                >
                  <option value="All">Status (All)</option>
                  <option value="Online">Online</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Available">Available</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>

                {/* Vehicle Type Dropdown */}
                <select 
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                >
                  <option value="All">Vehicle Type (All)</option>
                  <option value="Advanced Life Support">Advanced Life Support</option>
                  <option value="Basic Life Support">Basic Life Support</option>
                  <option value="Patient Transport">Patient Transport</option>
                </select>

                {/* Hospital Affiliation Dropdown */}
                <select 
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="py-2.5 pl-4 pr-10 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                >
                  <option value="All">Affiliated Hospital (All)</option>
                  <option value="St. Jude Hospital">St. Jude Hospital</option>
                  <option value="General Med">General Med</option>
                  <option value="Central Medicare Center">Central Medicare Center</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EFF2EE] text-on-surface border-b border-outline-variant/30">
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox"
                      onChange={handleToggleSelectAll}
                      checked={filteredDriversForTable.length > 0 && selectedDriverIds.length === filteredDriversForTable.length}
                      className="rounded text-primary focus:ring-primary h-4 w-4 border-outline-variant cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Affiliated Hospital</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Live Status</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Trips</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredDriversForTable.length > 0 ? (
                  filteredDriversForTable.map((driver) => {
                    const isSelected = selectedDriverIds.includes(driver.id);
                    const isOnline = driver.status === 'Online' || driver.status === 'On Trip' || driver.status === 'Available';
                    const isCritical = driver.status === 'On Trip' && driver.severity === 'Critical';

                    return (
                      <tr 
                        key={driver.id} 
                        onClick={() => handleOpenDrawer(driver)}
                        className={`hover:bg-neutral-50/80 transition-colors group cursor-pointer border-l-4 ${
                          isOnline ? 'border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectDriver(driver.id)}
                            className="rounded text-primary focus:ring-primary h-4 w-4 border-outline-variant cursor-pointer"
                          />
                        </td>

                        {/* Driver details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-forest-green flex items-center justify-center text-white font-bold shrink-0">
                              {driver.avatar}
                            </div>
                            <div>
                              <div className="font-syne font-bold text-sm text-forest-green group-hover:text-primary transition-colors">{driver.name}</div>
                              <div className="text-[11px] text-on-surface-variant">ID: {driver.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle details */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-on-surface">{driver.vehicleId}</div>
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase mt-1 ${
                            driver.vehicleType === 'Advanced Life Support' ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim/30' :
                            driver.vehicleType === 'Basic Life Support' ? 'bg-surface-container-highest text-on-surface-variant' :
                            'bg-surface-variant text-on-surface-variant'
                          }`}>
                            {driver.vehicleType}
                          </span>
                        </td>

                        {/* Affiliated Hospital */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-on-surface font-medium">
                            <span className="material-symbols-outlined text-[16px] text-primary">local_hospital</span>
                            {driver.hospital}
                          </div>
                        </td>

                        {/* Live Status Badge */}
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 px-3 py-1 w-fit rounded-full ${
                            isCritical ? 'bg-red-50 text-red-700 border border-red-200' :
                            driver.status === 'On Trip' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            driver.status === 'Available' ? 'bg-secondary-container/50 text-on-secondary-container' :
                            driver.status === 'Pending Verification' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            'bg-neutral-50 text-neutral-600 border border-neutral-200'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isCritical || driver.status === 'Pending Verification' ? 'bg-red-500' :
                              driver.status === 'On Trip' ? 'bg-blue-600' :
                              driver.status === 'Available' || driver.status === 'Online' ? 'bg-primary animate-pulse' :
                              'bg-neutral-400'
                            }`} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{driver.status}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-[16px] text-outline-variant">location_on</span>
                            {driver.zone}
                          </div>
                        </td>

                        {/* Trips count */}
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded text-xs font-bold font-syne">
                            {driver.tripsCount.toLocaleString()}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-secondary text-[16px] fill-1">star</span>
                            <span className="text-xs font-bold text-on-surface">{driver.rating > 0 ? driver.rating.toFixed(1) : '--'}</span>
                            {driver.reviewsCount > 0 && (
                              <span className="text-[10px] text-on-surface-variant">({driver.reviewsCount})</span>
                            )}
                          </div>
                        </td>

                        {/* Dropdown vert actions */}
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleOpenDrawer(driver)}
                            className="text-outline-variant hover:text-forest-green transition-colors p-1.5 rounded-lg hover:bg-neutral-100"
                            aria-label="View Driver Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-on-surface-variant font-dmsans">
                      <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">no_accounts</span>
                      No drivers or vehicles found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/30 bg-neutral-50/20">
            <p className="text-xs text-on-surface-variant">
              Showing 1-{filteredDriversForTable.length} of {filteredDriversForTable.length} drivers
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green text-white font-bold text-xs">1</button>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Slide-over Side Drawer Panel */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDriver && (
          <>
            {/* Panel Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-green flex items-center justify-center text-white font-bold text-base shrink-0">
                  {selectedDriver.avatar}
                </div>
                <div>
                  <h3 className="font-syne font-bold text-base text-primary leading-tight">{selectedDriver.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{selectedDriver.id} • {selectedDriver.vehicleId}</p>
                </div>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close details"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              {/* Telemetry Status Grid */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Device & Telemetry Status</h4>
                <div className="grid grid-cols-3 gap-sm">
                  <div className="p-3 rounded-xl border border-outline-variant/30 bg-neutral-50/50">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">GPS Connection</span>
                    <span className="block text-sm font-bold text-primary mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-outline-variant/30 bg-neutral-50/50">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fuel Level</span>
                    <span className="block text-sm font-bold text-forest-green mt-1">94% Capacity</span>
                  </div>
                  <div className="p-3 rounded-xl border border-outline-variant/30 bg-neutral-50/50">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">EMT Level</span>
                    <span className="block text-sm font-bold text-primary mt-1">ALS Paramedic</span>
                  </div>
                </div>
              </div>

              {/* Driver Credentials / Bio info */}
              <div className="space-y-sm bg-neutral-50/50 border border-outline-variant/20 p-4 rounded-xl">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Contact & Assignment Info</h4>
                <div className="space-y-2 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Phone:</span>
                    <span className="font-bold text-on-surface">{selectedDriver.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Email:</span>
                    <span className="font-bold text-on-surface">{selectedDriver.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Affiliation:</span>
                    <span className="font-bold text-on-surface">{selectedDriver.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Sector Zone:</span>
                    <span className="font-bold text-on-surface">{selectedDriver.zone}</span>
                  </div>
                </div>
              </div>

              {/* Verified Credentials Documents */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Uploaded Credentials</h4>
                <div className="grid grid-cols-2 gap-md">
                  {selectedDriver.documents.map((doc, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden border border-outline-variant/30 mb-1.5 relative shadow-sm">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={doc.image}
                          alt={doc.name}
                        />
                      </div>
                      <p className="text-[11px] font-bold text-on-surface-variant group-hover:text-primary transition-colors truncate">{doc.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Log Timeline */}
              <div className="space-y-sm pt-4 border-t border-outline-variant/20">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Recent Activity Logs</h4>
                <div className="space-y-4 pt-2">
                  {selectedDriver.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-1 ${
                          log.type === 'alert' ? 'bg-red-600' :
                          log.type === 'warning' ? 'bg-amber-500' :
                          'bg-primary'
                        }`} />
                        {idx < selectedDriver.logs.length - 1 && (
                          <div className="w-[1px] bg-outline-variant/40 flex-1 my-1" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface leading-tight">{log.message}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 italic">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-white border-t border-outline-variant/30 grid grid-cols-2 gap-md shrink-0">
              <button 
                onClick={() => {
                  showToast(`Driver access suspended for ${selectedDriver.name}`);
                  setIsDrawerOpen(false);
                }}
                className="py-3 px-4 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Suspend Driver
              </button>
              <button 
                onClick={() => {
                  showToast(`EMT credentials approved for ${selectedDriver.name}`);
                  setIsDrawerOpen(false);
                }}
                className="py-3 px-4 bg-primary hover:brightness-110 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Approve & Sync
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Add Driver Modal */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm"
            onClick={() => setIsAddDriverOpen(false)}
          />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full z-10 border border-outline-variant/30 shadow-2xl relative animate-scale-in">
            <h3 className="font-syne font-bold text-xl text-primary mb-1">Add Driver</h3>
            <p className="text-xs text-on-surface-variant mb-4">Register a new ambulance unit and EMT technician credentials into the coord directory.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsAddDriverOpen(false);
              showToast('Ambulance driver registered successfully (Mock database check confirmed)');
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Stanley Hudson" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Vehicle License Plate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NY-1234-ALS" 
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Vehicle Type</label>
                  <select className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                    <option>Advanced Life Support</option>
                    <option>Basic Life Support</option>
                    <option>Patient Transport</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Affiliated Hospital</label>
                  <select className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                    <option>St. Jude Hospital</option>
                    <option>General Med</option>
                    <option>Central Medicare Center</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Zone Assignment</label>
                  <select className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                    <option>Zone North</option>
                    <option>Zone Central</option>
                    <option>Zone East</option>
                    <option>Zone South</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddDriverOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
