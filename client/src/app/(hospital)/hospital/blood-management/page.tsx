"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Droplet, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Syringe
} from 'lucide-react';
import api from '@/lib/axios';

interface PledgedDonor {
  donorId: {
    _id: string;
    name: string;
    bloodType: string;
  };
  status: 'PLEDGED' | 'ARRIVED' | 'BLEEDING' | 'COMPLETED' | 'REJECTED';
  pledgedAt: string;
}

interface BloodLogistics {
  componentType: string;
  unitsRequested: number;
  unitsFulfilled: number;
}

interface RequestItem {
  id: string;
  patientName: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  units: number;
  bloodLogistics?: BloodLogistics;
  pledgedDonors: PledgedDonor[];
}

export default function BloodCommandCenter() {
  const [activeTab, setActiveTab] = useState<'TRIAGE' | 'LOBBY' | 'PHLEBOTOMY'>('TRIAGE');
  const [triageBoard, setTriageBoard] = useState<RequestItem[]>([]);
  const [completedDonationToast, setCompletedDonationToast] = useState<{ donorName: string, patientName: string, unitsNow: number, unitsTotal: number } | null>(null);
  const [lobbyQueue, setLobbyQueue] = useState<RequestItem[]>([]);
  const [phlebotomyQueue, setPhlebotomyQueue] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [triageRes, lobbyRes, phlebotomyRes] = await Promise.all([
        api.get('/requests/hospital/triage-board'),
        api.get('/requests/hospital/lobby-queue'),
        api.get('/requests/hospital/phlebotomy-queue')
      ]);

      setTriageBoard(triageRes.data.data || []);
      setLobbyQueue(lobbyRes.data.data || []);
      setPhlebotomyQueue(phlebotomyRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch blood command center data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Setup polling for real-time Command Center telemetry
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleArrive = async (reqId: string, donorId: string) => {
    try {
      // Optimistic UI update: moving from lobby to phlebotomy
      setLobbyQueue(prev => prev.map(req => req.id === reqId ? {
        ...req,
        pledgedDonors: req.pledgedDonors.map(p => p.donorId._id === donorId ? { ...p, status: 'ARRIVED' as const } : p)
      } : req));
      setPhlebotomyQueue(prev => {
        const exists = prev.some(r => r.id === reqId);
        if (exists) {
          return prev.map(req => req.id === reqId ? {
            ...req,
            pledgedDonors: req.pledgedDonors.map(p => p.donorId._id === donorId ? { ...p, status: 'ARRIVED' as const } : p)
          } : req);
        } else {
          const lobbyReq = lobbyQueue.find(r => r.id === reqId);
          if (lobbyReq) {
            return [...prev, {
              ...lobbyReq,
              pledgedDonors: lobbyReq.pledgedDonors.map(p => p.donorId._id === donorId ? { ...p, status: 'ARRIVED' as const } : p)
            }];
          }
          return prev;
        }
      });
      setActiveTab('PHLEBOTOMY');

      await api.patch(`/requests/${reqId}/pledge/${donorId}/arrive`);
      fetchData();
    } catch (error) {
      console.error('Failed to arrive donor:', error);
      alert('Failed to arrive donor. Please try again.');
    }
  };

  const handleComplete = async (reqId: string, donorId: string) => {
    try {
      const req = phlebotomyQueue.find(r => r.id === reqId);
      const donor = req?.pledgedDonors.find(d => d.donorId._id === donorId);
      
      await api.patch(`/requests/${reqId}/pledge/${donorId}/complete`);
      
      if (req && donor) {
        setCompletedDonationToast({
          donorName: donor.donorId.name,
          patientName: req.patientName,
          unitsNow: (req.bloodLogistics?.unitsFulfilled || 0) + 1,
          unitsTotal: req.bloodLogistics?.unitsRequested || req.units || 1
        });
      }
      fetchData();
    } catch (error) {
      console.error('Failed to complete direct donation:', error);
      alert('Failed to complete donation. Please try again.');
    }
  };

  const activeEmergenciesCount = triageBoard.length;
  // Calculate total donors across all requests in the specific states
  const donorsEnRouteCount = lobbyQueue.reduce((acc, req) => 
    acc + req.pledgedDonors.filter(d => d.status === 'PLEDGED').length, 0
  );
  const donorsInLobbyCount = phlebotomyQueue.reduce((acc, req) => 
    acc + req.pledgedDonors.filter(d => d.status === 'ARRIVED').length, 0
  );
  const unitsTransfusedCount = triageBoard.reduce((acc, req) => 
    acc + (req.bloodLogistics?.unitsFulfilled || 0), 0
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Global Telemetry Header */}
        <div className="bg-slate-900 px-6 py-4 rounded-lg border border-slate-800 shadow-inner flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-md">
              <Activity className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wider">ACTIVE EMERGENCIES</p>
              <p className="text-2xl font-bold text-white">{activeEmergenciesCount}</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-md">
              <ArrowRight className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wider">DONORS EN ROUTE</p>
              <p className="text-2xl font-bold text-white">{donorsEnRouteCount}</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-md">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wider">DONORS IN LOBBY</p>
              <p className="text-2xl font-bold text-white">{donorsInLobbyCount}</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <Droplet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold tracking-wider">UNITS TRANSFUSED</p>
              <p className="text-2xl font-bold text-white">{unitsTransfusedCount}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'TRIAGE' 
                ? 'bg-slate-800 text-white border-t border-x border-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Active Trauma Orders
              {activeEmergenciesCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {activeEmergenciesCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('LOBBY')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'LOBBY' 
                ? 'bg-slate-800 text-white border-t border-x border-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Lobby Check-In
              {donorsEnRouteCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {donorsEnRouteCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('PHLEBOTOMY')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'PHLEBOTOMY' 
                ? 'bg-slate-800 text-white border-t border-x border-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Phlebotomy Bay
              {donorsInLobbyCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {donorsInLobbyCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg rounded-tl-none p-6 shadow-sm min-h-[400px]">
          {loading && triageBoard.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Activity className="h-8 w-8 text-slate-500 animate-pulse" />
            </div>
          ) : (
            <>
              {/* TAB 1: TRIAGE BOARD */}
              {activeTab === 'TRIAGE' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    High-Density Triage Board
                  </h2>
                  <div className="overflow-x-auto rounded-md border border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-800">Patient / Ward</th>
                          <th className="px-4 py-3 border-b border-slate-800">Blood Group</th>
                          <th className="px-4 py-3 border-b border-slate-800">Urgency</th>
                          <th className="px-4 py-3 border-b border-slate-800 w-1/3">Fulfillment Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {triageBoard.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                              No active trauma orders.
                            </td>
                          </tr>
                        )}
                        {triageBoard.map((req) => {
                          const unitsReq = req.bloodLogistics?.unitsRequested || req.units || 1;
                          const unitsFulfill = req.bloodLogistics?.unitsFulfilled || 0;
                          const progress = Math.min(100, Math.round((unitsFulfill / unitsReq) * 100));
                          
                          return (
                            <tr key={req.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-200">{req.patientName}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  {req.bloodGroup}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                                  req.urgency === 'Critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                  req.urgency === 'High' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                  'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                }`}>
                                  {req.urgency}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                      className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-500`} 
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-mono text-slate-400 w-24">
                                    {unitsFulfill} / {unitsReq} Units
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: LOBBY QUEUE */}
              {activeTab === 'LOBBY' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                    Lobby Check-In (Serology Gate)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lobbyQueue.flatMap(req => req.pledgedDonors.filter(d => d.status === 'PLEDGED').map(pledge => (
                      <div key={`${req.id}-${pledge.donorId._id}`} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-200">{pledge.donorId.name}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" /> Pledged {new Date(pledge.pledgedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            {pledge.donorId.bloodType}
                          </span>
                        </div>
                        
                        <div className="bg-slate-900 rounded p-3 text-sm border border-slate-800">
                          <p className="text-slate-400 mb-1"><span className="text-slate-500 text-xs uppercase font-semibold">Target Patient:</span></p>
                          <p className="font-medium text-slate-300 truncate">{req.patientName} • {req.urgency}</p>
                        </div>

                        <button
                          onClick={() => handleArrive(req.id, pledge.donorId._id)}
                          className="w-full mt-auto py-2.5 px-4 bg-slate-800 hover:bg-blue-600 text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-blue-500"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          [ Verify ID & Arrive ]
                        </button>
                      </div>
                    )))}
                    
                    {donorsEnRouteCount === 0 && (
                      <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-lg">
                        <Users className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No donors currently in route or pending verification.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PHLEBOTOMY BAY */}
              {activeTab === 'PHLEBOTOMY' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {completedDonationToast && (
                    <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-lg mb-6 flex items-center justify-between text-emerald-100 animate-in fade-in slide-in-from-top duration-300 shadow-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0"/>
                        <div>
                          <h4 className="font-bold text-emerald-200">DIRECT TRANSFUSION SUCCESSFUL</h4>
                          <p className="text-sm text-emerald-300/90">450ml Whole Blood secured from donor <span className="text-white font-semibold">{completedDonationToast.donorName}</span> routed to <span className="text-white font-semibold">{completedDonationToast.patientName}</span>. Quota: {completedDonationToast.unitsNow}/{completedDonationToast.unitsTotal} Units.</p>
                        </div>
                      </div>
                      <button onClick={() => setCompletedDonationToast(null)} className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-xs font-bold rounded transition-colors">DISMISS</button>
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-emerald-500" />
                    Phlebotomy Bay (Vein-to-Vein Handshake)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {phlebotomyQueue.flatMap(req => req.pledgedDonors.filter(d => d.status === 'ARRIVED').map(pledge => (
                      <div key={`${req.id}-${pledge.donorId._id}`} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Draw</span>
                          </div>
                          <span className="text-xs font-mono text-slate-500">450ml WHOLE BLOOD</span>
                        </div>
                        
                        <div className="p-4 flex flex-col gap-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-slate-200">{pledge.donorId.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">
                                Directed to: <span className="font-medium text-slate-300">{req.patientName}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              {pledge.donorId.bloodType}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleComplete(req.id, pledge.donorId._id)}
                            className="w-full mt-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            [ Complete Direct Draw ]
                          </button>
                        </div>
                      </div>
                    )))}

                    {donorsInLobbyCount === 0 && (
                      <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-lg">
                        <Syringe className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Phlebotomy bay is currently empty.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
