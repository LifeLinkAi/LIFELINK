"use client";
import { useState } from "react";
import Link from "next/link";

const SB="#1e3a0f",SA="#2d5a1a";
const NAV=[
  {id:"home",     l:"Home",             h:"/driver/dashboard"},
  {id:"trips",    l:"New Trips",        h:"/driver/trip-requests"},
  {id:"emergency",l:"Active Emergency", h:"/driver/active-trip"},
  {id:"patient",  l:"Patient Details",  h:"/driver/profile"},
  {id:"settings", l:"Settings",         h:"/driver/settings"},
];

const BellIco=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const RadioIco=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>);
const PinIco=()=>(<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const ChkIco=()=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);

const AiMap=()=>(
  <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
    <svg width="100%" height="100%" viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="160" fill="#0a0f1a"/>
      {[35,80,125].map(y=><line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#0d2030" strokeWidth="7"/>)}
      {[60,130,200].map(x=><line key={x} x1={x} y1="0" x2={x} y2="160" stroke="#0d2030" strokeWidth="7"/>)}
      <polyline points="20,140 70,110 140,75 200,50 260,20" stroke="#00e5ff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <circle cx="140" cy="75" r="18" fill="#ef4444" opacity="0.15"/>
      <circle cx="140" cy="75" r="9" fill="#ef4444" opacity="0.25"/>
      <circle cx="140" cy="75" r="5" fill="#ff6b6b"/>
      <circle cx="70" cy="110" r="5" fill="#00e5ff" opacity="0.9"/>
      <circle cx="70" cy="110" r="12" fill="#00e5ff" opacity="0.1"/>
    </svg>
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
      <span className="text-cyan-400 text-[11px] font-semibold">Optimized Path Found via AI</span>
    </div>
  </div>
);

type Status="pending"|"accepted"|"declined";

const TRIPS=[
  {id:1,name:"Jonathan Miller",age:"64M",cond:"Acute Myocardial Infarction",ico:"❤️",loc:"St. Mary's Retirement Home",addr:"882 West Oak Boulevard, Wing C",dist:"1.2 km away",eta:"4m ETA",priority:"critical" as const},
  {id:2,name:"Elena Rodriguez",age:"28F",cond:"Suspected Femur Fracture",ico:"",loc:"City Central Sports Complex",addr:"",dist:"2.8 km",eta:"9m ETA",priority:"medium" as const},
  {id:3,name:"Albert Thompson",age:"72M",cond:"Routine Hospital Transfer",ico:"",loc:"Greenwood Medical Plaza",addr:"",dist:"4.5 km",eta:"14m ETA",priority:"low" as const},
];

export default function TripRequestsPage(){
  const [st,setSt]=useState<Record<number,Status>>({1:"pending",2:"pending",3:"pending"});
  const upd=(id:number,s:Status)=>setSt(p=>({...p,[id]:s}));
  const pending=Object.values(st).filter(s=>s==="pending").length;

  return(
    <div className="flex min-h-screen bg-[#f8f9fa] overflow-hidden" style={{fontFamily:"'Inter',sans-serif"}}>

      {/* SIDEBAR */}
      <aside className="w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-50" style={{backgroundColor:SB}}>
        <div className="px-6 pt-7 pb-4">
          <div className="font-bold text-[17px] leading-tight">LifeLink AI</div>
          <div className="text-green-400 text-xs mt-0.5 font-medium">Ambulance Unit 04</div>
        </div>
        <nav className="flex-1 px-4 space-y-0.5">
          {NAV.map(n=>{
            const a=n.id==="trips";
            return(
              <Link key={n.id} href={n.h}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                style={{backgroundColor:a?SA:"transparent",color:a?"#fff":"#a7d870",borderLeft:a?"3px solid #8fcc30":"3px solid transparent"}}>
                {n.l}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 pb-6">
          <Link href="/driver/trip-requests"
            className="w-full font-bold text-sm py-2.5 rounded-lg flex items-center justify-center"
            style={{backgroundColor:"#d7f79c",color:"#1a3a0a"}}>
            Dispatch Center
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 pl-64 h-screen overflow-y-auto flex flex-col bg-[#f8f9fa]">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">New Trip Requests</h1>
            <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block"/>Online
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600"><BellIco/></button>
            <button className="text-gray-400 hover:text-gray-600"><RadioIco/></button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:"linear-gradient(135deg,#3a6318,#1a3a0a)"}}>RM</div>
          </div>
        </header>

        <main className="p-6 flex-1">
          <div className="flex gap-5">
            {/* LEFT */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Feed header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-base">Live Incoming Feed</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"/>
                </div>
                <div className="flex gap-2">
                  <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">{pending} Pending</span>
                  <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">Sorting: Priority</span>
                </div>
              </div>

              {/* CRITICAL card */}
              {(()=>{
                const t=TRIPS[0]; const s=st[t.id];
                return(
                  <div className="bg-white rounded-xl border-2 border-red-400 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Patient Identification</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">{t.name}</span>
                            <span className="text-lg font-semibold text-gray-500">{t.age}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-sm">{t.ico}</span>
                            <span className="text-red-500 font-semibold text-sm">{t.cond}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">✱ CRITICAL</span>
                          <div className="text-right text-sm text-gray-500 space-y-0.5">
                            <div>{t.dist}</div><div>{t.eta}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between mb-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 text-gray-400"><PinIco/></span>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{t.loc}</div>
                            {t.addr&&<div className="text-xs text-gray-400 mt-0.5">{t.addr}</div>}
                          </div>
                        </div>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2">View Map</button>
                      </div>
                      {s==="pending"?(
                        <div className="flex gap-3">
                          <button onClick={()=>upd(t.id,"accepted")} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base transition-colors">
                            <ChkIco/> Accept Request
                          </button>
                          <button onClick={()=>upd(t.id,"declined")} className="px-6 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 rounded-xl text-sm transition-colors">
                            Decline
                          </button>
                        </div>
                      ):(
                        <div className={`py-3 px-4 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-3 ${s==="accepted"?"bg-green-50 text-green-700 border border-green-200":"bg-gray-50 text-gray-500 border border-gray-200"}`}>
                          {s==="accepted"?"✓ Request Accepted":"✕ Request Declined"}
                          <button onClick={()=>upd(t.id,"pending")} className="text-xs underline opacity-50">Undo</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Medium + Low */}
              <div className="grid grid-cols-2 gap-4">
                {TRIPS.slice(1).map(t=>{
                  const s=st[t.id];
                  const med=t.priority==="medium";
                  return(
                    <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full ${med?"bg-amber-400":"bg-green-400"}`}/>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${med?"text-amber-500":"text-green-600"}`}>{med?"MEDIUM PRIORITY":"LOW PRIORITY"}</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{t.name}, <span className="font-semibold text-gray-500 text-base">{t.age}</span></div>
                        </div>
                        <div className="text-right text-xs text-gray-500 leading-relaxed"><div>{t.dist}</div><div>{t.eta}</div></div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                        <div className="font-semibold text-gray-800 text-sm">{t.cond}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><PinIco/>{t.loc}</div>
                      </div>
                      {s==="pending"?(
                        <div className="flex gap-2 mt-auto">
                          <button onClick={()=>upd(t.id,"accepted")} className="flex-1 text-white font-semibold py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity" style={{backgroundColor:"#2a4a10"}}>Accept</button>
                          <button onClick={()=>upd(t.id,"declined")} className="px-4 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors">Ignore</button>
                        </div>
                      ):(
                        <div className={`py-2 px-3 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-2 ${s==="accepted"?"bg-green-50 text-green-700 border border-green-200":"bg-gray-50 text-gray-400 border border-gray-200"}`}>
                          {s==="accepted"?"✓ Accepted":"✕ Ignored"}
                          <button onClick={()=>upd(t.id,"pending")} className="underline opacity-50 text-[10px]">Undo</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Demand bar */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Current Demand</div>
                    <div className="text-base font-bold text-gray-900 mt-0.5">High – 8 Active Incidents</div>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-right">
                  <div><div className="text-green-600 font-bold text-sm">Stable</div><div className="text-xs text-gray-400">System Latency: 42ms</div></div>
                  <div><div className="text-blue-600 font-bold text-sm">Connected</div><div className="text-xs text-gray-400">GPS Accuracy: 0.5m</div></div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              {/* AI Map */}
              <div className="rounded-xl overflow-hidden shadow-sm" style={{height:"190px"}}>
                <AiMap/>
              </div>
              {/* Shift Progress */}
              <div className="rounded-xl p-5 flex flex-col gap-3" style={{backgroundColor:"#2a4a10"}}>
                <div className="flex items-center justify-between">
                  <span className="text-green-300 text-[10px] font-bold uppercase tracking-widest">Shift Progress</span>
                  <span className="text-green-200 text-xs font-semibold">6 / 8 Hours</span>
                </div>
                <div className="w-full bg-green-900 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-400" style={{width:"75%"}}/>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <div className="text-white text-3xl font-bold leading-none">12</div>
                    <div className="text-green-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Completed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-3xl font-bold leading-none">98%</div>
                    <div className="text-green-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
