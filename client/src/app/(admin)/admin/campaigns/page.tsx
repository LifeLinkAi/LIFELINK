'use client';

import React, { useState, useMemo } from 'react';

// Campaign interface
interface Campaign {
  id: string;
  title: string;
  type: 'EMERGENCY DRIVE' | 'ROUTINE DRIVE' | 'AWARENESS';
  status: 'ACTIVE' | 'UPCOMING' | 'DRAFT' | 'ENDED';
  hospital: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  bloodGroups: string[];
  donorsRegistered: number;
  donorsTarget: number;
  donationsCollected: number;
  daysLeft: number;
  engagement: number;
  imageUrl: string;
}

// Activity interface for timeline
interface Activity {
  id: string;
  title: string;
  time: string;
  desc: string;
  icon: string;
  isActive: boolean;
}

// Registered Donor interface
interface CampaignDonor {
  id: string;
  name: string;
  bloodGroup: string;
  registeredAt: string;
  status: 'Donated' | 'Confirmed' | 'Pending';
}

export default function CampaignsPage() {
  // 1. Initial State & Datasets
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'O-Negative Shortage Response',
      type: 'EMERGENCY DRIVE',
      status: 'ACTIVE',
      hospital: 'Metro General Hospital',
      startDate: '2026-05-12',
      endDate: '2026-05-24',
      bloodGroups: ['O-', 'ANY'],
      donorsRegistered: 145,
      donorsTarget: 200,
      donationsCollected: 112,
      daysLeft: 4,
      engagement: 82,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZzPYPWGHaAfn0QyA3nBfLNrmGk6EcnRj9zhzYD7nUEatM4FyB77UFyb7i_1swl1oKZV01IOPH8esYKg3OVZh2mm57xHiITw3GwWgtmyaY5Jb5Fa9k48LMQEtmGGYIDlBQdwYwkbh3QUr7VNdwf5HBnU_uKZqB_SVPrJfYFm9w9qYBnpBrbvBLRnxaU2E64h1xPshJPXTCcPyIUrDooPqmeIGnYmp-tbkFjBeknJ2dpq6PtMxchJSsgJPo_hS33ZBYRco0F8ol7Wwc',
    },
    {
      id: '2',
      title: 'Annual Campus Blood Drive',
      type: 'ROUTINE DRIVE',
      status: 'ACTIVE',
      hospital: 'University Medical Center',
      startDate: '2026-05-18',
      endDate: '2026-05-30',
      bloodGroups: ['A+', 'B+', 'O+', 'AB+'],
      donorsRegistered: 240,
      donorsTarget: 300,
      donationsCollected: 198,
      daysLeft: 12,
      engagement: 75,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGOZpeJK_R74HRMEhcsPPhew5W1osX0tE0IITJHq0951WyGloSjdEO75hgo2GgOMN1DIVNMQYXi0STg6pfERpdxUUfIFKhzJXdnKIIVHQsQHgWzk94_EWPFGDS4VYkL3TirxyINw5lNi6qC45617W9kPD0wnf8IKA8hdMaSts8LfJEKOR4emSwXGGU3hvnK-iztEgeVk9bWTO8mLDCBC6bTpu2QdepdRjtPODuloOvg11K_ot9EUzHxwbauNbmM15C8s0IQRi49m-7',
    },
    {
      id: '3',
      title: 'Silicon Labs Wellness Drive',
      type: 'ROUTINE DRIVE',
      status: 'UPCOMING',
      hospital: 'Silicon Labs Clinic',
      startDate: '2026-05-26',
      endDate: '2026-05-29',
      bloodGroups: ['ANY'],
      donorsRegistered: 45,
      donorsTarget: 150,
      donationsCollected: 0,
      daysLeft: 6,
      engagement: 0,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '4',
      title: 'Winter Plasma Initiative',
      type: 'AWARENESS',
      status: 'DRAFT',
      hospital: 'St. Jude Research Center',
      startDate: '2026-06-05',
      endDate: '2026-06-12',
      bloodGroups: ['ANY'],
      donorsRegistered: 0,
      donorsTarget: 100,
      donationsCollected: 0,
      daysLeft: 15,
      engagement: 0,
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '5',
      title: 'Storm Disaster Emergency Relief',
      type: 'EMERGENCY DRIVE',
      status: 'ENDED',
      hospital: 'County Trauma Center',
      startDate: '2026-05-01',
      endDate: '2026-05-08',
      bloodGroups: ['O-', 'O+', 'A-', 'B-'],
      donorsRegistered: 412,
      donorsTarget: 400,
      donationsCollected: 395,
      daysLeft: 0,
      engagement: 95,
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '6',
      title: 'Youth Donor Awareness Week',
      type: 'AWARENESS',
      status: 'ACTIVE',
      hospital: 'Community Health Hub',
      startDate: '2026-05-20',
      endDate: '2026-05-28',
      bloodGroups: ['ANY'],
      donorsRegistered: 380,
      donorsTarget: 500,
      donationsCollected: 210,
      daysLeft: 8,
      engagement: 62,
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=600',
    }
  ]);

  // UI Interactive States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'ACTIVE' | 'UPCOMING' | 'DRAFT' | 'ENDED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<'OVERVIEW' | 'DONORS' | 'PERFORMANCE'>('OVERVIEW');

  // Form Fields State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    type: 'Emergency Response' as 'Emergency Response' | 'Routine Drive' | 'Awareness',
    hospital: 'Metro General Hospital',
    startDate: '',
    endDate: '',
    description: '',
    targetDonors: 150,
    bloodGroups: ['ANY']
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Computed Stats based on Current Data
  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.status === 'ACTIVE').length;
    const upcoming = campaigns.filter(c => c.status === 'UPCOMING').length;
    const totalReach = campaigns.reduce((acc, c) => acc + c.donorsRegistered * 45 + 5000, 12000);
    const donationsThisMonth = campaigns.reduce((acc, c) => acc + c.donationsCollected, 2500);
    const avgEngagement = Math.round(
      campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'ENDED')
               .reduce((acc, c) => acc + c.engagement, 0) / 
      (campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'ENDED').length || 1)
    );

    return {
      active,
      upcoming,
      totalReach,
      donationsThisMonth,
      avgEngagement
    };
  }, [campaigns]);

  // Filter and Search Campaigns List
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesTab = activeTab === 'all' || c.status === activeTab;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [campaigns, activeTab, searchQuery]);

  // 3. Campaign Stepper Wizard Form Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.startDate || !newCampaign.endDate) {
      showToast('❌ Please fill in all required fields.');
      return;
    }

    const typeMapping: Record<string, 'EMERGENCY DRIVE' | 'ROUTINE DRIVE' | 'AWARENESS'> = {
      'Emergency Response': 'EMERGENCY DRIVE',
      'Routine Drive': 'ROUTINE DRIVE',
      'Awareness': 'AWARENESS'
    };

    const campaignStatus: 'ACTIVE' | 'UPCOMING' | 'DRAFT' | 'ENDED' = 
      new Date(newCampaign.startDate) > new Date() ? 'UPCOMING' : 'ACTIVE';

    const item: Campaign = {
      id: (campaigns.length + 1).toString(),
      title: newCampaign.title,
      type: typeMapping[newCampaign.type] || 'ROUTINE DRIVE',
      status: campaignStatus,
      hospital: newCampaign.hospital,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      bloodGroups: newCampaign.bloodGroups,
      donorsRegistered: 0,
      donorsTarget: Number(newCampaign.targetDonors),
      donationsCollected: 0,
      daysLeft: Math.max(0, Math.ceil((new Date(newCampaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      engagement: 0,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    };

    setCampaigns(prev => [item, ...prev]);
    setCreateModalOpen(false);
    setCreateStep(1);
    setNewCampaign({
      title: '',
      type: 'Emergency Response',
      hospital: 'Metro General Hospital',
      startDate: '',
      endDate: '',
      description: '',
      targetDonors: 150,
      bloodGroups: ['ANY']
    });
    showToast('🎉 Campaign successfully created and launched live!');
  };

  // Mock timeline activities for selected campaign
  const campaignActivities = useMemo<Activity[]>(() => {
    if (!selectedCampaign) return [];
    return [
      {
        id: 'act1',
        title: 'Push Notification Sent',
        time: '2 hrs ago',
        desc: `Targeted 450 eligible ${selectedCampaign.bloodGroups.join('/')} donors in 10km radius.`,
        icon: 'campaign',
        isActive: true
      },
      {
        id: 'act2',
        title: `Goal Reached: ${Math.round((selectedCampaign.donorsRegistered / (selectedCampaign.donorsTarget || 1)) * 100)}%`,
        time: 'Yesterday',
        desc: 'Campaign reached registered target milestones.',
        icon: 'check_circle',
        isActive: selectedCampaign.donorsRegistered > 0
      },
      {
        id: 'act3',
        title: 'Hospital Staff Onsite Dispatch',
        time: '3 days ago',
        desc: `Verified logistics setup and equipment sync at ${selectedCampaign.hospital}.`,
        icon: 'local_hospital',
        isActive: true
      }
    ];
  }, [selectedCampaign]);

  // Mock registered donors for selected campaign
  const campaignDonors = useMemo<CampaignDonor[]>(() => {
    if (!selectedCampaign) return [];
    return [
      { id: 'd1', name: 'Alexander Wright', bloodGroup: 'O-', registeredAt: '10:45 AM', status: 'Donated' },
      { id: 'd2', name: 'Sophia Miller', bloodGroup: 'O-', registeredAt: '09:12 AM', status: 'Donated' },
      { id: 'd3', name: 'Liam Davies', bloodGroup: 'O-', registeredAt: 'Yesterday', status: 'Confirmed' },
      { id: 'd4', name: 'Olivia Martinez', bloodGroup: 'A+', registeredAt: '2 days ago', status: 'Pending' },
      { id: 'd5', name: 'Lucas Thompson', bloodGroup: 'B-', registeredAt: '3 days ago', status: 'Donated' }
    ];
  }, [selectedCampaign]);

  // 4. Calendar representation helpers (May 2026 Calendar)
  const calendarDays = useMemo(() => {
    const daysInMay = 31;
    // May 1 2026 starts on Friday (5th day index, where Sun=0, Mon=1... Fri=5)
    const startOffset = 5;
    const daysArray = [];

    // Fill offset days from April
    for (let i = 26; i <= 30; i++) {
      daysArray.push({ dayNum: i, month: 'prev', dateStr: `2026-04-${i}` });
    }

    // Fill May days
    for (let i = 1; i <= daysInMay; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      daysArray.push({ dayNum: i, month: 'current', dateStr: `2026-05-${dayStr}` });
    }

    // Fill offset days from June
    for (let i = 1; i <= 6; i++) {
      daysArray.push({ dayNum: i, month: 'next', dateStr: `2026-06-0${i}` });
    }

    return daysArray;
  }, []);

  return (
    <div className="-mx-6 md:-mx-10 -my-6 md:-my-10 p-6 md:p-10 bg-[#F4F7F0] min-h-screen relative select-none">
      
      {/* Inline styles for custom element transitions & shadows */}
      <style dangerouslySetInnerHTML={{ __html: `
        .card-sage {
            background-color: #DDE5D3;
            border: 1px solid #C7D2C0;
        }
        .btn-primary-grad {
            background: linear-gradient(135deg, #3e5219 0%, #496800 100%);
        }
        .btn-primary-grad:hover {
            filter: brightness(1.1);
            box-shadow: 0 0 15px rgba(73, 104, 0, 0.4);
        }
        .soft-shadow {
            box-shadow: 0 8px 30px rgba(85, 107, 47, 0.08);
        }
        .glass-panel {
            background: rgba(244, 247, 240, 0.8);
            backdrop-filter: blur(12px);
            border-left: 1px solid rgba(199, 210, 192, 0.5);
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* Floating Action Toasts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-[#121c2a] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-bounce-subtle">
          <span className="material-symbols-outlined text-[20px] text-[#c8f17a]">check_circle</span>
          <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-xl">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps text-xs">Admin</span>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="font-label-caps text-label-caps text-primary text-xs">Campaigns</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-sm tracking-tight leading-none">Campaigns</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl text-base">
            Manage and monitor blood donation initiatives across all regions.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-md">
          {/* View Toggles */}
          <div className="flex items-center bg-white rounded-lg p-1 border border-outline-variant shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              title="Grid View"
            >
              <span className="material-symbols-outlined block text-[20px]">grid_view</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              title="List View"
            >
              <span className="material-symbols-outlined block text-[20px]">list</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${viewMode === 'calendar' ? 'bg-surface-container-low text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              title="Calendar View"
            >
              <span className="material-symbols-outlined block text-[20px]">calendar_month</span>
            </button>
          </div>

          <button 
            onClick={() => showToast('📋 Templates loaded from emergency guidelines database')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low transition-colors font-label-caps text-label-caps text-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">file_copy</span>
            Templates
          </button>
          
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary-grad text-white transition-all font-label-caps text-label-caps text-xs shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-lg mb-xl">
        {/* Active Campaigns Card */}
        <div className="bg-primary text-white rounded-xl p-lg soft-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-xxl relative z-10">
            <span className="material-symbols-outlined text-tertiary-fixed text-[28px]">campaign</span>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              <span className="font-label-caps text-[10px] text-white">LIVE</span>
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="font-display-lg text-display-lg mb-1 leading-none font-bold">{stats.active}</div>
            <div className="font-body-sm text-body-sm text-tertiary-fixed font-medium">Active Campaigns</div>
          </div>
        </div>

        {/* Total Reach Card */}
        <div className="card-sage rounded-xl p-lg soft-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-lg">
            <div className="p-2 bg-white/50 rounded-lg"><span className="material-symbols-outlined text-primary text-[20px] block">groups</span></div>
            <span className="font-label-caps text-label-caps text-secondary text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +14%</span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold">{stats.totalReach.toLocaleString()}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Total Reach</div>
          </div>
        </div>

        {/* Donations Monthly Card */}
        <div className="card-sage rounded-xl p-lg soft-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-lg">
            <div className="p-2 bg-white/50 rounded-lg"><span className="material-symbols-outlined text-primary text-[20px] block">bloodtype</span></div>
            <span className="font-label-caps text-label-caps text-secondary text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +8%</span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold">{stats.donationsThisMonth.toLocaleString()}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Donations This Month</div>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="card-sage rounded-xl p-lg soft-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-lg">
            <div className="p-2 bg-white/50 rounded-lg"><span className="material-symbols-outlined text-primary text-[20px] block">event_upcoming</span></div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold">{stats.upcoming}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Upcoming Campaigns</div>
          </div>
        </div>

        {/* Engagement Card */}
        <div className="card-sage rounded-xl p-lg soft-shadow flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-lg">
            <div className="p-2 bg-white/50 rounded-lg"><span className="material-symbols-outlined text-primary text-[20px] block">analytics</span></div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg text-on-surface mb-1 font-bold">{stats.avgEngagement}%</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Avg. Engagement</div>
            <div className="w-full bg-white/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${stats.avgEngagement}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-lg mb-lg border-b border-outline-variant/30 pb-md">
        <div className="flex items-center gap-md overflow-x-auto w-full lg:w-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors text-xs ${activeTab === 'all' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            All ({campaigns.length})
          </button>
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors text-xs ${activeTab === 'ACTIVE' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Active ({campaigns.filter(c => c.status === 'ACTIVE').length})
          </button>
          <button 
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors text-xs ${activeTab === 'UPCOMING' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Upcoming ({campaigns.filter(c => c.status === 'UPCOMING').length})
          </button>
          <button 
            onClick={() => setActiveTab('DRAFT')}
            className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors text-xs ${activeTab === 'DRAFT' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Draft ({campaigns.filter(c => c.status === 'DRAFT').length})
          </button>
          <button 
            onClick={() => setActiveTab('ENDED')}
            className={`px-4 py-2 font-label-caps text-label-caps whitespace-nowrap transition-colors text-xs ${activeTab === 'ENDED' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Ended ({campaigns.filter(c => c.status === 'ENDED').length})
          </button>
        </div>

        <div className="flex items-center gap-sm w-full lg:w-auto pb-2 lg:pb-0">
          <div className="relative min-w-[240px] flex-grow lg:flex-grow-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm placeholder:text-outline shadow-sm text-on-surface" 
              placeholder="Search campaigns..." 
              type="text"
            />
          </div>
          <button 
            onClick={() => showToast('Filter panel options triggered')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low font-body-sm text-body-sm whitespace-nowrap shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
          </button>
          <button 
            onClick={() => showToast('Sorting triggers activated')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low font-body-sm text-body-sm whitespace-nowrap shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">sort</span> Sort
          </button>
        </div>
      </div>

      {/* Main Campaign Content (depending on view mode) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg mb-xl">
          {filteredCampaigns.map((camp) => (
            <div 
              key={camp.id}
              onClick={() => {
                setSelectedCampaign(camp);
                setDetailsTab('OVERVIEW');
              }}
              className="bg-white rounded-xl soft-shadow overflow-hidden flex flex-col group cursor-pointer border border-outline-variant/30 hover:border-primary/50 transition-colors"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full bg-surface-container-highest">
                <img 
                  alt={camp.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={camp.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded font-label-caps text-[10px] text-primary">{camp.type}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1 shadow-sm ${
                    camp.status === 'ACTIVE' ? 'bg-secondary-fixed text-on-secondary-fixed font-bold' :
                    camp.status === 'UPCOMING' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    camp.status === 'DRAFT' ? 'bg-[#EFF2EE] text-on-surface-variant/80' :
                    'bg-[#C5C8B8] text-white'
                  }`}>
                    {camp.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                    {camp.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="text-white">
                    <div className="flex items-center gap-1 font-body-sm text-body-sm mb-1 opacity-90 text-xs">
                      <span className="material-symbols-outlined text-[16px] text-white/80">location_on</span> {camp.hospital}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-md flex-grow flex flex-col">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-1 font-bold group-hover:text-primary transition-colors">{camp.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
                  {new Date(camp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(camp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="flex gap-2 mb-lg">
                  {camp.bloodGroups.map((g, idx) => (
                    <span key={idx} className="px-2 py-1 bg-surface-container-highest text-on-surface rounded font-label-caps text-[10px]">{g}</span>
                  ))}
                </div>

                {/* Progress bars */}
                <div className="mt-auto">
                  <div className="flex justify-between font-body-sm text-body-sm mb-2 text-xs">
                    <span className="text-on-surface-variant">Donors Registered</span>
                    <span className="font-bold text-primary">{camp.donorsRegistered} / {camp.donorsTarget}</span>
                  </div>
                  <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden mb-4">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (camp.donorsRegistered / (camp.donorsTarget || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  
                  {/* Grid details footer counts */}
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30 text-center">
                    <div>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold">{camp.donationsCollected}</div>
                      <div className="font-label-caps text-[9px] text-outline">DONATIONS</div>
                    </div>
                    <div className="w-px h-8 bg-outline-variant/30"></div>
                    <div>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold">{camp.daysLeft}</div>
                      <div className="font-label-caps text-[9px] text-outline">DAYS LEFT</div>
                    </div>
                    <div className="w-px h-8 bg-outline-variant/30"></div>
                    <div>
                      <div className="font-headline-sm text-headline-sm text-secondary font-bold">{camp.engagement}%</div>
                      <div className="font-label-caps text-[9px] text-outline">ENGAGEMENT</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View details button footer */}
              <div className="bg-surface-container-low px-md py-sm flex justify-between items-center border-t border-outline-variant/30">
                <button className="font-label-caps text-label-caps text-primary hover:text-secondary transition-colors text-[11px] font-bold">VIEW DETAILS</button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast(`Quick configurations for ${camp.title}`);
                  }}
                  className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-variant/50 transition-colors"
                >
                  <span className="material-symbols-outlined block text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm mb-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EFF2EE] text-on-surface border-b border-outline-variant/30 text-xs font-bold font-label-caps">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Progress</th>
                <th className="p-4 text-center">Engagement</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((camp) => (
                <tr 
                  key={camp.id}
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setDetailsTab('OVERVIEW');
                  }}
                  className="border-b border-outline-variant/15 hover:bg-[#F4F7F0]/30 transition-colors cursor-pointer text-sm text-on-surface font-dmsans"
                >
                  <td className="p-4">
                    <div className="font-bold text-on-surface leading-tight">{camp.title}</div>
                    <div className="text-xs text-outline mt-0.5">ID: #0{camp.id}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-on-surface-variant">
                    {camp.hospital}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold font-label-caps px-2 py-0.5 bg-surface-container-highest text-primary rounded">
                      {camp.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-label-caps inline-flex items-center gap-1 ${
                      camp.status === 'ACTIVE' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      camp.status === 'UPCOMING' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                      camp.status === 'DRAFT' ? 'bg-[#EFF2EE] text-on-surface-variant/80' :
                      'bg-[#C5C8B8] text-white'
                    }`}>
                      {camp.status === 'ACTIVE' && <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>}
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant font-medium">
                    {new Date(camp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(camp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 w-44">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-primary">{camp.donorsRegistered}/{camp.donorsTarget}</span>
                      <span className="text-outline">{Math.round((camp.donorsRegistered / (camp.donorsTarget || 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E8EDE5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (camp.donorsRegistered / (camp.donorsTarget || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-[#121c2a]">
                    {camp.engagement}%
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedCampaign(camp);
                          setDetailsTab('OVERVIEW');
                        }}
                        className="px-3 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-colors"
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => showToast(`Config action for ${camp.title}`)}
                        className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-variant/50 transition-colors"
                      >
                        <span className="material-symbols-outlined block text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 mb-xl flex flex-col">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-[#121c2a] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
              <span>May 2026</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span> Upcoming</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span> Ended</span>
            </div>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 border border-[#C5C8B8]/30 rounded-xl overflow-hidden">
            {/* Weekdays Labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-[#EFF2EE] text-center p-3 text-xs font-bold font-label-caps text-on-surface-variant border-b border-[#C5C8B8]/30">
                {d}
              </div>
            ))}

            {/* Calendar Days cells */}
            {calendarDays.map((cell, idx) => {
              // Find matching campaigns spanning this day
              const dayCampaigns = campaigns.filter(c => {
                if (c.status === 'DRAFT') return false; // Drafts not scheduled on calendar
                const date = new Date(cell.dateStr);
                const start = new Date(c.startDate);
                const end = new Date(c.endDate);
                return date >= start && date <= end;
              });

              return (
                <div 
                  key={idx} 
                  className="min-h-[100px] border-r border-b border-[#C5C8B8]/15 p-2 relative flex flex-col justify-between hover:bg-[#F4F7F0]/20 transition-colors"
                >
                  <span className={`text-xs font-bold leading-none select-none ${
                    cell.month === 'current' ? 'text-on-surface' : 'text-outline/40'
                  }`}>
                    {cell.dayNum}
                  </span>
                  
                  {/* Render compact lines for active campaigns */}
                  <div className="flex flex-col gap-1 mt-2">
                    {dayCampaigns.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => {
                          setSelectedCampaign(c);
                          setDetailsTab('OVERVIEW');
                        }}
                        className={`text-[9px] font-bold rounded px-1.5 py-0.5 truncate cursor-pointer hover:brightness-95 transition-all text-white ${
                          c.status === 'ACTIVE' ? 'bg-[#3e5219]' :
                          c.status === 'UPCOMING' ? 'bg-[#add461] text-[#131f00]' :
                          'bg-[#75796b]'
                        }`}
                        title={`${c.title} (${c.hospital})`}
                      >
                        {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Sidebar Panel (Slide-in) */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[600px] glass-panel z-50 transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col ${
          selectedCampaign ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="sidebar-panel"
      >
        {selectedCampaign && (
          <>
            {/* Header Banner */}
            <div className="flex-none relative h-64 bg-surface-container-highest">
              <img 
                alt="Hospital view" 
                className="w-full h-full object-cover opacity-85 mix-blend-multiply bg-primary/20" 
                src={selectedCampaign.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-surface-container-lowest"></div>
              
              <button 
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors" 
                onClick={() => setSelectedCampaign(null)}
              >
                <span className="material-symbols-outlined block text-[24px]">close</span>
              </button>
              
              <div className="absolute bottom-6 left-lg right-lg">
                <div className="flex gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full font-label-caps text-[10px] ${
                    selectedCampaign.status === 'ACTIVE' ? 'bg-secondary-fixed text-on-secondary-fixed font-bold' :
                    selectedCampaign.status === 'UPCOMING' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    selectedCampaign.status === 'DRAFT' ? 'bg-[#EFF2EE] text-on-surface-variant' :
                    'bg-[#C5C8B8] text-white'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                  <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded font-label-caps text-[10px] text-primary font-bold">{selectedCampaign.type}</span>
                </div>
                <h2 className="font-display-lg text-display-lg text-[#121c2a] leading-tight font-bold tracking-tight text-3xl">{selectedCampaign.title}</h2>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex-none px-lg pt-4 border-b border-outline-variant/30 bg-white">
              <div className="flex gap-lg">
                <button 
                  onClick={() => setDetailsTab('OVERVIEW')}
                  className={`pb-3 border-b-2 font-label-caps text-label-caps text-xs ${detailsTab === 'OVERVIEW' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  OVERVIEW
                </button>
                <button 
                  onClick={() => setDetailsTab('DONORS')}
                  className={`pb-3 border-b-2 font-label-caps text-label-caps text-xs ${detailsTab === 'DONORS' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  DONORS
                </button>
                <button 
                  onClick={() => setDetailsTab('PERFORMANCE')}
                  className={`pb-3 border-b-2 font-label-caps text-label-caps text-xs ${detailsTab === 'PERFORMANCE' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  PERFORMANCE
                </button>
              </div>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-grow overflow-y-auto p-lg bg-white">
              {detailsTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Quick Stats Strip */}
                  <div className="flex gap-4">
                    <div className="flex-1 card-sage p-4 rounded-xl text-center">
                      <div className="font-headline-sm text-headline-sm text-primary font-bold text-lg">{selectedCampaign.donorsRegistered}</div>
                      <div className="font-label-caps text-[10px] text-on-surface-variant mt-1 font-bold">REGISTERED</div>
                    </div>
                    <div className="flex-1 card-sage p-4 rounded-xl text-center">
                      <div className="font-headline-sm text-headline-sm text-primary font-bold text-lg">{selectedCampaign.donationsCollected}</div>
                      <div className="font-label-caps text-[10px] text-on-surface-variant mt-1 font-bold font-label-caps">DONATED</div>
                    </div>
                    <div className="flex-1 card-sage p-4 rounded-xl text-center">
                      <div className="font-headline-sm text-headline-sm text-primary font-bold text-lg">
                        {selectedCampaign.donationsCollected * 0.45 > 0 ? `${(selectedCampaign.donationsCollected * 0.45).toFixed(1)}L` : '0L'}
                      </div>
                      <div className="font-label-caps text-[10px] text-on-surface-variant mt-1 font-bold">COLLECTED</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Target Location & Info</h4>
                    <div className="bg-[#F4F7F0] p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2 text-sm text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">local_hospital</span>
                        <span className="font-semibold">{selectedCampaign.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                        <span>
                          {new Date(selectedCampaign.startDate).toLocaleDateString()} to {new Date(selectedCampaign.endDate).toLocaleDateString()} 
                          ({selectedCampaign.daysLeft} days left)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">bloodtype</span>
                        <span className="flex gap-1.5">
                          {selectedCampaign.bloodGroups.map((g, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded text-xs border border-[#C5C8B8]/30 font-semibold">{g}</span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4 text-base">Recent Activity</h4>
                    <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C5C8B8]/30">
                      {campaignActivities.map((act) => (
                        <div key={act.id} className="relative flex gap-4 items-start">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white text-white shadow-sm shrink-0 z-10 ${
                            act.isActive ? 'bg-primary' : 'bg-outline-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                          </div>
                          <div className="flex-grow p-4 rounded-xl border border-outline-variant/30 bg-[#F4F7F0]/40 soft-shadow">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="font-label-caps text-label-caps text-on-surface text-xs font-bold">{act.title}</div>
                              <time className="font-body-sm text-[11px] text-outline font-semibold">{act.time}</time>
                            </div>
                            <div className="text-body-sm text-on-surface-variant text-xs">{act.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'DONORS' && (
                <div className="space-y-4">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base mb-2">Registered Donors</h4>
                  
                  {campaignDonors.length === 0 ? (
                    <div className="text-center p-8 text-on-surface-variant text-sm">No donors registered for this campaign yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {campaignDonors.map((donor) => (
                        <div key={donor.id} className="flex justify-between items-center p-3 border border-outline-variant/30 rounded-xl hover:bg-[#F4F7F0]/20 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {donor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-on-surface">{donor.name}</div>
                              <div className="text-xs text-outline font-medium">Registered: {donor.registeredAt}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-surface-container-highest text-primary rounded font-bold text-[10px]">
                              {donor.bloodGroup}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              donor.status === 'Donated' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                              donor.status === 'Confirmed' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                              'bg-surface-variant text-outline'
                            }`}>
                              {donor.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailsTab === 'PERFORMANCE' && (
                <div className="space-y-6">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base mb-2">Performance Analytics</h4>
                  
                  {/* Target Goal comparison bar charts */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between font-body-sm text-body-sm text-xs font-semibold mb-1">
                        <span className="text-on-surface-variant">Donor Recruitment Efficiency</span>
                        <span className="text-primary font-bold">{Math.round((selectedCampaign.donorsRegistered / (selectedCampaign.donorsTarget || 1)) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-[#E8EDE5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min(100, (selectedCampaign.donorsRegistered / (selectedCampaign.donorsTarget || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-body-sm text-body-sm text-xs font-semibold mb-1">
                        <span className="text-on-surface-variant">Donation Turnout Rate</span>
                        <span className="text-primary font-bold">
                          {selectedCampaign.donorsRegistered > 0 ? Math.round((selectedCampaign.donationsCollected / selectedCampaign.donorsRegistered) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-3 w-full bg-[#E8EDE5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full" 
                          style={{ width: `${selectedCampaign.donorsRegistered > 0 ? Math.min(100, (selectedCampaign.donationsCollected / selectedCampaign.donorsRegistered) * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-[#F4F7F0] p-4 rounded-xl border border-outline-variant/30 flex justify-between items-center mt-6">
                      <div className="text-left">
                        <div className="font-headline-md text-headline-md text-primary font-bold">{selectedCampaign.engagement}%</div>
                        <div className="text-xs text-outline font-semibold uppercase mt-0.5">Engagement Rate</div>
                      </div>
                      <div className="w-1/2 bg-white/70 h-1.5 rounded-full overflow-hidden relative">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${selectedCampaign.engagement}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Sticky Actions Footer */}
            <div className="flex-none p-lg border-t border-outline-variant/30 bg-white flex gap-4">
              <button 
                onClick={() => showToast(`Campaign edit window triggered for ${selectedCampaign.title}`)}
                className="flex-1 py-3 rounded-lg border border-outline-variant text-on-surface font-label-caps text-label-caps text-xs font-bold hover:bg-surface-variant/20 transition-colors"
              >
                EDIT CAMPAIGN
              </button>
              <button 
                onClick={() => showToast(`🚨 Broadcast alerts updated and sent for ${selectedCampaign.title}!`)}
                className="flex-1 py-3 rounded-lg btn-primary-grad text-white font-label-caps text-label-caps text-xs font-bold transition-all shadow-md"
              >
                BROADCAST UPDATE
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Modal (Hidden by default) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" id="create-modal">
          <div 
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" 
            onClick={() => setCreateModalOpen(false)}
          ></div>
          
          <form 
            onSubmit={handleCreateSubmit}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-fade-in-up"
          >
            {/* Modal Header */}
            <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]/60">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">Create New Campaign</h2>
              <button 
                type="button"
                className="text-on-surface-variant hover:text-primary block" 
                onClick={() => setCreateModalOpen(false)}
              >
                <span className="material-symbols-outlined block text-[24px]">close</span>
              </button>
            </div>

            <div className="p-lg flex-grow overflow-y-auto max-h-[70vh]">
              {/* Stepper progress indicator */}
              <div className="flex items-center justify-between mb-xl relative before:absolute before:top-1/2 before:left-0 before:right-0 before:h-0.5 before:bg-outline-variant/30 before:-z-10 z-10">
                <div 
                  onClick={() => setCreateStep(1)}
                  className="flex flex-col items-center bg-white px-3 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                    createStep >= 1 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    1
                  </div>
                  <span className={`font-label-caps text-[10px] font-bold ${createStep >= 1 ? 'text-primary' : 'text-outline'}`}>BASIC INFO</span>
                </div>
                <div 
                  onClick={() => setCreateStep(2)}
                  className={`flex flex-col items-center bg-white px-3 cursor-pointer ${createStep < 2 ? 'opacity-60' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                    createStep >= 2 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    2
                  </div>
                  <span className={`font-label-caps text-[10px] font-bold ${createStep >= 2 ? 'text-primary' : 'text-outline'}`}>AUDIENCE</span>
                </div>
                <div 
                  onClick={() => setCreateStep(3)}
                  className={`flex flex-col items-center bg-white px-3 cursor-pointer ${createStep < 3 ? 'opacity-60' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                    createStep >= 3 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    3
                  </div>
                  <span className={`font-label-caps text-[10px] font-bold ${createStep >= 3 ? 'text-primary' : 'text-outline'}`}>GOALS</span>
                </div>
              </div>

              {/* Form Content Steps */}
              {createStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Campaign Name *</label>
                    <input 
                      required
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm" 
                      placeholder="e.g. Summer Blood Drive" 
                      type="text"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Campaign Type</label>
                      <select 
                        value={newCampaign.type}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm"
                      >
                        <option>Emergency Response</option>
                        <option>Routine Drive</option>
                        <option>Awareness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Target Hospital / Bank</label>
                      <select 
                        value={newCampaign.hospital}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, hospital: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm"
                      >
                        <option>Metro General Hospital</option>
                        <option>City Blood Center</option>
                        <option>University Medical Center</option>
                        <option>County Trauma Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Description</label>
                    <textarea 
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm" 
                      placeholder="Describe the purpose and urgency..." 
                      rows={4}
                    ></textarea>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-3 text-xs font-bold">Target Blood Groups</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['ANY', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((group) => {
                        const active = newCampaign.bloodGroups.includes(group);
                        return (
                          <button
                            type="button"
                            key={group}
                            onClick={() => {
                              if (group === 'ANY') {
                                setNewCampaign(prev => ({ ...prev, bloodGroups: ['ANY'] }));
                              } else {
                                const current = newCampaign.bloodGroups.filter(g => g !== 'ANY');
                                const updated = current.includes(group)
                                  ? current.filter(g => g !== group)
                                  : [...current, group];
                                setNewCampaign(prev => ({ ...prev, bloodGroups: updated.length === 0 ? ['ANY'] : updated }));
                              }
                            }}
                            className={`py-3 rounded-lg border font-bold text-sm text-center transition-all ${
                              active 
                                ? 'bg-primary border-primary text-white shadow-sm' 
                                : 'bg-[#F4F7F0]/30 border-outline-variant text-on-surface-variant hover:bg-[#F4F7F0]/85'
                            }`}
                          >
                            {group}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#F4F7F0]/40 p-4 rounded-xl border border-outline-variant/30">
                    <h4 className="text-xs font-bold text-on-surface mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                      Broadcast Channels
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Eligible donors matching these groups within a 15km radius of the target hospital will be notified via SMS and email immediately upon launching this campaign.
                    </p>
                  </div>
                </div>
              )}

              {createStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Target Donor Volume *</label>
                    <input 
                      required
                      type="number"
                      value={newCampaign.targetDonors}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, targetDonors: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm"
                      placeholder="e.g. 200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">Start Date *</label>
                      <input 
                        required
                        type="date"
                        value={newCampaign.startDate}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-xs font-bold">End Date *</label>
                      <input 
                        required
                        type="date"
                        value={newCampaign.endDate}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-[#DDE5D3]/60 p-4 rounded-xl border border-[#C7D2C0]/50">
                    <h4 className="text-xs font-bold text-primary mb-1">Configuration Overview</h4>
                    <p className="text-xs text-on-surface-variant">
                      This campaign will start immediately upon arrival at its scheduled window. High emergency alerts will be triggered if the type matches emergency criteria.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-lg py-md border-t border-outline-variant/30 flex justify-between bg-[#EFF2EE]/60">
              <button 
                type="button"
                className="px-6 py-2 rounded-lg font-label-caps text-label-caps text-xs font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                onClick={() => {
                  if (createStep > 1) {
                    setCreateStep(prev => prev - 1);
                  } else {
                    setCreateModalOpen(false);
                  }
                }}
              >
                {createStep > 1 ? 'BACK' : 'CANCEL'}
              </button>
              
              {createStep < 3 ? (
                <button 
                  type="button"
                  onClick={() => {
                    if (createStep === 1 && !newCampaign.title) {
                      showToast('❌ Please fill in the Campaign Name.');
                      return;
                    }
                    setCreateStep(prev => prev + 1);
                  }}
                  className="px-6 py-2.5 rounded-lg btn-primary-grad text-white font-label-caps text-label-caps text-xs font-bold transition-all shadow-md"
                >
                  NEXT STEP
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-lg btn-primary-grad text-white font-label-caps text-label-caps text-xs font-bold transition-all shadow-md"
                >
                  CREATE CAMPAIGN
                </button>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
