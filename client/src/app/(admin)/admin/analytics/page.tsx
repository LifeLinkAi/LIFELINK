'use client';

import React, { useState, useMemo } from 'react';

export default function AnalyticsPage() {
  // Navigation & Interactive state hooks
  const [activeKpi, setActiveKpi] = useState<'lives' | 'donations' | 'response' | 'match'>('lives');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [compareMode, setCompareMode] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  
  // Custom interactive tooltip state for chart hover
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: string;
    compareValue?: string;
  } | null>(null);

  // Toast feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Coordinated KPI data based on active date range
  const kpiData = useMemo(() => {
    const is7d = dateRange === '7d';
    const is30d = dateRange === '30d';
    
    return {
      lives: {
        title: 'Lives Saved',
        value: is7d ? '3,102' : is30d ? '12,847' : '38,241',
        trend: is7d ? '+5.2% vs last week' : is30d ? '+18.4% vs last month' : '+22.8% vs last quarter',
        icon: 'favorite',
        splineClass: 'mock-spline mock-spline-up'
      },
      donations: {
        title: 'Total Donations',
        value: is7d ? '2,014' : is30d ? '8,421' : '25,184',
        trend: is7d ? '+4.1% vs last week' : is30d ? '+12.5% vs last month' : '+15.3% vs last quarter',
        icon: 'bloodtype',
        splineClass: 'mock-spline'
      },
      response: {
        title: 'Avg Response Time',
        value: is7d ? '6.8 min' : is30d ? '7.2 min' : '8.1 min',
        trend: is7d ? '-0.4 min vs last week' : is30d ? '-2.1 min vs last month' : '-1.5 min vs last quarter',
        icon: 'timer',
        splineClass: 'mock-spline'
      },
      match: {
        title: 'Match Success Rate',
        value: is7d ? '95.1%' : is30d ? '94.3%' : '92.8%',
        trend: is7d ? '+1.8% vs last week' : is30d ? '+3.2% vs last month' : '+4.5% vs last quarter',
        icon: 'check_circle',
        splineClass: 'mock-spline'
      }
    };
  }, [dateRange]);

  // Secondary metrics counters corresponding to date range
  const secondaryMetrics = useMemo(() => {
    if (dateRange === '7d') {
      return {
        newUsers: '432',
        activeDonors: '892',
        newHospitals: '3',
        criticalCases: '54',
        avgMatchTime: '12 min'
      };
    }
    if (dateRange === '30d') {
      return {
        newUsers: '1,847',
        activeDonors: '3,254',
        newHospitals: '14',
        criticalCases: '218',
        avgMatchTime: '14 min'
      };
    }
    // 90d
    return {
      newUsers: '5,420',
      activeDonors: '9,842',
      newHospitals: '38',
      criticalCases: '642',
      avgMatchTime: '16 min'
    };
  }, [dateRange]);

  // Chart values coordinates & labels calculations
  const labels = useMemo(() => {
    if (dateRange === '7d') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    if (dateRange === '30d') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    }
    return ['Mar 2026', 'Apr 2026', 'May 2026'];
  }, [dateRange]);

  const activeData = useMemo(() => {
    if (dateRange === '7d') {
      if (activeKpi === 'lives') return [350, 420, 390, 510, 480, 560, 392];
      if (activeKpi === 'donations') return [210, 290, 250, 320, 300, 340, 304];
      if (activeKpi === 'response') return [7.6, 7.4, 7.2, 7.1, 7.0, 6.9, 6.8];
      return [93.5, 94.0, 94.2, 94.5, 94.8, 95.0, 95.1];
    }
    if (dateRange === '30d') {
      if (activeKpi === 'lives') return [1200, 1800, 1600, 2400, 2100, 3747];
      if (activeKpi === 'donations') return [800, 1100, 1300, 1200, 1800, 2221];
      if (activeKpi === 'response') return [9.5, 8.8, 8.2, 7.8, 7.5, 7.2];
      return [90.1, 91.5, 92.2, 93.0, 93.8, 94.3];
    }
    // 90d
    if (activeKpi === 'lives') return [10500, 12200, 15541];
    if (activeKpi === 'donations') return [7100, 8500, 9584];
    if (activeKpi === 'response') return [9.1, 8.5, 8.1];
    return [89.5, 91.2, 92.8];
  }, [dateRange, activeKpi]);

  const compareData = useMemo(() => {
    if (activeKpi === 'response') {
      return activeData.map(v => Number((v * 1.15).toFixed(1)));
    }
    return activeData.map(v => Math.round(v * 0.82));
  }, [activeData, activeKpi]);

  // SVG dimensions for dynamic drawing
  const width = 700;
  const height = 230;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const minVal = useMemo(() => {
    const combined = compareMode ? [...activeData, ...compareData] : activeData;
    return Math.min(...combined) * 0.95;
  }, [activeData, compareData, compareMode]);

  const maxVal = useMemo(() => {
    const combined = compareMode ? [...activeData, ...compareData] : activeData;
    return Math.max(...combined) * 1.05;
  }, [activeData, compareData, compareMode]);

  // Compute active line coordinate points
  const activePoints = useMemo(() => {
    return activeData.map((val, i) => {
      const x = paddingLeft + (i / (activeData.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - ((val - minVal) / (maxVal - minVal || 1)) * innerHeight;
      return { x, y, value: val };
    });
  }, [activeData, minVal, maxVal, innerWidth, innerHeight]);

  // Compute comparison line coordinate points
  const comparePoints = useMemo(() => {
    return compareData.map((val, i) => {
      const x = paddingLeft + (i / (compareData.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - ((val - minVal) / (maxVal - minVal || 1)) * innerHeight;
      return { x, y, value: val };
    });
  }, [compareData, minVal, maxVal, innerWidth, innerHeight]);

  // Line paths generator
  const activeLinePath = useMemo(() => {
    return activePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [activePoints]);

  const activeAreaPath = useMemo(() => {
    if (activePoints.length === 0) return '';
    return `${activeLinePath} L ${activePoints[activePoints.length - 1].x} ${height - paddingBottom} L ${activePoints[0].x} ${height - paddingBottom} Z`;
  }, [activePoints, activeLinePath, paddingBottom]);

  const compareLinePath = useMemo(() => {
    return comparePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [comparePoints]);

  // Value formatting helper
  const formatValue = (val: number, kpi: string) => {
    if (kpi === 'lives' || kpi === 'donations') {
      return val.toLocaleString();
    }
    if (kpi === 'response') {
      return `${val} min`;
    }
    if (kpi === 'match') {
      return `${val}%`;
    }
    return val.toString();
  };

  // Response speed metrics progress levels
  const speedMetrics = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: 'Urban Areas', speed: '5.1 min', percent: '90%' },
        { label: 'Suburban Areas', speed: '7.6 min', percent: '70%' },
        { label: 'Rural Areas', speed: '12.8 min', percent: '45%' }
      ];
    }
    if (dateRange === '30d') {
      return [
        { label: 'Urban Areas', speed: '5.4 min', percent: '85%' },
        { label: 'Suburban Areas', speed: '8.1 min', percent: '65%' },
        { label: 'Rural Areas', speed: '14.2 min', percent: '40%' }
      ];
    }
    return [
      { label: 'Urban Areas', speed: '5.9 min', percent: '80%' },
      { label: 'Suburban Areas', speed: '8.8 min', percent: '60%' },
      { label: 'Rural Areas', speed: '15.8 min', percent: '35%' }
    ];
  }, [dateRange]);

  // Donut chart units based on timeframe
  const donutTotal = dateRange === '7d' ? '2.0k' : dateRange === '30d' ? '8.4k' : '25.2k';
  const bloodRatio = 70;
  const organRatio = 30;

  // Actions
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('📊 Analytics report link copied to clipboard!');
    }
  };

  const handleExport = () => {
    showToast('📥 Generating analytics PDF report...');
    setTimeout(() => {
      showToast('✅ LifeLink Analytics Report exported successfully!');
    }, 1500);
  };

  return (
    <div className="-mx-6 md:-mx-10 -my-6 md:-my-10 p-6 md:p-10 bg-[#F5F1E8] min-h-screen relative select-none">
      
      {/* Inline styles for custom elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(199, 210, 192, 0.5); /* C7D2C0 */
            box-shadow: 0 8px 30px rgba(85, 107, 47, 0.04);
        }
        .gradient-primary {
            background: linear-gradient(135deg, #14291F 0%, #3e5219 100%);
        }
        .gradient-accent {
            background: linear-gradient(135deg, #b6d088 0%, #c8f17a 100%);
        }
        .chart-grid {
            background-image: linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        
        /* Smooth Spline Chart Mockups CSS */
        .mock-spline {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }
        .mock-spline::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60%;
            background: linear-gradient(to top, rgba(182, 208, 136, 0.2), transparent);
            border-top: 2px solid #3e5219;
            border-radius: 50% 50% 0 0 / 20% 80% 0 0;
        }
        .mock-spline-up::before {
            border-radius: 0 100% 0 0 / 0 100% 0 0;
            border-top: 2px solid #b6d088;
        }
      `}} />

      {/* Toast feedback alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14291F] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in-up">
          <span className="material-symbols-outlined text-[20px] text-[#c8f17a]">check_circle</span>
          <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header Actions */}
      <header className="mb-xl flex flex-col lg:flex-row lg:items-end justify-between gap-lg">
        <div className="flex-1">
          <nav className="flex items-center gap-xs font-label-caps text-label-caps text-outline mb-sm text-xs">
            <span>Admin</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Analytics</span>
          </nav>
          <h1 className="font-display-lg text-display-lg text-ll-dark-green mb-xs tracking-tight">Analytics & Insights</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-base">
            Platform-wide performance, trends, and impact across donors, hospitals, and emergencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-sm shrink-0">
          {/* Custom interactive date range selector */}
          <div className="relative">
            <div 
              onClick={() => setDateMenuOpen(!dateMenuOpen)}
              className="flex items-center bg-white rounded-lg border border-outline-variant px-md py-2 shadow-sm cursor-pointer hover:border-primary transition-colors text-sm font-medium text-on-surface"
            >
              <span className="material-symbols-outlined text-outline mr-sm text-[20px]">calendar_month</span>
              <span>
                {dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </span>
              <span className="material-symbols-outlined text-outline ml-sm text-[20px]">arrow_drop_down</span>
            </div>

            {dateMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/60 rounded-xl shadow-xl z-20 py-2">
                <button 
                  onClick={() => { setDateRange('7d'); setDateMenuOpen(false); showToast('Timeframe updated: Last 7 Days'); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#EFF2EE] transition-colors ${dateRange === '7d' ? 'text-primary font-bold bg-[#EFF2EE]/50' : 'text-on-surface-variant'}`}
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => { setDateRange('30d'); setDateMenuOpen(false); showToast('Timeframe updated: Last 30 Days'); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#EFF2EE] transition-colors ${dateRange === '30d' ? 'text-primary font-bold bg-[#EFF2EE]/50' : 'text-on-surface-variant'}`}
                >
                  Last 30 Days
                </button>
                <button 
                  onClick={() => { setDateRange('90d'); setDateMenuOpen(false); showToast('Timeframe updated: Last 90 Days'); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#EFF2EE] transition-colors ${dateRange === '90d' ? 'text-primary font-bold bg-[#EFF2EE]/50' : 'text-on-surface-variant'}`}
                >
                  Last 90 Days
                </button>
              </div>
            )}
          </div>

          {/* Compare toggle button */}
          <div 
            onClick={() => {
              setCompareMode(!compareMode);
              showToast(compareMode ? 'Comparison mode disabled' : 'Comparison mode enabled: Overlapping prior period data');
            }}
            className={`flex items-center rounded-lg border px-md py-2 shadow-sm cursor-pointer transition-colors text-sm font-medium ${
              compareMode 
                ? 'bg-[#3e5219] border-[#3e5219] text-white' 
                : 'bg-white border-outline-variant text-on-surface hover:border-primary'
            }`}
          >
            <span className={`material-symbols-outlined mr-sm text-[20px] ${compareMode ? 'text-white' : 'text-outline'}`}>compare_arrows</span>
            <span>Compare</span>
          </div>

          <button 
            onClick={handleShare}
            className="flex items-center justify-center bg-transparent border-2 border-ll-dark-green text-ll-dark-green rounded-lg px-md py-2 font-label-caps text-label-caps hover:bg-ll-dark-green hover:text-white transition-all text-xs"
          >
            <span className="material-symbols-outlined mr-xs text-[18px]">share</span>
            Share Insights
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gradient-primary text-white rounded-lg px-md py-2 font-label-caps text-label-caps shadow-md hover:opacity-90 transition-opacity text-xs"
          >
            <span className="material-symbols-outlined mr-xs text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </header>

      {/* 2. KPI Summary Bento Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-lg">
        {/* Lives Saved Card */}
        <div 
          onClick={() => {
            setActiveKpi('lives');
            showToast('Showing timeline trends for Lives Saved');
          }}
          className={`rounded-2xl p-lg cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
            activeKpi === 'lives'
              ? 'gradient-primary text-white shadow-lg ring-2 ring-primary/20'
              : 'glass-card text-on-surface hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-md relative z-10">
            <h3 className={`font-label-caps text-label-caps ${activeKpi === 'lives' ? 'text-white/80' : 'text-outline'}`}>Lives Saved</h3>
            <span className={`material-symbols-outlined p-xs rounded-md ${activeKpi === 'lives' ? 'bg-white/20 text-white' : 'text-primary bg-primary/10'}`}>favorite</span>
          </div>
          <div className="relative z-10">
            <div className={`font-headline-lg text-headline-lg mb-xs ${activeKpi === 'lives' ? 'text-white' : 'text-on-surface'}`}>
              {kpiData.lives.value}
            </div>
            <div className={`flex items-center gap-xs font-body-sm text-body-sm ${activeKpi === 'lives' ? 'text-inverse-primary' : 'text-primary font-semibold'}`}>
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{kpiData.lives.trend}</span>
            </div>
          </div>
          <div className={`h-12 mt-md mock-spline mock-spline-up ${activeKpi === 'lives' ? 'opacity-70' : 'opacity-30'}`}></div>
        </div>

        {/* Total Donations Card */}
        <div 
          onClick={() => {
            setActiveKpi('donations');
            showToast('Showing timeline trends for Total Donations');
          }}
          className={`rounded-2xl p-lg cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
            activeKpi === 'donations'
              ? 'gradient-primary text-white shadow-lg ring-2 ring-primary/20'
              : 'glass-card text-on-surface hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-md relative z-10">
            <h3 className={`font-label-caps text-label-caps ${activeKpi === 'donations' ? 'text-white/80' : 'text-outline'}`}>Total Donations</h3>
            <span className={`material-symbols-outlined p-xs rounded-md ${activeKpi === 'donations' ? 'bg-white/20 text-white' : 'text-primary bg-primary/10'}`}>bloodtype</span>
          </div>
          <div className="relative z-10">
            <div className={`font-headline-lg text-headline-lg mb-xs ${activeKpi === 'donations' ? 'text-white' : 'text-on-surface'}`}>
              {kpiData.donations.value}
            </div>
            <div className={`flex items-center gap-xs font-body-sm text-body-sm ${activeKpi === 'donations' ? 'text-inverse-primary' : 'text-primary font-semibold'}`}>
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{kpiData.donations.trend}</span>
            </div>
          </div>
          <div className={`h-12 mt-md mock-spline ${activeKpi === 'donations' ? 'opacity-70' : 'opacity-30'}`}></div>
        </div>

        {/* Avg Response Time Card */}
        <div 
          onClick={() => {
            setActiveKpi('response');
            showToast('Showing timeline trends for Avg Response Time');
          }}
          className={`rounded-2xl p-lg cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
            activeKpi === 'response'
              ? 'gradient-primary text-white shadow-lg ring-2 ring-primary/20'
              : 'glass-card text-on-surface hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-md relative z-10">
            <h3 className={`font-label-caps text-label-caps ${activeKpi === 'response' ? 'text-white/80' : 'text-outline'}`}>Avg Response Time</h3>
            <span className={`material-symbols-outlined p-xs rounded-md ${activeKpi === 'response' ? 'bg-white/20 text-white' : 'text-primary bg-primary/10'}`}>timer</span>
          </div>
          <div className="relative z-10">
            <div className={`font-headline-lg text-headline-lg mb-xs ${activeKpi === 'response' ? 'text-white' : 'text-on-surface'}`}>
              {kpiData.response.value}
            </div>
            <div className={`flex items-center gap-xs font-body-sm text-body-sm ${activeKpi === 'response' ? 'text-inverse-primary' : 'text-primary font-semibold'}`}>
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>{kpiData.response.trend}</span>
            </div>
          </div>
          <div className={`h-12 mt-md mock-spline ${activeKpi === 'response' ? 'opacity-70' : 'opacity-30'}`} style={{ transform: 'scaleY(-1)' }}></div>
        </div>

        {/* Match Success Rate Card */}
        <div 
          onClick={() => {
            setActiveKpi('match');
            showToast('Showing timeline trends for Match Success Rate');
          }}
          className={`rounded-2xl p-lg cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
            activeKpi === 'match'
              ? 'gradient-primary text-white shadow-lg ring-2 ring-primary/20'
              : 'glass-card text-on-surface hover:bg-white/90 shadow-sm'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-md relative z-10">
            <h3 className={`font-label-caps text-label-caps ${activeKpi === 'match' ? 'text-white/80' : 'text-outline'}`}>Match Success Rate</h3>
            <span className={`material-symbols-outlined p-xs rounded-md ${activeKpi === 'match' ? 'bg-white/20 text-white' : 'text-primary bg-primary/10'}`}>check_circle</span>
          </div>
          <div className="relative z-10">
            <div className={`font-headline-lg text-headline-lg mb-xs ${activeKpi === 'match' ? 'text-white' : 'text-on-surface'}`}>
              {kpiData.match.value}
            </div>
            <div className={`flex items-center gap-xs font-body-sm text-body-sm ${activeKpi === 'match' ? 'text-inverse-primary' : 'text-primary font-semibold'}`}>
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{kpiData.match.trend}</span>
            </div>
          </div>
          <div className={`h-12 mt-md mock-spline ${activeKpi === 'match' ? 'opacity-70' : 'opacity-30'}`}></div>
        </div>
      </section>

      {/* 3. Secondary Metrics Rows */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md mb-xl">
        <div className="bg-[#E8EDE5] rounded-xl p-md border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <span className="font-body-sm text-body-sm text-outline mb-xs text-xs font-medium">New Users</span>
          <span className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-lg">{secondaryMetrics.newUsers}</span>
        </div>
        <div className="bg-[#E8EDE5] rounded-xl p-md border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <span className="font-body-sm text-body-sm text-outline mb-xs text-xs font-medium">Active Donors</span>
          <span className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-lg">{secondaryMetrics.activeDonors}</span>
        </div>
        <div className="bg-[#E8EDE5] rounded-xl p-md border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <span className="font-body-sm text-body-sm text-outline mb-xs text-xs font-medium">New Hospitals</span>
          <span className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-lg">{secondaryMetrics.newHospitals}</span>
        </div>
        {/* Glowing warning color layout for critical metrics */}
        <div className="bg-white rounded-xl p-md border border-[#E5484D]/30 shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 animate-pulse-subtle">
          <span className="font-body-sm text-body-sm text-outline mb-xs text-xs font-medium">Critical Cases</span>
          <span className="font-headline-sm text-headline-sm text-[#E5484D] flex items-center gap-xs font-bold text-lg">
            {secondaryMetrics.criticalCases} <span className="material-symbols-outlined text-[16px] animate-bounce">warning</span>
          </span>
        </div>
        <div className="bg-[#E8EDE5] rounded-xl p-md border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
          <span className="font-body-sm text-body-sm text-outline mb-xs text-xs font-medium">Avg Match Time</span>
          <span className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-lg">{secondaryMetrics.avgMatchTime}</span>
        </div>
      </section>

      {/* 4. Interactive Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
        {/* Primary Dynamic Spline Chart */}
        <div className="glass-card rounded-2xl p-lg lg:col-span-2 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-[#14291F] font-bold">
                {activeKpi === 'lives' && 'Lives Saved Over Time'}
                {activeKpi === 'donations' && 'Donations Logged Over Time'}
                {activeKpi === 'response' && 'Avg Emergency Response Speed'}
                {activeKpi === 'match' && 'Organ Match Success Rates'}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {compareMode ? 'Comparing current period with prior period data' : 'Detailed timeline performance logs'}
              </p>
            </div>
            <button 
              onClick={() => showToast('Timeline data auto-refreshed from central server logs')}
              className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[24px]"
            >
              sync
            </button>
          </div>

          <div className="flex-1 relative chart-grid rounded-lg border border-outline-variant/20 overflow-hidden bg-white/40">
            {/* SVG Plotting */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${width} ${height}`} 
              preserveAspectRatio="none" 
              className="absolute inset-0"
            >
              {/* Horizontal Grid lines */}
              {[0, 1, 2, 3].map((g) => {
                const y = paddingTop + (g / 3) * innerHeight;
                return (
                  <line 
                    key={g} 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="rgba(0,0,0,0.06)" 
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Under Curve Gradient */}
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3e5219" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3e5219" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Draw Area */}
              <path d={activeAreaPath} fill="url(#gradient-area)" />

              {/* Draw Comparison Line (Dashed) */}
              {compareMode && (
                <path 
                  d={compareLinePath} 
                  fill="none" 
                  stroke="#b6d088" 
                  strokeWidth="2.5" 
                  strokeDasharray="5,5" 
                />
              )}

              {/* Draw Main Value Line */}
              <path 
                d={activeLinePath} 
                fill="none" 
                stroke="#3e5219" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Draw Value Dots */}
              {activePoints.map((p, i) => (
                <circle 
                  key={i} 
                  cx={p.x} 
                  cy={p.y} 
                  r={5} 
                  fill="#ffffff" 
                  stroke="#3e5219" 
                  strokeWidth="3"
                />
              ))}

              {/* Hover point overlays & tracking lines */}
              {hoveredPoint && (
                <>
                  <line 
                    x1={hoveredPoint.x} 
                    y1={paddingTop} 
                    x2={hoveredPoint.x} 
                    y2={height - paddingBottom} 
                    stroke="#75796b" 
                    strokeWidth="1" 
                    strokeDasharray="2,2"
                  />
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.y} 
                    r={7} 
                    fill="#3e5219" 
                    stroke="#ffffff" 
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* Interactive invisible columns for smooth hovering tracking */}
              {activePoints.map((p, i) => {
                const colWidth = innerWidth / (activeData.length - 1);
                return (
                  <rect
                    key={i}
                    x={p.x - colWidth / 2}
                    y={paddingTop}
                    width={colWidth}
                    height={innerHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint({
                        x: p.x,
                        y: p.y,
                        label: labels[i],
                        value: formatValue(p.value, activeKpi),
                        compareValue: compareMode ? formatValue(compareData[i], activeKpi) : undefined
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Custom Tooltip Card Overlay inside HTML space */}
            {hoveredPoint && (
              <div 
                className="absolute bg-white border border-[#c5c8b8] shadow-lg rounded-xl p-3 text-xs pointer-events-none transition-all duration-100"
                style={{
                  left: hoveredPoint.x > (width / 2) ? `${(hoveredPoint.x / width) * 100 - 24}%` : `${(hoveredPoint.x / width) * 100 + 2}%`,
                  top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                }}
              >
                <div className="font-bold text-[#121c2a] mb-1">{hoveredPoint.label}</div>
                <div className="flex items-center gap-1 text-[#3e5219] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3e5219]"></span>
                  <span>Active: {hoveredPoint.value}</span>
                </div>
                {compareMode && hoveredPoint.compareValue && (
                  <div className="flex items-center gap-1 text-on-surface-variant/80 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b6d088]"></span>
                    <span>Prior: {hoveredPoint.compareValue}</span>
                  </div>
                )}
              </div>
            )}

            {/* X-Axis labels */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-[54px] font-body-sm text-body-sm text-outline text-xs font-semibold">
              {labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>

          {/* Chart legends */}
          <div className="flex justify-center gap-md mt-sm font-body-sm text-body-sm text-on-surface-variant text-xs font-semibold">
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 rounded-full bg-[#3e5219]"></span> 
              <span>Active Value</span>
            </div>
            {compareMode && (
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full border border-dashed border-[#b6d088] bg-[#b6d088]/20"></span> 
                <span>Prior Period Comparison</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Charts Container column */}
        <div className="flex flex-col gap-lg lg:col-span-1">
          
          {/* Donations by Type (Donut Chart) */}
          <div className="glass-card rounded-2xl p-lg flex-1 flex flex-col min-h-[185px]">
            <h2 className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-base mb-md">Donations by Type</h2>
            
            <div className="flex-1 flex items-center justify-between">
              {/* Dynamic Donut representation using mathematically exact stroke offset math */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg width="112" height="112" viewBox="0 0 42 42" className="donut transform -rotate-90">
                  <circle cx="21" cy="21" r="15.915494309" fill="transparent" stroke="rgba(199, 210, 192, 0.2)" strokeWidth="5"></circle>
                  
                  {/* Blood Segment (70% - starting top, offset 25) */}
                  <circle 
                    cx="21" 
                    cy="21" 
                    r="15.915494309" 
                    fill="transparent" 
                    stroke="#3e5219" 
                    strokeWidth="5" 
                    strokeDasharray={`${bloodRatio} ${100 - bloodRatio}`} 
                    strokeDashoffset="25"
                    className="transition-all duration-500"
                  />
                  
                  {/* Organs Segment (30% - starts where Blood finishes, offset 55) */}
                  <circle 
                    cx="21" 
                    cy="21" 
                    r="15.915494309" 
                    fill="transparent" 
                    stroke="#d6eab2" 
                    strokeWidth="5" 
                    strokeDasharray={`${organRatio} ${100 - organRatio}`} 
                    strokeDashoffset="55"
                    className="transition-all duration-500"
                  />
                </svg>
                
                {/* Central Text Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-md text-headline-md text-[#14291F] text-lg font-bold leading-none">{donutTotal}</span>
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider mt-0.5">Total</span>
                </div>
              </div>

              {/* Legends & metrics */}
              <div className="space-y-sm flex-grow pl-md">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3e5219]"></span>
                    <span className="font-semibold text-on-surface-variant">Blood Units</span>
                  </div>
                  <span className="font-bold text-[#14291F]">70%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d6eab2]"></span>
                    <span className="font-semibold text-on-surface-variant">Organ Donors</span>
                  </div>
                  <span className="font-bold text-[#14291F]">30%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Response Performance (Horizontal Progress bar) */}
          <div className="glass-card rounded-2xl p-lg flex-1 flex flex-col min-h-[185px]">
            <h2 className="font-headline-sm text-headline-sm text-[#14291F] font-bold text-base mb-sm">Response Performance</h2>
            
            <div className="space-y-sm flex-1 flex flex-col justify-center">
              {speedMetrics.map((item, idx) => (
                <div key={idx} className="space-y-xs">
                  <div className="flex justify-between font-body-sm text-body-sm text-xs font-semibold">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="text-[#14291F] font-bold">{item.speed}</span>
                  </div>
                  <div className="h-2 w-full bg-[#E8EDE5] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ 
                        width: item.percent,
                        opacity: idx === 0 ? 1 : idx === 1 ? 0.8 : 0.65
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
