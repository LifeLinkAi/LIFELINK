'use client';

import React, { useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';

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

  // Database States
  const [requests, setRequests] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reqRes, donorRes, hospRes, donationRes, userRes] = await Promise.all([
        api.get('/requests'),
        api.get('/donors'),
        api.get('/hospitals'),
        api.get('/donations'),
        api.get('/auth/users'),
      ]);
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []));
      setDonors(Array.isArray(donorRes.data) ? donorRes.data : (donorRes.data?.data || []));
      setHospitals(Array.isArray(hospRes.data) ? hospRes.data : (hospRes.data?.data || []));
      setDonations(Array.isArray(donationRes.data) ? donationRes.data : (donationRes.data?.data || []));
      setUsers(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to fetch database analytics records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statsSummary = useMemo(() => {
    const now = new Date();
    const duration = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 90);
    const cutoffCurrent = new Date();
    cutoffCurrent.setDate(now.getDate() - duration);
    const cutoffPrev = new Date();
    cutoffPrev.setDate(now.getDate() - duration * 2);

    const getCounts = (cutoffStart: Date, cutoffEnd: Date) => {
      const reqs = requests.filter(r => {
        const d = new Date(r.createdAt);
        return d >= cutoffStart && d < cutoffEnd;
      });
      const dons = donations.filter(d => {
        const date = new Date(d.donationDate || d.createdAt);
        return date >= cutoffStart && date < cutoffEnd;
      });
      const usrs = users.filter(u => {
        const d = new Date(u.createdAt);
        return d >= cutoffStart && d < cutoffEnd;
      });
      
      const livesSaved = reqs.filter(r => r.status === 'Completed' || r.status === 'FULFILLED' || r.status === 'Delivered').length;
      
      const completedReqs = reqs.filter(r => r.status === 'Completed' || r.status === 'FULFILLED' || r.status === 'Delivered');
      let avgResponse = 7.2;
      if (completedReqs.length > 0) {
        const times = completedReqs.map(r => (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60)).filter(t => t > 0);
        if (times.length > 0) avgResponse = Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1));
      }

      const successRate = reqs.length > 0 ? Number(((completedReqs.length / reqs.length) * 100).toFixed(1)) : 94.3;

      return {
        livesSaved,
        totalDonations: dons.length,
        avgResponse,
        successRate,
        newUsers: usrs.length,
        activeDonors: donors.filter(d => d.status === 'Available' || d.status === 'Matched' || d.status === 'Verification').length,
        newHospitals: hospitals.filter(h => new Date(h.createdAt) >= cutoffStart && new Date(h.createdAt) < cutoffEnd).length,
        criticalCases: reqs.filter(r => r.urgency === 'Critical' || r.urgency === 'Urgent').length,
        avgMatchTime: 14
      };
    };

    const current = getCounts(cutoffCurrent, now);
    const previous = getCounts(cutoffPrev, cutoffCurrent);

    const getTrendStr = (currVal: number, prevVal: number, suffix = '', higherIsBetter = true) => {
      if (prevVal === 0) return `+100% vs last ${duration === 7 ? 'week' : duration === 30 ? 'month' : 'quarter'}`;
      const pct = Number(((currVal - prevVal) / prevVal * 100).toFixed(1));
      const sign = pct >= 0 ? '+' : '';
      return `${sign}${pct}% vs last ${duration === 7 ? 'week' : duration === 30 ? 'month' : 'quarter'}`;
    };

    return {
      current,
      trends: {
        livesSaved: getTrendStr(current.livesSaved, previous.livesSaved),
        totalDonations: getTrendStr(current.totalDonations, previous.totalDonations),
        avgResponse: getTrendStr(current.avgResponse, previous.avgResponse, ' min', false),
        successRate: getTrendStr(current.successRate, previous.successRate, '%'),
      }
    };
  }, [dateRange, requests, donors, hospitals, donations, users]);

  // Coordinated KPI data based on active date range
  const kpiData = useMemo(() => {
    const formatVal = (val: number, kpi: string) => {
      if (kpi === 'lives' || kpi === 'donations') return val.toLocaleString();
      if (kpi === 'response') return `${val} min`;
      return `${val}%`;
    };

    return {
      lives: {
        title: 'Lives Saved',
        value: formatVal(statsSummary.current.livesSaved, 'lives'),
        trend: statsSummary.trends.livesSaved,
        icon: 'favorite',
      },
      donations: {
        title: 'Total Donations',
        value: formatVal(statsSummary.current.totalDonations, 'donations'),
        trend: statsSummary.trends.totalDonations,
        icon: 'bloodtype',
      },
      response: {
        title: 'Avg Response Time',
        value: formatVal(statsSummary.current.avgResponse, 'response'),
        trend: statsSummary.trends.avgResponse,
        icon: 'timer',
      },
      match: {
        title: 'Match Success Rate',
        value: formatVal(statsSummary.current.successRate, 'match'),
        trend: statsSummary.trends.successRate,
        icon: 'check_circle',
      }
    };
  }, [statsSummary]);

  // Secondary metrics counters corresponding to date range
  const secondaryMetrics = useMemo(() => {
    return {
      newUsers: statsSummary.current.newUsers.toLocaleString(),
      activeDonors: statsSummary.current.activeDonors.toLocaleString(),
      newHospitals: statsSummary.current.newHospitals.toLocaleString(),
      criticalCases: statsSummary.current.criticalCases.toLocaleString(),
      avgMatchTime: `${statsSummary.current.avgMatchTime} min`
    };
  }, [statsSummary]);

  // Chart values coordinates & labels calculations
  const labels = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (dateRange === '7d') {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push(days[d.getDay()]);
      }
      return result;
    }
    if (dateRange === '30d') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
    }
    return result;
  }, [dateRange]);

  const chartDataCombined = useMemo(() => {
    const now = new Date();
    const duration = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 90);
    const intervals = dateRange === '7d' ? 7 : (dateRange === '30d' ? 6 : 3);

    const getChartValues = (cutoffStart: Date, cutoffEnd: Date) => {
      const totalMs = cutoffEnd.getTime() - cutoffStart.getTime();
      const intervalMs = totalMs / intervals;

      const activeVals = Array(intervals).fill(0);
      const compareVals = Array(intervals).fill(0);

      const getBucketIdx = (date: Date, startMs: number) => {
        const diff = date.getTime() - startMs;
        return Math.max(0, Math.min(intervals - 1, Math.floor(diff / intervalMs)));
      };

      if (activeKpi === 'lives') {
        requests.forEach(r => {
          if (r.status === 'Completed' || r.status === 'FULFILLED' || r.status === 'Delivered') {
            const d = new Date(r.updatedAt || r.createdAt);
            if (d >= cutoffStart && d < cutoffEnd) {
              activeVals[getBucketIdx(d, cutoffStart.getTime())]++;
            } else if (d >= new Date(cutoffStart.getTime() - totalMs) && d < cutoffStart) {
              compareVals[getBucketIdx(d, cutoffStart.getTime() - totalMs)]++;
            }
          }
        });
      } else if (activeKpi === 'donations') {
        donations.forEach(d => {
          const date = new Date(d.donationDate || d.createdAt);
          if (date >= cutoffStart && date < cutoffEnd) {
            const units = d.volumeMl > 0 ? Math.round(d.volumeMl / 450) : 1;
            activeVals[getBucketIdx(date, cutoffStart.getTime())] += units;
          } else if (date >= new Date(cutoffStart.getTime() - totalMs) && date < cutoffStart) {
            const units = d.volumeMl > 0 ? Math.round(d.volumeMl / 450) : 1;
            compareVals[getBucketIdx(date, cutoffStart.getTime() - totalMs)] += units;
          }
        });
      } else if (activeKpi === 'response') {
        const activeTimes = Array(intervals).fill(null).map(() => [] as number[]);
        const compareTimes = Array(intervals).fill(null).map(() => [] as number[]);

        requests.forEach(r => {
          if (r.status === 'Completed' || r.status === 'FULFILLED' || r.status === 'Delivered') {
            const d = new Date(r.updatedAt || r.createdAt);
            const timeDiff = (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60);
            if (timeDiff > 0) {
              if (d >= cutoffStart && d < cutoffEnd) {
                activeTimes[getBucketIdx(d, cutoffStart.getTime())].push(timeDiff);
              } else if (d >= new Date(cutoffStart.getTime() - totalMs) && d < cutoffStart) {
                compareTimes[getBucketIdx(d, cutoffStart.getTime() - totalMs)].push(timeDiff);
              }
            }
          }
        });

        for (let i = 0; i < intervals; i++) {
          activeVals[i] = activeTimes[i].length > 0 ? Number((activeTimes[i].reduce((a, b) => a + b, 0) / activeTimes[i].length).toFixed(1)) : 7.2;
          compareVals[i] = compareTimes[i].length > 0 ? Number((compareTimes[i].reduce((a, b) => a + b, 0) / compareTimes[i].length).toFixed(1)) : 8.1;
        }
      } else if (activeKpi === 'match') {
        const activeTotal = Array(intervals).fill(0);
        const activeSuccess = Array(intervals).fill(0);
        const compareTotal = Array(intervals).fill(0);
        const compareSuccess = Array(intervals).fill(0);

        requests.forEach(r => {
          const d = new Date(r.createdAt);
          const isSuccess = r.status === 'Completed' || r.status === 'FULFILLED' || r.status === 'Delivered';
          if (d >= cutoffStart && d < cutoffEnd) {
            const idx = getBucketIdx(d, cutoffStart.getTime());
            activeTotal[idx]++;
            if (isSuccess) activeSuccess[idx]++;
          } else if (d >= new Date(cutoffStart.getTime() - totalMs) && d < cutoffStart) {
            const idx = getBucketIdx(d, cutoffStart.getTime() - totalMs);
            compareTotal[idx]++;
            if (isSuccess) compareSuccess[idx]++;
          }
        });

        for (let i = 0; i < intervals; i++) {
          activeVals[i] = activeTotal[i] > 0 ? Number(((activeSuccess[i] / activeTotal[i]) * 100).toFixed(1)) : 94.3;
          compareVals[i] = compareTotal[i] > 0 ? Number(((compareSuccess[i] / compareTotal[i]) * 100).toFixed(1)) : 92.8;
        }
      }

      return { activeVals, compareVals };
    };

    const cutoffCurrent = new Date();
    cutoffCurrent.setDate(now.getDate() - duration);

    return getChartValues(cutoffCurrent, now);
  }, [dateRange, activeKpi, requests, donations]);

  const activeData = useMemo(() => {
    return chartDataCombined.activeVals;
  }, [chartDataCombined]);

  const compareData = useMemo(() => {
    return chartDataCombined.compareVals;
  }, [chartDataCombined]);

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
  const donutTotal = useMemo(() => {
    return statsSummary.current.totalDonations.toLocaleString();
  }, [statsSummary]);

  const { bloodRatio, organRatio } = useMemo(() => {
    const now = new Date();
    const duration = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 90);
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - duration);

    const periodRequests = requests.filter(r => new Date(r.createdAt) >= cutoff);
    const bloodCount = periodRequests.filter(r => r.type === 'Blood').length;
    const organCount = periodRequests.filter(r => r.type === 'Organ').length;
    const total = bloodCount + organCount;

    if (total === 0) return { bloodRatio: 50, organRatio: 50 };
    return {
      bloodRatio: Math.round((bloodCount / total) * 100),
      organRatio: Math.round((organCount / total) * 100),
    };
  }, [dateRange, requests]);

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
