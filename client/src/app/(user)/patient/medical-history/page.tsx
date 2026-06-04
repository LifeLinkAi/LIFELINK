'use client';
import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp, Download, Calendar, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

type RecordType = 'Diagnosis' | 'Surgery' | 'Lab Report' | 'Prescription' | 'Allergy' | 'Vaccination';

interface MedicalRecord {
  id: string;
  type: RecordType;
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  notes: string;
  documents: { name: string; size: string }[];
  critical: boolean;
}

interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

interface Vaccination {
  name: string;
  date: string;
  nextDue?: string;
}

const RECORDS: MedicalRecord[] = [
  {
    id: 'MR-001', type: 'Diagnosis', critical: true,
    title: 'End-stage Renal Disease',
    date: '15 Jan 2024', doctor: 'Dr. Anitha Kumar',
    hospital: 'LifeLink Main Campus',
    notes: 'Patient diagnosed with ESRD. Currently on dialysis 3x/week. Recommended for kidney transplant evaluation.',
    documents: [
      { name: 'Diagnosis_Report.pdf', size: '2.4 MB' },
      { name: 'Kidney_Ultrasound.pdf', size: '5.1 MB' },
    ],
  },
  {
    id: 'MR-002', type: 'Lab Report', critical: false,
    title: 'Blood Panel — Q1 2024',
    date: '10 Mar 2024', doctor: 'Dr. Rahul Menon',
    hospital: 'Kozhikode Medical College',
    notes: 'Creatinine: 8.2 mg/dL (high). BUN: 45 mg/dL. Hemoglobin: 9.1 g/dL. Platelets: 180k.',
    documents: [
      { name: 'Blood_Panel_Mar2024.pdf', size: '1.1 MB' },
    ],
  },
  {
    id: 'MR-003', type: 'Prescription', critical: false,
    title: 'Dialysis Medication Protocol',
    date: '15 Jan 2024', doctor: 'Dr. Anitha Kumar',
    hospital: 'LifeLink Main Campus',
    notes: 'Erythropoietin 4000 IU 3x/week. Calcium carbonate 500mg with meals. Furosemide 40mg daily.',
    documents: [
      { name: 'Prescription_Jan2024.pdf', size: '0.8 MB' },
    ],
  },
  {
    id: 'MR-004', type: 'Surgery', critical: false,
    title: 'AV Fistula Creation',
    date: '20 Feb 2023', doctor: 'Dr. James Vargese',
    hospital: 'Baby Memorial Hospital',
    notes: 'Successful creation of arteriovenous fistula in left forearm for dialysis access. No complications.',
    documents: [
      { name: 'Surgery_Report.pdf',      size: '3.2 MB' },
      { name: 'Post_Op_Instructions.pdf', size: '0.5 MB' },
    ],
  },
];

const ALLERGIES: Allergy[] = [
  { name: 'Penicillin',  severity: 'severe',   reaction: 'Anaphylaxis — carry EpiPen'    },
  { name: 'Sulfa drugs', severity: 'moderate', reaction: 'Rash and hives'                },
  { name: 'Iodine',      severity: 'mild',     reaction: 'Mild skin irritation'           },
];

const VACCINATIONS: Vaccination[] = [
  { name: 'Hepatitis B',  date: 'Jan 2023',  nextDue: 'Jan 2028'      },
  { name: 'Influenza',    date: 'Oct 2023',  nextDue: 'Oct 2024'      },
  { name: 'COVID-19',     date: 'Mar 2022',                           },
  { name: 'Tetanus',      date: 'Jun 2020',  nextDue: 'Jun 2030'      },
];

const TYPE_CONFIG: Record<RecordType, { color: string; bg: string; icon: string }> = {
  Diagnosis:    { color: '#CC0000', bg: '#FFE5E5', icon: '🔴' },
  Surgery:      { color: '#5B21B6', bg: '#EDE8FF', icon: '🔪' },
  'Lab Report': { color: '#1A5FAA', bg: '#E3F0FF', icon: '🧪' },
  Prescription: { color: '#2B6B0A', bg: '#E8F5E0', icon: '💊' },
  Allergy:      { color: '#B86E00', bg: '#FFF3E0', icon: '⚠️' },
  Vaccination:  { color: '#0369a1', bg: '#E0F2FE', icon: '💉' },
};

const SEVERITY_CONFIG = {
  severe:   { color: '#CC0000', bg: '#FFE5E5', label: 'Severe'   },
  moderate: { color: '#B86E00', bg: '#FFF3E0', label: 'Moderate' },
  mild:     { color: '#2B6B0A', bg: '#E8F5E0', label: 'Mild'     },
};

function MedicalRecordCard({ record: r }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(r.critical);
  const tc = TYPE_CONFIG[r.type];

  return (
    <div className={cn(
      'bg-white rounded-xl border border-[#E8E4D8] overflow-hidden',
      r.critical && 'border-l-[3px] border-l-red-500'
    )}>
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF7] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: tc.bg }}>
          {tc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[#1a2e0a]">{r.title}</span>
            {r.critical && (
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Critical
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full border"
              style={{ color: tc.color, background: tc.bg }}>
              {r.type}
            </span>
            <span className="text-[11.5px] text-[#8A9A7A]">{r.date} · {r.doctor}</span>
          </div>
        </div>
        <span className="text-[11.5px] text-[#8A9A7A] flex-shrink-0">{r.hospital}</span>
        {expanded
          ? <ChevronUp size={16} className="text-[#8A9A7A] flex-shrink-0" />
          : <ChevronDown size={16} className="text-[#8A9A7A] flex-shrink-0" />
        }
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-[#F0EDE3] bg-[#FAFAF7]">
          <p className="text-[13px] text-[#3A4A2A] leading-relaxed mt-3">{r.notes}</p>
          {r.documents.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-[#8A9A7A] uppercase tracking-wide mb-2">
                Documents
              </p>
              <div className="flex flex-col gap-1.5">
                {r.documents.map(doc => (
                  <div key={doc.name}
                    className="flex items-center justify-between bg-white rounded-lg border border-[#E8E4D8] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-[#6B7A5A]" />
                      <span className="text-[12.5px] text-[#3A4A2A]">{doc.name}</span>
                      <span className="text-[11px] text-[#8A9A7A]">{doc.size}</span>
                    </div>
                    <button className="flex items-center gap-1 text-[11.5px] text-[#3d6b1e] font-medium hover:underline">
                      <Download size={12} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MedicalHistoryPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'allergies' | 'vaccinations'>('records');

  const TABS = [
    { key: 'records',      label: 'Medical Records', count: RECORDS.length      },
    { key: 'allergies',    label: 'Allergies',        count: ALLERGIES.length    },
    { key: 'vaccinations', label: 'Vaccinations',     count: VACCINATIONS.length },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Medical History</h1>
          <p className="text-[13.5px] text-[#6B7A5A] mt-1">
            Your complete medical records, allergies, and vaccinations.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a2e0a] text-white text-[13px] font-medium hover:bg-[#2B4A18] transition-colors">
          <Plus size={14} /> Add Record
        </button>
      </div>

      {/* Patient summary card */}
      <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-[20px] font-bold text-red-700 flex-shrink-0">
            PT
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-[#1a2e0a]">Patient Name</p>
            <p className="text-[12.5px] text-[#6B7A5A] mt-0.5">MRN: 8829-XJ-4 · 45 yrs · Male</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              <Droplets size={14} className="text-red-600" />
              <div>
                <p className="text-[10px] text-[#8A9A7A]">Blood Type</p>
                <p className="text-[14px] font-bold text-red-700">O−</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              <span className="text-[14px]">⚠️</span>
              <div>
                <p className="text-[10px] text-[#8A9A7A]">Allergies</p>
                <p className="text-[14px] font-bold text-amber-700">{ALLERGIES.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F5F2E8] p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.key}
            onClick={() => setActiveTab(t.key as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all',
              activeTab === t.key
                ? 'bg-white text-[#1a2e0a] shadow-sm'
                : 'text-[#6B7A5A] hover:text-[#1a2e0a]'
            )}>
            {t.label}
            <span className={cn(
              'text-[11px] px-1.5 py-0.5 rounded-full',
              activeTab === t.key ? 'bg-[#F0EDE3] text-[#3A4A2A]' : 'bg-transparent text-[#8A9A7A]'
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Records tab */}
      {activeTab === 'records' && (
        <div className="flex flex-col gap-3">
          {RECORDS.map(r => <MedicalRecordCard key={r.id} record={r} />)}
        </div>
      )}

      {/* Allergies tab */}
      {activeTab === 'allergies' && (
        <div className="flex flex-col gap-3">
          {ALLERGIES.map(a => {
            const sc = SEVERITY_CONFIG[a.severity];
            return (
              <div key={a.name} className="bg-white rounded-xl border border-[#E8E4D8] px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                  ⚠️
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1a2e0a]">{a.name}</p>
                  <p className="text-[12.5px] text-[#6B7A5A] mt-0.5">{a.reaction}</p>
                </div>
                <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: sc.color, background: sc.bg }}>
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Vaccinations tab */}
      {activeTab === 'vaccinations' && (
        <div className="flex flex-col gap-3">
          {VACCINATIONS.map(v => (
            <div key={v.name} className="bg-white rounded-xl border border-[#E8E4D8] px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                💉
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#1a2e0a]">{v.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[12px] text-[#6B7A5A]">
                    <Calendar size={11} /> Given: {v.date}
                  </span>
                  {v.nextDue && (
                    <span className="flex items-center gap-1 text-[12px] text-[#8A9A7A]">
                      Next due: {v.nextDue}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                ✓ Done
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
