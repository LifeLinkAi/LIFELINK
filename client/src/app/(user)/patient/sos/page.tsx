'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { Siren, MapPin, Clock, CheckCircle, XCircle, Droplets, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// -- Types ------------------------------------------------
type SOSState = 'idle' | 'confirming' | 'broadcasting' | 'active' | 'resolved';
type EmergencyType = 'blood' | 'organ' | 'general';

interface NearbyUnit {
  id: string;
  type: 'hospital' | 'donor';
  name: string;
  distance: string;
  eta: string;
  status: 'responding' | 'available';
}

// -- Data -------------------------------------------------
const NEARBY_UNITS: NearbyUnit[] = [
  { id: 'HOS-01', type: 'hospital',  name: 'LifeLink Main Campus', distance: '1.2 km', eta: '5 min', status: 'responding' },
  { id: 'DON-44', type: 'donor',     name: 'Nearby Donor (O-)',  distance: '2.1 km', eta: '8 min', status: 'responding' },
];

const EMERGENCY_TYPES: { key: EmergencyType; label: string; icon: ReactNode; desc: string }[] = [
  { key: 'blood',     label: 'Blood Emergency',   icon: <Droplets size={20} />, desc: 'Urgent blood transfusion needed'    },
  { key: 'organ',     label: 'Organ Emergency',   icon: <Heart size={20} />,    desc: 'Organ failure or transplant urgent' },
  { key: 'general',   label: 'General Emergency', icon: <Siren size={20} />,    desc: 'Other medical emergency'            },
];

// -- Pulse ring animation component ----------------------
function PulseRing({ active }: { active: boolean }) {
  return (
    <div className="group relative flex items-center justify-center">
      {active && (
        <>
          <div className="absolute w-48 h-48 rounded-full bg-red-500/20 animate-ping" />
          <div className="absolute w-36 h-36 rounded-full bg-red-500/30 animate-ping [animation-delay:0.3s]" />
        </>
      )}
      {!active && (
        <>
          <div className="absolute hidden group-hover:block w-48 h-48 rounded-full bg-red-500/10 animate-ping" />
          <div className="absolute hidden group-hover:block w-36 h-36 rounded-full bg-red-500/20 animate-ping [animation-delay:0.3s]" />
        </>
      )}
      <div className={cn(
        'relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl',
        active
          ? 'bg-red-600 shadow-red-500/50'
          : 'bg-red-700 hover:bg-red-600 hover:shadow-red-500/40'
      )}>
        <Siren size={44} className="text-white" />
      </div>
    </div>
  );
}

// -- Countdown timer --------------------------------------
function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (count <= 0) { onComplete(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20 rounded-full border-4 border-red-600 flex items-center justify-center">
        <span className="text-[36px] font-bold text-red-600">{count}</span>
      </div>
      <p className="text-[13px] text-[#6B7A5A]">Broadcasting in {count} seconds...</p>
      <p className="text-[12px] text-[#8A9A7A]">Tap cancel to abort</p>
    </div>
  );
}

// -- Elapsed timer ----------------------------------------
function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  return (
    <div className="flex items-center gap-1.5 text-red-600 font-mono font-bold text-[18px]">
      <Clock size={16} />
      {mins}:{secs}
    </div>
  );
}

// -- Nearby unit card -------------------------------------
function UnitCard({ unit }: { unit: NearbyUnit }) {
  const iconMap = {
    hospital:  <MapPin    size={16} className="text-blue-600" />,
    donor:     <Droplets  size={16} className="text-green-600" />,
  };
  const statusColors = {
    responding:  'text-blue-700  bg-blue-50  border-blue-200',
    available:   'text-green-700 bg-green-50 border-green-200',
  };
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E8E4D8] px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-[#F5F2E8] flex items-center justify-center flex-shrink-0">
        {iconMap[unit.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1a2e0a]">{unit.name}</p>
        <p className="text-[11.5px] text-[#8A9A7A]">{unit.distance} away · ETA {unit.eta}</p>
      </div>
      <span className={cn('text-[11px] font-semibold px-2 py-1 rounded-full border', statusColors[unit.status])}>
        {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
      </span>
    </div>
  );
}

// -- Page -------------------------------------------------
export default function SOSPage() {
  const [sosState,       setSOSState]       = useState<SOSState>('idle');
  const [emergencyType,  setEmergencyType]  = useState<EmergencyType>('general');
  const [locationText,   setLocationText]   = useState('Detecting location...');
  const [showUnits,      setShowUnits]      = useState(false);

  // Simulate location detection
  useEffect(() => {
    const t = setTimeout(() => setLocationText('Kozhikode Medical College Rd, Kerala'), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleSOSPress = () => {
    if (sosState === 'idle') setSOSState('confirming');
  };

  const handleConfirm = () => setSOSState('broadcasting');

  const handleBroadcastComplete = () => {
    setSOSState('active');
    setShowUnits(true);
  };

  const handleCancel = () => {
    setSOSState('idle');
    setShowUnits(false);
  };

  const handleResolve = () => setSOSState('resolved');

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">SOS Emergency</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">
          One tap broadcasts your location to nearby hospitals and donors.
        </p>
      </div>

      {/* Main SOS card */}
      <div className={cn(
        'bg-white rounded-2xl border-2 p-8 flex flex-col items-center gap-6 transition-all duration-300',
        sosState === 'active'       ? 'border-red-500 shadow-lg shadow-red-100' :
        sosState === 'broadcasting' ? 'border-red-400' :
        sosState === 'resolved'     ? 'border-green-500' : 'border-[#E8E4D8]'
      )}>

        {/* Resolved state */}
        {sosState === 'resolved' ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <p className="text-[20px] font-bold text-green-700">Emergency Resolved</p>
            <p className="text-[13.5px] text-[#6B7A5A] text-center">
              Your SOS has been marked as resolved. All responders have been notified.
            </p>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-[#1a2e0a] text-white text-[13px] font-medium rounded-lg hover:bg-[#2B4A18] transition-colors"
            >
              Back to Safety
            </button>
          </div>
        ) : sosState === 'confirming' ? (
          <>
            {/* Emergency type selection */}
            <div className="w-full">
              <p className="text-[13px] font-semibold text-[#1a2e0a] mb-3 text-center">
                Select Emergency Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                {EMERGENCY_TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setEmergencyType(t.key)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left',
                      emergencyType === t.key
                        ? 'border-red-600 bg-red-50'
                        : 'border-[#E8E4D8] hover:border-red-300 bg-white'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      emergencyType === t.key ? 'bg-red-600 text-white' : 'bg-[#F5F2E8] text-[#6B7A5A]'
                    )}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#1a2e0a]">{t.label}</p>
                      <p className="text-[11px] text-[#8A9A7A] mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="w-full flex items-center gap-2 bg-[#F5F2E8] rounded-lg px-4 py-3">
              <MapPin size={15} className="text-red-600 flex-shrink-0" />
              <span className="text-[13px] text-[#3A4A2A]">{locationText}</span>
            </div>

            {/* Confirm buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Siren size={16} /> Broadcast SOS Now
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-white border border-[#D0CCBC] text-[#3A4A2A] text-[13px] font-medium rounded-xl hover:border-red-300 transition-colors flex items-center gap-1.5"
              >
                <XCircle size={14} /> Cancel
              </button>
            </div>
          </>
        ) : sosState === 'broadcasting' ? (
          <Countdown onComplete={handleBroadcastComplete} />
        ) : sosState === 'active' ? (
          <>
            {/* Active SOS */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[15px] font-bold text-red-700">SOS ACTIVE - Broadcasting</span>
            </div>
            <PulseRing active={true} />
            <ElapsedTimer />
            <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <MapPin size={15} className="text-red-600 flex-shrink-0" />
              <span className="text-[13px] text-red-700 font-medium">{locationText}</span>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleResolve}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} /> Mark as Resolved
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-white border border-red-300 text-red-600 text-[13px] font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Idle state */}
            <p className="text-[14px] text-[#6B7A5A] text-center">
              Tap the button below to broadcast an emergency alert
            </p>
            <button onClick={handleSOSPress} className="focus:outline-none">
              <PulseRing active={false} />
            </button>
            <p className="text-[13px] text-[#8A9A7A] text-center">
              Your location will be shared with nearby hospitals and responders
            </p>
            <div className="flex items-center gap-2 text-[12.5px] text-[#6B7A5A] bg-[#F5F2E8] px-4 py-2.5 rounded-lg w-full">
              <MapPin size={13} className="text-[#8A9A7A] flex-shrink-0" />
              {locationText}
            </div>
          </>
        )}
      </div>

      {/* Nearby responders - shown after SOS activated */}
      {showUnits && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-[#1a2e0a]">Responding Units</p>
          {NEARBY_UNITS.map(u => <UnitCard key={u.id} unit={u} />)}
        </div>
      )}
    </div>
  );
}
