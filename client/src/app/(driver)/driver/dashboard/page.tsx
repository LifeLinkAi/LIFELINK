"use client";
import { useState } from "react";
import Link from "next/link";

const SB="#1e3a0f", SA="#2d5a1a";
const NAV=[
  {id:"home",   l:"Home",             h:"/driver/dashboard"},
  {id:"trips",  l:"New Trips",        h:"/driver/trip-requests"},
  {id:"emergency",l:"Active Emergency",h:"/driver/active-trip"},
  {id:"patient",l:"Patient Details",  h:"/driver/profile"},
  {id:"settings",l:"Settings",        h:"/driver/settings"},
];

/* ── tiny SVGs ── */
const AmbIco=()=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const ClkIco=()=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const TmrIco=()=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="9"/><polyline points="12 8 12 13 15 16"/><path d="M9.5 3h5M12 1v2"/></svg>);
const BellIco=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const RadioIco=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>);
const NavIco=()=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>);
const CheckIco=()=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>);
const WarnIco=()=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const HospIco=()=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>);

const FakeMap=()=>(
  <div className="relative w-full h-full bg-gray-900 overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill="#0d1117"/>
      {[50,100,155].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#1a2e1a" strokeWidth="7"/>)}
      {[55,150,245].map(x=><line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#1a2e1a" strokeWidth="6"/>)}
      <line x1="0" y1="100" x2="300" y2="100" stroke="#166534" strokeWidth="1.5" opacity="0.5"/>
      <line x1="150" y1="0" x2="150" y2="200" stroke="#166534" strokeWidth="1.5" opacity="0.5"/>
      <polyline points="20,180 80,140 150,95 210,60 275,25" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="150" cy="95" r="7" fill="#ef4444" opacity="0.95"/>
      <circle cx="150" cy="95" r="14" fill="#ef4444" opacity="0.2"/>
      <circle cx="80" cy="140" r="5" fill="#22c55e"/>
      <circle cx="80" cy="140" r="10" fill="#22c55e" opacity="0.25"/>
    </svg>
    <div className="absolute top-2 left-2 text-green-400 text-[10px] font-mono bg-black/60 px-2 py-1 rounded leading-tight">
      <div>LAT: 47.6062° N</div><div>LON: 122.3321° W</div>
    </div>
    <div className="absolute bottom-2 right-2 bg-[#1a3a1a] text-green-300 text-[10px] font-semibold px-3 py-1 rounded">Sector NW-02</div>
  </div>
);

const trips=[
  {id:1,name:"St. Mary's General",detail:"Respiratory Distress • 08:30 AM",dur:"14 min duration"},
  {id:2,name:"Central Trauma Hub",detail:"Multi-vehicle Accident • 07:15 AM",dur:"28 min duration"},
];
const alerts=[
  {id:1,type:"w",title:"Heavy Traffic: I-5 North",desc:"Congestion at Mercer Exit. Add +8m to ETA."},
  {id:2,type:"e",title:"Facility Divert: Mercy",desc:"ER at capacity. Redirect non-critical to General."},
];

export default function DriverDashboard(){
  const [online,setOnline]=useState(true);
  const [dispatched,setDispatched]=useState<boolean|null>(null);
  const [holdPct,setHoldPct]=useState(0);
  const [holdRef,setHoldRef]=useState<ReturnType<typeof setInterval>|null>(null);
  const [emergDeclared,setEmergDeclared]=useState(false);

  const startHold=()=>{
    let p=0;
    const iv=setInterval(()=>{ p+=4; setHoldPct(p); if(p>=100){clearInterval(iv);setEmergDeclared(true);setHoldPct(0);} },90);
    setHoldRef(iv);
  };
  const cancelHold=()=>{ if(holdRef)clearInterval(holdRef); setHoldRef(null); setHoldPct(0); };

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
            const a=n.id==="home";
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

        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Home</h1>
            <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"/>In Service
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="text-sm text-gray-600 font-medium">Online</span>
              <button onClick={()=>setOnline(!online)} className="relative w-10 h-5 rounded-full transition-colors" style={{backgroundColor:online?"#22c55e":"#d1d5db"}}>
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{transform:online?"translateX(20px)":"translateX(0)"}}/>
              </button>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><BellIco/></button>
            <button className="text-gray-400 hover:text-gray-600"><RadioIco/></button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:"linear-gradient(135deg,#3a6318,#1a3a0a)"}}>RM</div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-5 flex gap-5">

          {/* LEFT */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Dispatch Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-l-4 border-red-500 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">High Priority</span>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Time Dispatched</div>
                    <div className="text-2xl font-bold text-gray-800 font-mono">09:42:15</div>
                  </div>
                </div>
                <h2 className="text-[22px] font-bold text-gray-900 mb-1 leading-tight">Active Dispatch: Cardiac Arrest</h2>
                <p className="text-sm text-gray-500 mb-4">Patient: Robert Miller, 64M • 1.2 miles away</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{lbl:"ETA to Scene",val:"4 min",cls:"text-gray-800"},{lbl:"Traffic",val:"Light",cls:"text-green-500"},{lbl:"Sector",val:"NW-02",cls:"text-gray-800"}].map(c=>(
                    <div key={c.lbl} className="border border-gray-200 rounded-lg px-4 py-3">
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">{c.lbl}</div>
                      <div className={`text-2xl font-bold ${c.cls}`}>{c.val}</div>
                    </div>
                  ))}
                </div>
                {dispatched===null?(
                  <div className="flex gap-3">
                    <button onClick={()=>setDispatched(true)}
                      className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
                      style={{backgroundColor:"#2a5c10"}}>
                      <NavIco/> Start Navigation
                    </button>
                    <button onClick={()=>setDispatched(false)}
                      className="px-7 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg text-sm transition-colors">
                      Details
                    </button>
                  </div>
                ):(
                  <div className={`py-3 px-4 rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-3 ${dispatched?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-600 border border-red-200"}`}>
                    {dispatched?"✓ Navigation Started — En Route":"✕ Dispatch Declined"}
                    <button onClick={()=>setDispatched(null)} className="text-xs underline opacity-50">Reset</button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {ico:<AmbIco/>,badge:"+12%",bc:"text-green-500",lbl:"Trips Today",val:"08"},
                {ico:<ClkIco/>,badge:"--",bc:"text-gray-400",lbl:"Active Hours",val:"6.5"},
                {ico:<TmrIco/>,badge:"-2m",bc:"text-red-400",lbl:"Response Time",val:"5:12"},
              ].map((s,i)=>(
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">{s.ico}<span className={`text-xs font-bold ${s.bc}`}>{s.badge}</span></div>
                  <div className="text-xs text-gray-400 mb-1">{s.lbl}</div>
                  <div className="text-3xl font-bold text-gray-800">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Completed Trips */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-base">Today&apos;s Completed Trips</h3>
                <button className="text-sm font-medium hover:opacity-70" style={{color:"#3a7d14"}}>View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {trips.map(t=>(
                  <div key={t.id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0"><CheckIco/></div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{t.detail}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm text-gray-500">{t.dur}</div>
                      <div className="text-xs font-semibold mt-0.5" style={{color:"#16a34a"}}>Status: Logged</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-64 shrink-0 flex flex-col gap-4">

            {/* Declare Emergency */}
            <div className="relative rounded-xl overflow-hidden shadow-md" style={{background:"linear-gradient(145deg,#dc2626,#b91c1c)"}}>
              <div className="flex flex-col items-center py-7 px-4 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center mb-3">
                  <span className="text-white text-5xl font-black leading-none select-none">✱</span>
                </div>
                <div className="text-white font-black text-base tracking-widest uppercase mb-1">DECLARE EMERGENCY</div>
                <div className="text-red-200 text-xs mb-3">Requires confirm hold (3s)</div>
                <button onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold} onTouchStart={startHold} onTouchEnd={cancelHold}
                  className="relative w-full overflow-hidden border border-white/30 text-white text-xs font-semibold py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors select-none">
                  {emergDeclared?"⚠ Emergency Declared":"Hold to Confirm"}
                  {holdPct>0&&<span className="absolute inset-y-0 left-0 bg-white/25" style={{width:`${holdPct}%`}}/>}
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-sm" style={{height:"210px",backgroundColor:"#0d1117"}}>
              <FakeMap/>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Local Sector Alerts</h3>
              <div className="space-y-3">
                {alerts.map(a=>(
                  <div key={a.id} className="flex gap-2.5 items-start">
                    <div className="mt-0.5 shrink-0">{a.type==="w"?<WarnIco/>:<HospIco/>}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 leading-snug">{a.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
