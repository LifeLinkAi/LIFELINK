'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Incident structure for stateful management
interface Incident {
  id: string;
  code: string;
  location: string;
  title: string;
  description: string;
  startTime: number; // in seconds
  eta: string;
  dist: string;
  carrier: string;
  dest: string;
  vitals?: string;
  status: 'CRITICAL' | 'ACTIVE' | 'RESOLVED';
  borderClass: string;
  badgeClass: string;
}

export default function EmergencyHubPage() {
  // 1. Live statistics state with bases
  const [activeEmergencies, setActiveEmergencies] = useState(142);
  const [responders, setResponders] = useState(84);
  const [resolvedToday, setResolvedToday] = useState(392);
  const [criticalCases, setCriticalCases] = useState(18);
  const [escalatedCases, setEscalatedCases] = useState(14);

  // UTC clock & auto-sync state
  const [clockTime, setClockTime] = useState('14:23:45 UTC');
  const [syncSeconds, setSyncSeconds] = useState(0);

  // Modal & Toast states
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Map Filter checkboxes
  const [filters, setFilters] = useState({
    allRegions: true,
    groundUnits: true,
    airUnits: true,
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Map Pin position jitter state
  const [pinsJitter, setPinsJitter] = useState({
    pin1: { x: 0, y: 0 },
    pin2: { x: 0, y: 0 },
    pin3: { x: 0, y: 0 },
  });

  // 3. Incidents Feed State
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'case1',
      code: '#TR-9921',
      location: 'SEATTLE',
      title: 'Mass Casualty Incident - Route 9',
      description: 'Multiple vehicles involved. Urgent medical evacuation dispatched.',
      startTime: 862, // 14m 22s
      eta: '4 mins',
      dist: '2.1mi',
      carrier: 'EVAC-01',
      dest: 'Seattle General Hospital',
      status: 'CRITICAL',
      borderClass: 'border-l-4 border-l-[#E5484D] critical-border-anim',
      badgeClass: 'bg-[#E5484D] text-white text-[10px] font-bold px-2 py-0.5 rounded font-label-caps urgent-pulse',
    },
    {
      id: 'case2',
      code: '#OR-4412',
      location: 'BOSTON',
      title: 'Organ Transport (Heart) - En Route',
      description: 'Cardiac donor tissue routing under active EMT transport.',
      startTime: 311, // 5m 11s
      eta: '8 mins',
      dist: '4.8mi',
      carrier: 'M-Hawk-2',
      dest: 'Boston General Hospital',
      vitals: 'Vitals Stable',
      status: 'ACTIVE',
      borderClass: 'border-l-4 border-l-[#2D4A3A]',
      badgeClass: 'bg-[#2D4A3A] text-white text-[10px] font-bold px-2 py-0.5 rounded font-label-caps',
    },
    {
      id: 'case3',
      code: '#EV-2291',
      location: 'CHICAGO',
      title: 'Neonatal Transfer - In Progress',
      description: 'High-risk pediatric transport routing to specialized clinic.',
      startTime: 1845, // 30m 45s
      eta: '12 mins',
      dist: '8.3mi',
      carrier: 'Amb-14',
      dest: 'Children\'s Medical Center',
      status: 'ACTIVE',
      borderClass: 'border-l-4 border-l-[#2D4A3A]',
      badgeClass: 'bg-[#2D4A3A] text-white text-[10px] font-bold px-2 py-0.5 rounded font-label-caps',
    },
    {
      id: 'case4',
      code: '#ER-1102',
      location: 'DENVER',
      title: 'Ground Evac - Sector 4',
      description: 'Emergency cardiac patient evacuation successfully completed.',
      startTime: 3600, // 1 hr
      eta: '0 mins',
      dist: '0mi',
      carrier: 'Amb-02',
      dest: 'Denver Health Clinic',
      status: 'RESOLVED',
      borderClass: 'border border-outline-variant/20',
      badgeClass: 'bg-outline text-white text-[10px] font-bold px-2 py-0.5 rounded font-label-caps',
    }
  ]);

  // Derived Ground vs Air responders counts
  const responderBreakdown = useMemo(() => {
    const air = Math.floor(responders * 0.24); // roughly 24% air units
    const ground = responders - air;
    return { ground, air };
  }, [responders]);

  // 4. Combined Effect Intervals (Clock, Sync, Case Timers, Jitter, Stats Fluctuation)
  useEffect(() => {
    // 1-Second interval: updates live UTC clock, auto-sync seconds, and case durations
    const clockInterval = setInterval(() => {
      const now = new Date();
      setClockTime(now.toISOString().substring(11, 19) + ' UTC');

      setSyncSeconds(prev => (prev >= 9 ? 0 : prev + 1));

      setIncidents(prevIncidents => 
        prevIncidents.map(inc => {
          if (inc.status === 'RESOLVED') return inc;
          return { ...inc, startTime: inc.startTime + 1 };
        })
      );
    }, 1000);

    // 3-Second interval: fluctuates stats randomly for real-time dashboard feel
    const statsInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setActiveEmergencies(prev => {
          const shift = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return Math.max(100, Math.min(200, prev + (shift === 0 ? 1 : shift)));
        });
      }
      if (Math.random() > 0.7) {
        setResponders(prev => {
          const shift = Math.floor(Math.random() * 3) - 1; // -1 to +1
          return Math.max(50, Math.min(120, prev + (shift === 0 ? 1 : shift)));
        });
      }
      if (Math.random() > 0.8) {
        setResolvedToday(prev => prev + 1);
        showToast('✅ A ground evacuation emergency was successfully resolved!');
      }
    }, 3000);

    // 4-Second interval: jitters map pin graphics slightly
    const jitterInterval = setInterval(() => {
      setPinsJitter({
        pin1: { x: Number((Math.random() * 4 - 2).toFixed(1)), y: Number((Math.random() * 4 - 2).toFixed(1)) },
        pin2: { x: Number((Math.random() * 4 - 2).toFixed(1)), y: Number((Math.random() * 4 - 2).toFixed(1)) },
        pin3: { x: Number((Math.random() * 4 - 2).toFixed(1)), y: Number((Math.random() * 4 - 2).toFixed(1)) },
      });
    }, 4000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(statsInterval);
      clearInterval(jitterInterval);
    };
  }, []);

  // Helper to format ticking incident elapsed times into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Broadcast command submission
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('❌ Please fill in the broadcast command message.');
      return;
    }
    setBroadcastOpen(false);
    setBroadcastMessage('');
    showToast(`🚨 BROADCAST SENT: "${broadcastMessage}" dispatched to all responders!`);
  };

  return (
    <div className="-mx-6 md:-mx-10 -my-6 md:-my-10 p-6 md:p-10 bg-[#F5F1E8] min-h-[calc(100vh-80px)] flex flex-col gap-lg select-none text-custom-dark-green relative">
      
      {/* Dynamic Keyframes and Path Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel {
            background: rgba(232, 237, 229, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(199, 210, 192, 0.5);
        }
        
        .tabular-nums {
            font-variant-numeric: tabular-nums;
        }

        @keyframes sos-pulse {
            0% { box-shadow: 0 0 0 0 rgba(229, 72, 77, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(229, 72, 77, 0); }
            100% { box-shadow: 0 0 0 0 rgba(229, 72, 77, 0); }
        }
        .urgent-pulse {
            animation: sos-pulse 2s infinite;
        }
        
        @keyframes status-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.9); }
        }
        .status-indicator {
            animation: status-pulse 1.5s ease-in-out infinite;
        }

        @keyframes dash-flow {
            to { stroke-dashoffset: -20; }
        }
        .path-anim {
            stroke-dasharray: 4 4;
            animation: dash-flow 20s linear infinite;
        }
        
        @keyframes border-pulse {
            0%, 100% { border-left-color: rgba(229, 72, 77, 1); }
            50% { border-left-color: rgba(229, 72, 77, 0.5); }
        }
        .critical-border-anim {
            animation: border-pulse 2s infinite;
        }
        
        .map-pin {
            transition: transform 2s ease-in-out;
        }

        .map-bg {
            background-color: #E8EDE5;
            background-image: radial-gradient(#C7D2C0 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* Floating alert toasts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] bg-custom-dark-green text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in-up">
          <span className="material-symbols-outlined text-[20px] text-[#c8f17a]">campaign</span>
          <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md shrink-0">
        <div>
          <nav className="flex text-xs text-custom-sec-green mb-xs items-center gap-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Admin</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">Emergency Hub</span>
          </nav>
          <div className="flex items-center gap-md">
            <h1 className="font-headline-lg text-headline-lg text-custom-dark-green font-bold tracking-tight text-3xl">Emergency Command</h1>
            <div className="flex items-center gap-xs bg-custom-coral/10 text-custom-coral px-3 py-0.5 rounded-full border border-custom-coral/20">
              <div className="w-2 h-2 rounded-full bg-custom-coral urgent-pulse status-indicator"></div>
              <span className="font-label-caps text-label-caps tracking-widest font-bold text-[10px]">LIVE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-md shrink-0">
          <div className="flex items-center gap-sm bg-white px-md py-2 rounded-lg border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-custom-sec-green text-[18px]">schedule</span>
            <span className="font-mono text-sm font-bold text-custom-dark-green tabular-nums">{clockTime}</span>
          </div>
          <div className="hidden lg:flex items-center gap-xs bg-white rounded-lg p-1 border border-outline-variant/30 shadow-sm">
            <button className="px-3 py-1 text-xs font-bold rounded bg-custom-sec-green text-white shadow-sm">Map</button>
            <button 
              onClick={() => showToast('Command interface view toggled to Split-pane')}
              className="px-3 py-1 text-xs font-bold rounded text-custom-sec-green hover:bg-custom-card-mint transition-colors"
            >
              Split
            </button>
            <button 
              onClick={() => showToast('Command interface view toggled to List-pane')}
              className="px-3 py-1 text-xs font-bold rounded text-custom-sec-green hover:bg-custom-card-mint transition-colors"
            >
              List
            </button>
          </div>
          <button 
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-sm bg-custom-coral hover:bg-custom-deep-red text-white px-lg py-2.5 rounded-lg font-bold text-xs transition-colors shadow-md font-label-caps text-label-caps"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            Broadcast
          </button>
        </div>
      </header>

      {/* 2. Critical Alert Strip */}
      <section className="shrink-0 bg-custom-coral text-white rounded-xl p-md flex flex-col md:flex-row items-center gap-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/20 to-transparent"></div>
        <div className="flex items-center gap-md shrink-0 z-10">
          <div className="bg-white/20 p-2 rounded-full flex items-center justify-center urgent-pulse">
            <span className="material-symbols-outlined text-white text-[24px]">emergency</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-base leading-tight">3 CRITICAL ALERTS</h2>
            <p className="font-mono text-[10px] opacity-90 leading-tight">Immediate coordination required</p>
          </div>
        </div>
        
        <div className="flex-1 flex gap-md overflow-x-auto pb-2 md:pb-0 no-scrollbar z-10 w-full">
          {/* Alert 1 */}
          <div 
            onClick={() => {
              setSelectedCaseId('case1');
              showToast('Locating Seattle Organ Transport incident on route matrix');
            }}
            className="bg-custom-deep-red/40 border border-white/20 rounded-lg p-sm min-w-[240px] flex justify-between items-center backdrop-blur-sm hover:bg-custom-deep-red/60 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-label-caps text-[9px] opacity-80 mb-1">CASE #8992 • SEATTLE</div>
              <div className="font-bold text-xs">Organ Transport Delay</div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-1 rounded transition-colors block">
              <span className="material-symbols-outlined block text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Alert 2 */}
          <div 
            onClick={() => {
              setSelectedCaseId('case2');
              showToast('Locating Boston Rotor incident on route matrix');
            }}
            className="bg-custom-deep-red/40 border border-white/20 rounded-lg p-sm min-w-[240px] flex justify-between items-center backdrop-blur-sm hover:bg-custom-deep-red/60 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-label-caps text-[9px] opacity-80 mb-1">CASE #9014 • BOSTON</div>
              <div className="font-bold text-xs">Rotor Connectivity Lost</div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-1 rounded transition-colors block">
              <span className="material-symbols-outlined block text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Live Stats Row */}
      <section className="shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
        {/* Active Emergencies */}
        <div className="bg-custom-dark-green text-white p-md rounded-xl shadow-sm border border-custom-sec-green transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-card-mint text-[11px]">Active Emergencies</span>
            <span className="material-symbols-outlined text-custom-card-mint text-[16px]">monitoring</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold tabular-nums text-2xl leading-none">{activeEmergencies}</div>
          <div className="font-mono text-[9px] text-custom-card-mint mt-2">↑ 12% vs last hour</div>
        </div>

        {/* Critical Cases */}
        <div className="bg-white p-md rounded-xl shadow-sm border-l-4 border-l-custom-coral border-y border-r border-outline-variant/30 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-sec-green text-[11px]">Critical Cases</span>
            <span className="material-symbols-outlined text-custom-coral text-[16px]">warning</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-custom-coral tabular-nums text-2xl leading-none">{criticalCases}</div>
          <div className="font-mono text-[9px] text-custom-sec-green mt-2">3 require action</div>
        </div>

        {/* Active Responders */}
        <div className="bg-[#E8EDE5] p-md rounded-xl shadow-sm border border-outline-variant/30 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-sec-green text-[11px]">Active Responders</span>
            <span className="material-symbols-outlined text-custom-sec-green text-[16px]">local_shipping</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-custom-dark-green tabular-nums text-2xl leading-none">{responders}</div>
          <div className="font-mono text-[9px] text-custom-sec-green mt-2">
            <span>{responderBreakdown.ground}</span> Ground / <span>{responderBreakdown.air}</span> Air
          </div>
        </div>

        {/* Avg Response */}
        <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant/30 hidden md:block transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-sec-green text-[11px]">Avg Response</span>
            <span className="material-symbols-outlined text-custom-sec-green text-[16px]">timer</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-custom-dark-green text-2xl leading-none">4m 12s</div>
          <div className="font-mono text-[9px] text-custom-sec-green mt-2">↓ 30s vs baseline</div>
        </div>

        {/* Resolved Today */}
        <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant/30 hidden lg:block transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-sec-green text-[11px]">Resolved Today</span>
            <span className="material-symbols-outlined text-custom-sec-green text-[16px]">check_circle</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-custom-dark-green tabular-nums text-2xl leading-none">{resolvedToday}</div>
          <div className="font-mono text-[9px] text-custom-sec-green mt-2">98.4% success rate</div>
        </div>

        {/* Escalated */}
        <div className="bg-white p-md rounded-xl shadow-sm border border-outline-variant/30 hidden lg:block transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-label-caps text-custom-sec-green text-[11px]">Escalated</span>
            <span className="material-symbols-outlined text-custom-sec-green text-[16px]">trending_up</span>
          </div>
          <div className="font-display-lg text-display-lg font-bold text-custom-dark-green tabular-nums text-2xl leading-none">{escalatedCases}</div>
          <div className="font-mono text-[9px] text-custom-sec-green mt-2">Require supervisor review</div>
        </div>
      </section>

      {/* 4. Split View (Map & Feed) */}
      <section className="flex flex-col lg:flex-row gap-lg">
        
        {/* Map View (Left 60%) */}
        <div className="flex-[3] relative rounded-xl overflow-hidden border border-outline-variant/50 shadow-inner map-bg group h-[400px] lg:h-[600px]">
          {/* Simulated Map UI Overlay */}
          <div className="absolute top-md left-md z-10 glass-panel p-3 rounded-lg flex flex-col gap-xs">
            <div className="font-label-caps text-[9px] text-custom-dark-green font-bold mb-1">REGION FILTERS</div>
            <label className="flex items-center gap-2 text-[11px] font-mono font-semibold cursor-pointer">
              <input 
                checked={filters.allRegions} 
                onChange={(e) => setFilters(prev => ({ ...prev, allRegions: e.target.checked }))}
                className="rounded text-custom-sec-green focus:ring-custom-sec-green" 
                type="checkbox"
              /> 
              All Regions
            </label>
            <label className="flex items-center gap-2 text-[11px] font-mono font-semibold cursor-pointer">
              <input 
                checked={filters.groundUnits} 
                onChange={(e) => setFilters(prev => ({ ...prev, groundUnits: e.target.checked }))}
                className="rounded text-custom-sec-green focus:ring-custom-sec-green" 
                type="checkbox"
              /> 
              Ground Units
            </label>
            <label className="flex items-center gap-2 text-[11px] font-mono font-semibold cursor-pointer">
              <input 
                checked={filters.airUnits} 
                onChange={(e) => setFilters(prev => ({ ...prev, airUnits: e.target.checked }))}
                className="rounded text-custom-sec-green focus:ring-custom-sec-green" 
                type="checkbox"
              /> 
              Air Units
            </label>
          </div>

          <div className="absolute bottom-md right-md z-10 flex flex-col gap-sm">
            <button 
              onClick={() => showToast('Map zoom: Scale increased')}
              className="bg-white p-2 rounded-lg shadow-md border border-outline-variant/30 hover:bg-custom-card-mint transition block"
            >
              <span className="material-symbols-outlined block text-[18px] text-custom-dark-green font-bold">add</span>
            </button>
            <button 
              onClick={() => showToast('Map zoom: Scale decreased')}
              className="bg-white p-2 rounded-lg shadow-md border border-outline-variant/30 hover:bg-custom-card-mint transition block"
            >
              <span className="material-symbols-outlined block text-[18px] text-custom-dark-green font-bold">remove</span>
            </button>
          </div>

          {/* Abstract Map Content */}
          <div className="w-full h-full relative">
            {/* Simulated Map Pins */}
            {filters.airUnits && (
              <div 
                onClick={() => {
                  setSelectedCaseId('case1');
                  showToast('Viewing EVAC-01 Flight coordinates');
                }}
                className="absolute top-1/4 left-1/3 flex flex-col items-center map-pin cursor-pointer hover:scale-110 transition-transform" 
                style={{ transform: `translate(${pinsJitter.pin1.x}px, ${pinsJitter.pin1.y}px)` }}
              >
                <div className="w-4 h-4 bg-custom-coral rounded-full urgent-pulse border-2 border-white"></div>
                <div className="bg-white/90 px-2 py-0.5 rounded shadow text-[9px] font-mono font-bold text-custom-dark-green mt-1 whitespace-nowrap">EVAC-01</div>
              </div>
            )}

            {filters.groundUnits && (
              <>
                <div 
                  onClick={() => {
                    setSelectedCaseId('case2');
                    showToast('Viewing Heart Transport coordinate lock');
                  }}
                  className="absolute top-1/2 left-2/3 flex flex-col items-center map-pin cursor-pointer hover:scale-110 transition-transform"
                  style={{ transform: `translate(${pinsJitter.pin2.x}px, ${pinsJitter.pin2.y}px)` }}
                >
                  <div className="w-3.5 h-3.5 bg-custom-sec-green rounded-full border-2 border-white animate-pulse"></div>
                  <div className="bg-white/90 px-2 py-0.5 rounded shadow text-[9px] font-mono font-bold text-custom-dark-green mt-1 whitespace-nowrap">M-Hawk-2</div>
                </div>

                <div 
                  onClick={() => {
                    setSelectedCaseId('case3');
                    showToast('Viewing Amb-14 coordinates on Interstate');
                  }}
                  className="absolute bottom-1/3 left-1/2 flex flex-col items-center map-pin cursor-pointer hover:scale-110 transition-transform"
                  style={{ transform: `translate(${pinsJitter.pin3.x}px, ${pinsJitter.pin3.y}px)` }}
                >
                  <div className="w-3.5 h-3.5 bg-custom-sec-green rounded-full border-2 border-white animate-pulse"></div>
                  <div className="bg-white/90 px-2 py-0.5 rounded shadow text-[9px] font-mono font-bold text-custom-dark-green mt-1 whitespace-nowrap">Amb-14</div>
                </div>
              </>
            )}

            {/* Simulated route lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }}>
              <path className="path-anim" d="M 230 110 Q 350 170 460 220" fill="none" stroke="#2D4A3A" strokeWidth="2"></path>
              <path className="path-anim" d="M 460 220 Q 420 260 350 280" fill="none" stroke="#2D4A3A" strokeWidth="1.5" style={{ opacity: 0.5 }}></path>
            </svg>
          </div>
        </div>

        {/* Live Feed (Right 40%) */}
        <div className="flex-[2] bg-white rounded-xl border border-outline-variant/30 shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-[600px]">
          <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-custom-card-mint/30">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-custom-dark-green">format_list_bulleted</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-custom-dark-green text-sm">Live Activity Feed</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-custom-sec-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-custom-sec-green"></span>
              </span>
              <span className="font-mono text-[10px] text-custom-sec-green font-semibold">Auto-sync ON <span>({syncSeconds}s ago)</span></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md bg-custom-bg/30">
            {incidents.map((camp) => {
              const active = selectedCaseId === camp.id;
              
              if (camp.status === 'RESOLVED') {
                return (
                  <div 
                    key={camp.id}
                    onClick={() => setSelectedCaseId(camp.id)}
                    className={`bg-custom-bg rounded-lg border border-outline-variant/20 p-md opacity-70 cursor-pointer transition-all ${
                      active ? 'ring-2 ring-primary/40' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={camp.badgeClass}>{camp.status}</span>
                        <span className="font-mono text-xs text-custom-sec-green">{camp.code}</span>
                      </div>
                      <span className="material-symbols-outlined text-custom-sec-green text-[18px]">check_circle</span>
                    </div>
                    <h4 className="font-bold text-sm text-custom-dark-green">{camp.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{camp.description}</p>
                  </div>
                );
              }

              return (
                <div 
                  key={camp.id}
                  onClick={() => setSelectedCaseId(camp.id)}
                  className={`bg-white rounded-lg p-md shadow-sm border border-outline-variant/20 cursor-pointer transition-all ${camp.borderClass} ${
                    active ? 'ring-2 ring-custom-sec-green/40 shadow-md bg-[#EFF2EE]/20' : 'hover:bg-custom-card-mint/10'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-2 font-mono text-[11px] font-bold text-custom-coral bg-custom-coral/10 rounded-bl-lg tabular-nums">
                    {formatTime(camp.startTime)}
                  </div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 items-center">
                      <span className={camp.badgeClass}>{camp.status}</span>
                      <span className="font-mono text-xs text-custom-sec-green">{camp.code}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-sm text-custom-dark-green mb-1 pr-14">{camp.title}</h4>
                  <div className="font-mono text-[11px] text-custom-sec-green/70 mb-2">
                    {camp.status === 'CRITICAL' ? `ETA: ${camp.eta} • Dist: ${camp.dist}` : `Carrier: ${camp.carrier} • Dest: ${camp.dest}`}
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{camp.description}</p>
                  
                  <div className="flex gap-2 pt-2 border-t border-[#C5C8B8]/20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`🚨 Direct dispatch coordinates confirmed for ${camp.code}`);
                      }}
                      className={`flex-1 text-xs font-bold py-1.5 rounded transition ${
                        camp.status === 'CRITICAL' 
                          ? 'bg-custom-coral hover:bg-custom-deep-red text-white' 
                          : 'bg-custom-sec-green hover:bg-custom-dark-green text-white'
                      }`}
                    >
                      {camp.status === 'CRITICAL' ? 'Dispatch Air' : 'Reroute Carrier'}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Displaying detailed logistics payload for case ${camp.code}`);
                      }}
                      className="flex-1 bg-custom-card-mint hover:bg-custom-sec-green hover:text-white text-custom-dark-green text-xs font-bold py-1.5 rounded transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Broadcast Message Form Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6" id="broadcast-modal">
          <div 
            className="absolute inset-0 bg-[#121c2a]/40 backdrop-blur-sm" 
            onClick={() => setBroadcastOpen(false)}
          ></div>
          
          <form 
            onSubmit={handleBroadcast}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-fade-in-up"
          >
            <div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]/60">
              <h2 className="font-headline-sm text-headline-sm text-[#121c2a] font-bold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-custom-coral" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                <span>Send Emergency Broadcast</span>
              </h2>
              <button 
                type="button"
                className="text-on-surface-variant hover:text-primary block" 
                onClick={() => setBroadcastOpen(false)}
              >
                <span className="material-symbols-outlined block text-[22px]">close</span>
              </button>
            </div>

            <div className="p-lg space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This command transmits a priority SOS override request to all standby EMT responder mobile terminals, ambulance telemetry units, and coordinating facility dashboards.
              </p>
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Command Alert Message</label>
                <textarea 
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface shadow-sm" 
                  placeholder="e.g. Critical Blood shortfall in Sector 2. Standby units prepare for dispatch." 
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div className="px-lg py-md border-t border-outline-variant/30 flex justify-end gap-3 bg-[#EFF2EE]/60">
              <button 
                type="button"
                className="px-6 py-2 rounded-lg font-label-caps text-label-caps text-xs font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                onClick={() => setBroadcastOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg bg-custom-coral hover:bg-custom-deep-red text-white font-label-caps text-label-caps text-xs font-bold transition-all shadow-md"
              >
                Transmit SOS
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
