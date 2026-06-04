'use client';

import React, { useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';

// Interfaces for Organ Management data structures
interface OrganRequest {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  organType: 'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas';
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  urgency: 'Critical' | 'High' | 'Routine';
  status: 'Awaiting Match' | 'Verification' | 'Scheduled' | 'Completed';
  matchPercentage: number | null;
  registeredDate: string;
  hlaCompatibility: {
    classI: string;
    classII: string;
    classIPercent: number;
    classIIPercent: number;
  };
  checklist: {
    identityVerified: boolean;
    medicalClearance: boolean;
    legalConsent: boolean;
  };
  notes?: string;
}

interface DonorRecord {
  id: string;
  donorName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  organType: 'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas';
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  status: 'Awaiting Match' | 'Matched' | 'Verification';
  registeredDate: string;
  checklist: {
    identityVerified: boolean;
    medicalClearance: boolean;
    legalConsent: boolean;
  };
  hlaCompatibility: {
    classI: string;
    classII: string;
    classIPercent: number;
    classIIPercent: number;
  };
  notes?: string;
}

interface SurgeryRecord {
  id: string;
  patientName: string;
  donorName: string;
  organType: 'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas';
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  hospital: string;
  surgicalTeam: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  notes?: string;
}

export default function OrganManagementPage() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'requests' | 'donors' | 'surgeries'>('requests');

  // Interactive filters
  const [searchQuery, setSearchQuery] = useState('');
  const [organFilter, setOrganFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Active entries selection states
  const [selectedRequestId, setSelectedRequestId] = useState<string>('REQ-7841');
  const [selectedDonorId, setSelectedDonorId] = useState<string>('DON-5011');
  const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>('SURG-901');

  // Overlays (modals)
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isRegisterDonorOpen, setIsRegisterDonorOpen] = useState(false);
  const [isScheduleSurgeryOpen, setIsScheduleSurgeryOpen] = useState(false);

  // New Request Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(35);
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newPatientOrgan, setNewPatientOrgan] = useState<'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas'>('Kidney');
  const [newPatientBlood, setNewPatientBlood] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O+');
  const [newPatientUrgency, setNewPatientUrgency] = useState<'Critical' | 'High' | 'Routine'>('Routine');
  const [newPatientNotes, setNewPatientNotes] = useState('');

  // New Donor Form State
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAge, setNewDonorAge] = useState<number>(30);
  const [newDonorGender, setNewDonorGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newDonorOrgan, setNewDonorOrgan] = useState<'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas'>('Kidney');
  const [newDonorBlood, setNewDonorBlood] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O+');
  const [newDonorStatus, setNewDonorStatus] = useState<'Awaiting Match' | 'Matched' | 'Verification'>('Awaiting Match');
  const [newDonorNotes, setNewDonorNotes] = useState('');

  // Schedule Surgery Form State
  const [newSurgPatient, setNewSurgPatient] = useState('');
  const [newSurgDonor, setNewSurgDonor] = useState('');
  const [newSurgOrgan, setNewSurgOrgan] = useState<'Kidney' | 'Heart' | 'Liver' | 'Lung' | 'Pancreas'>('Kidney');
  const [newSurgBlood, setNewSurgBlood] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O+');
  const [newSurgHospital, setNewSurgHospital] = useState("St. Jude's Medical Center");
  const [newSurgTeam, setNewSurgTeam] = useState('Dr. A. Vance, Dr. K. Miller');
  const [newSurgDate, setNewSurgDate] = useState('2026-06-15');
  const [newSurgTime, setNewSurgTime] = useState('08:00 AM');
  const [newSurgNotes, setNewSurgNotes] = useState('');

  // Database States
  const [requests, setRequests] = useState<OrganRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Requests from DB
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/requests?type=Organ');
      // Set to requests
      const mapped = res.data.map((r: any) => ({
        id: r.id || r._id,
        patientName: r.patientName,
        age: r.age,
        gender: r.gender,
        organType: r.organType,
        bloodGroup: r.bloodGroup,
        urgency: r.urgency,
        status: r.status,
        matchPercentage: r.matchPercentage,
        registeredDate: r.registeredDate ? r.registeredDate.split('T')[0] : '',
        hlaCompatibility: r.hlaCompatibility || { classI: '0/6', classII: '0/4', classIPercent: 0, classIIPercent: 0 },
        checklist: r.checklist || { identityVerified: true, medicalClearance: true, legalConsent: true },
        notes: r.notes || '',
      }));
      setRequests(mapped);
      if (mapped.length > 0) {
        setSelectedRequestId(mapped[0].id);
      }
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to fetch organ requests from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);




  // Mock Organ Donors Dataset
  const [donors, setDonors] = useState<DonorRecord[]>([
    {
      id: 'DON-5011',
      donorName: 'Robert Chen',
      age: 34,
      gender: 'Male',
      organType: 'Kidney',
      bloodGroup: 'O+',
      status: 'Matched',
      registeredDate: '2026-05-18',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '6/6', classII: '4/4', classIPercent: 100, classIIPercent: 100 },
      notes: 'Living altruistic kidney donor. Screenings completed, matched with Sarah Jenkins (REQ-7842).'
    },
    {
      id: 'DON-5012',
      donorName: 'Sandra Bullock',
      age: 45,
      gender: 'Female',
      organType: 'Liver',
      bloodGroup: 'B+',
      status: 'Matched',
      registeredDate: '2026-05-11',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '6/6', classII: '3/4', classIPercent: 100, classIIPercent: 75 },
      notes: 'Living liver lobe donor. Matched with Elena Rostova (REQ-7839). All consent docs signed.'
    },
    {
      id: 'DON-5013',
      donorName: 'Gary Vaynerchuk',
      age: 29,
      gender: 'Male',
      organType: 'Heart',
      bloodGroup: 'A-',
      status: 'Verification',
      registeredDate: '2026-05-15',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '6/6', classII: '4/4', classIPercent: 100, classIIPercent: 100 },
      notes: 'Deceased donor registry card holder. Verification active for matching candidate Michael Chang (REQ-7841).'
    },
    {
      id: 'DON-5014',
      donorName: 'Linda Lovelace',
      age: 52,
      gender: 'Female',
      organType: 'Lung',
      bloodGroup: 'O-',
      status: 'Awaiting Match',
      registeredDate: '2026-05-20',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '4/6', classII: '3/4', classIPercent: 66, classIIPercent: 75 },
      notes: 'Altruistic organ donor. Available for match search. Medical clearance verified.'
    },
    {
      id: 'DON-5015',
      donorName: 'Timothy Robbins',
      age: 38,
      gender: 'Male',
      organType: 'Pancreas',
      bloodGroup: 'AB+',
      status: 'Matched',
      registeredDate: '2026-05-08',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '5/6', classII: '4/4', classIPercent: 83, classIIPercent: 100 },
      notes: 'Pancreas donor, matched with Aisha Vance (REQ-7844). Surgery scheduled.'
    },
    {
      id: 'DON-5016',
      donorName: 'Keanu Reeves',
      age: 41,
      gender: 'Male',
      organType: 'Kidney',
      bloodGroup: 'B-',
      status: 'Verification',
      registeredDate: '2026-05-14',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '5/6', classII: '3/4', classIPercent: 83, classIIPercent: 75 },
      notes: 'Altruistic kidney donor, matching check with Carlos Mendez (REQ-7845) in progress.'
    },
    {
      id: 'DON-5017',
      donorName: 'Emma Watson',
      age: 27,
      gender: 'Female',
      organType: 'Heart',
      bloodGroup: 'O+',
      status: 'Awaiting Match',
      registeredDate: '2026-05-21',
      checklist: { identityVerified: true, medicalClearance: false, legalConsent: true },
      hlaCompatibility: { classI: '2/6', classII: '1/4', classIPercent: 33, classIIPercent: 25 },
      notes: 'Deceased donor match screening. Final medical clearance pending.'
    },
    {
      id: 'DON-5018',
      donorName: 'Christian Bale',
      age: 36,
      gender: 'Male',
      organType: 'Liver',
      bloodGroup: 'A+',
      status: 'Matched',
      registeredDate: '2026-04-29',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '6/6', classII: '4/4', classIPercent: 100, classIIPercent: 100 },
      notes: 'Living liver lobe transplant successfully donated to Arthur Pendelton (REQ-7847).'
    },
    {
      id: 'DON-5019',
      donorName: 'Florence Nightingale',
      age: 23,
      gender: 'Female',
      organType: 'Kidney',
      bloodGroup: 'AB-',
      status: 'Awaiting Match',
      registeredDate: '2026-05-12',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '3/6', classII: '2/4', classIPercent: 50, classIIPercent: 50 },
      notes: 'Living donor. Awaiting compatible high-match score recipient.'
    },
    {
      id: 'DON-5020',
      donorName: 'Ryan Reynolds',
      age: 39,
      gender: 'Male',
      organType: 'Lung',
      bloodGroup: 'B+',
      status: 'Verification',
      registeredDate: '2026-05-19',
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: { classI: '5/6', classII: '4/4', classIPercent: 83, classIIPercent: 100 },
      notes: 'Deceased donor candidate, lung match for Marcus Aurelius (REQ-7849) undergoing cross-matching.'
    }
  ]);

  // Mock Surgery Schedule Dataset
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([
    {
      id: 'SURG-901',
      patientName: 'Michael Chang',
      donorName: 'Gary Vaynerchuk',
      organType: 'Heart',
      bloodGroup: 'A-',
      hospital: "St. Jude's Medical Center",
      surgicalTeam: 'Dr. A. Vance, Dr. K. Miller',
      scheduledDate: '2026-06-02',
      scheduledTime: '08:00 AM',
      status: 'Scheduled',
      notes: 'Cardiothoracic team prepped. Donor heart delivery coordinated via LIFELINK emergency ambulance service.'
    },
    {
      id: 'SURG-902',
      patientName: 'Elena Rostova',
      donorName: 'Sandra Bullock',
      organType: 'Liver',
      bloodGroup: 'B+',
      hospital: 'Central Medicare Center',
      surgicalTeam: 'Dr. L. Stone, Dr. T. Jenkins',
      scheduledDate: '2026-05-29',
      scheduledTime: '10:30 AM',
      status: 'Scheduled',
      notes: 'Living donor liver segment transplant. Dual operating rooms prepped.'
    },
    {
      id: 'SURG-903',
      patientName: 'Aisha Vance',
      donorName: 'Timothy Robbins',
      organType: 'Pancreas',
      bloodGroup: 'AB+',
      hospital: 'General Medical Hub',
      surgicalTeam: 'Dr. R. Patel, Dr. H. Cho',
      scheduledDate: '2026-05-25',
      scheduledTime: '02:00 PM',
      status: 'Scheduled',
      notes: 'Pancreas replacement procedure. Patient pre-op vitals stable.'
    },
    {
      id: 'SURG-904',
      patientName: 'Arthur Pendelton',
      donorName: 'Christian Bale',
      organType: 'Liver',
      bloodGroup: 'A+',
      hospital: 'Metro General Hospital',
      surgicalTeam: 'Dr. M. Diaz, Dr. N. Al-Jamil',
      scheduledDate: '2026-05-20',
      scheduledTime: '09:00 AM',
      status: 'Completed',
      notes: 'Transplant completed successfully. Patient in ICU recovery showing excellent initial organ function.'
    },
    {
      id: 'SURG-906',
      patientName: 'Sarah Jenkins',
      donorName: 'Robert Chen',
      organType: 'Kidney',
      bloodGroup: 'O+',
      hospital: "St. Jude's Medical Center",
      surgicalTeam: 'Dr. K. Miller, Dr. J. Lopez',
      scheduledDate: '2026-06-05',
      scheduledTime: '07:30 AM',
      status: 'Scheduled',
      notes: 'Living donor renal transplant. Pre-operative crossmatching fully compatible.'
    },
    {
      id: 'SURG-907',
      patientName: 'Marcus Aurelius',
      donorName: 'Ryan Reynolds',
      organType: 'Lung',
      bloodGroup: 'B+',
      hospital: 'Metro General Hospital',
      surgicalTeam: 'Dr. A. Vance, Dr. F. Patel',
      scheduledDate: '2026-06-08',
      scheduledTime: '09:00 AM',
      status: 'Scheduled',
      notes: 'Double lung transplant. Recipient matching confirmed.'
    },
    {
      id: 'SURG-908',
      patientName: 'Carlos Mendez',
      donorName: 'Keanu Reeves',
      organType: 'Kidney',
      bloodGroup: 'B-',
      hospital: 'Central Medicare Center',
      surgicalTeam: 'Dr. L. Stone, Dr. M. Diaz',
      scheduledDate: '2026-06-10',
      scheduledTime: '08:30 AM',
      status: 'Scheduled',
      notes: 'Renal transplant from living donor. Clearance and checklist finalized.'
    }
  ]);

  // Derive display values from mock datasets to match target baseline stats
  const activeRequestsCount = useMemo(() => {
    return 132 + requests.filter(r => r.status !== 'Completed').length;
  }, [requests]);

  const awaitingMatchCount = useMemo(() => {
    return 80 + requests.filter(r => r.status === 'Awaiting Match').length;
  }, [requests]);

  const underVerificationCount = useMemo(() => {
    return 30 + requests.filter(r => r.status === 'Verification').length;
  }, [requests]);

  const scheduledSurgeriesCount = useMemo(() => {
    return 14 + surgeries.filter(s => s.status === 'Scheduled').length;
  }, [surgeries]);

  const registeredDonorsCount = useMemo(() => {
    return 1194 + donors.length;
  }, [donors]);

  // Derived Critical Count from requests
  const criticalCount = useMemo(() => {
    return requests.filter(r => r.urgency === 'Critical' && r.status !== 'Completed').length;
  }, [requests]);

  // Selected item objects
  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || requests[0];
  }, [requests, selectedRequestId]);

  const selectedDonor = useMemo(() => {
    return donors.find(d => d.id === selectedDonorId) || donors[0];
  }, [donors, selectedDonorId]);

  const selectedSurgery = useMemo(() => {
    return surgeries.find(s => s.id === selectedSurgeryId) || surgeries[0];
  }, [surgeries, selectedSurgeryId]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(item => {
      const matchSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOrgan = organFilter === 'All' || item.organType === organFilter;
      const matchBlood = bloodFilter === 'All' || item.bloodGroup === bloodFilter;
      const matchUrgency = urgencyFilter === 'All' || item.urgency === urgencyFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchOrgan && matchBlood && matchUrgency && matchStatus;
    });
  }, [requests, searchQuery, organFilter, bloodFilter, urgencyFilter, statusFilter]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donors.filter(item => {
      const matchSearch =
        item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOrgan = organFilter === 'All' || item.organType === organFilter;
      const matchBlood = bloodFilter === 'All' || item.bloodGroup === bloodFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchOrgan && matchBlood && matchStatus;
    });
  }, [donors, searchQuery, organFilter, bloodFilter, statusFilter]);

  // Filter surgeries
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(item => {
      const matchSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOrgan = organFilter === 'All' || item.organType === organFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchOrgan && matchStatus;
    });
  }, [surgeries, searchQuery, organFilter, statusFilter]);

  // Organ Icon helper
  const getOrganIcon = (organ: string) => {
    switch (organ) {
      case 'Kidney':
        return <span className="material-symbols-outlined text-[18px] text-[#3e5219]">nephrology</span>;
      case 'Heart':
        return <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">monitor_heart</span>;
      case 'Liver':
        return <span className="material-symbols-outlined text-[18px] text-[#496800]">water_drop</span>;
      case 'Lung':
        return <span className="material-symbols-outlined text-[18px] text-[#596a3d]">lungs</span>;
      case 'Pancreas':
        return <span className="material-symbols-outlined text-[18px] text-amber-700">health_and_safety</span>;
      default:
        return <span className="material-symbols-outlined text-[18px]">medical_services</span>;
    }
  };

  // Form Submit Handlers
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newId = `REQ-${Math.floor(7850 + Math.random() * 150)}`;
    const newReq: OrganRequest = {
      id: newId,
      patientName: newPatientName,
      age: newPatientAge,
      gender: newPatientGender,
      organType: newPatientOrgan,
      bloodGroup: newPatientBlood,
      urgency: newPatientUrgency,
      status: 'Awaiting Match',
      matchPercentage: null,
      registeredDate: new Date().toISOString().split('T')[0],
      hlaCompatibility: { classI: '0/6', classII: '0/4', classIPercent: 0, classIIPercent: 0 },
      checklist: { identityVerified: true, medicalClearance: false, legalConsent: false },
      notes: newPatientNotes || 'No notes added.'
    };

    setRequests([newReq, ...requests]);
    setSelectedRequestId(newId);
    setIsCreateRequestOpen(false);

    // Reset Form
    setNewPatientName('');
    setNewPatientAge(35);
    setNewPatientGender('Male');
    setNewPatientOrgan('Kidney');
    setNewPatientBlood('O+');
    setNewPatientUrgency('Routine');
    setNewPatientNotes('');

    showToast(`Successfully created organ request ${newId} for ${newPatientName}.`);
  };

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    const newId = `DON-${Math.floor(5021 + Math.random() * 100)}`;
    const newDon: DonorRecord = {
      id: newId,
      donorName: newDonorName,
      age: newDonorAge,
      gender: newDonorGender,
      organType: newDonorOrgan,
      bloodGroup: newDonorBlood,
      status: newDonorStatus,
      registeredDate: new Date().toISOString().split('T')[0],
      checklist: { identityVerified: true, medicalClearance: true, legalConsent: true },
      hlaCompatibility: {
        classI: newDonorStatus === 'Matched' ? '6/6' : '3/6',
        classII: newDonorStatus === 'Matched' ? '4/4' : '2/4',
        classIPercent: newDonorStatus === 'Matched' ? 100 : 50,
        classIIPercent: newDonorStatus === 'Matched' ? 100 : 50
      },
      notes: newDonorNotes || 'No notes added.'
    };

    setDonors([newDon, ...donors]);
    setSelectedDonorId(newId);
    setIsRegisterDonorOpen(false);

    // Reset Form
    setNewDonorName('');
    setNewDonorAge(30);
    setNewDonorGender('Male');
    setNewDonorOrgan('Kidney');
    setNewDonorBlood('O+');
    setNewDonorStatus('Awaiting Match');
    setNewDonorNotes('');

    showToast(`Successfully registered donor ${newId} (${newDonorName}).`);
  };

  const handleScheduleSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurgPatient.trim() || !newSurgDonor.trim()) return;

    const newId = `SURG-${Math.floor(909 + Math.random() * 50)}`;
    const newSurg: SurgeryRecord = {
      id: newId,
      patientName: newSurgPatient,
      donorName: newSurgDonor,
      organType: newSurgOrgan,
      bloodGroup: newSurgBlood,
      hospital: newSurgHospital,
      surgicalTeam: newSurgTeam,
      scheduledDate: newSurgDate,
      scheduledTime: newSurgTime,
      status: 'Scheduled',
      notes: newSurgNotes || 'Scheduled transplant procedure.'
    };

    setSurgeries([newSurg, ...surgeries]);
    setSelectedSurgeryId(newId);
    setIsScheduleSurgeryOpen(false);

    // If a request was verification state, let's mark it scheduled
    setRequests(prev =>
      prev.map(r => {
        if (r.patientName.toLowerCase() === newSurgPatient.toLowerCase()) {
          return { ...r, status: 'Scheduled', matchPercentage: 98 };
        }
        return r;
      })
    );

    // If a donor was matched/verification state, mark it Matched
    setDonors(prev =>
      prev.map(d => {
        if (d.donorName.toLowerCase() === newSurgDonor.toLowerCase()) {
          return { ...d, status: 'Matched' };
        }
        return d;
      })
    );

    // Reset Form
    setNewSurgPatient('');
    setNewSurgDonor('');
    setNewSurgNotes('');

    showToast(`Successfully scheduled transplant surgery ${newId}.`);
  };

  // Toggle checklist values locally
  const toggleRequestChecklist = (field: 'identityVerified' | 'medicalClearance' | 'legalConsent') => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === selectedRequestId) {
          const updatedChecklist = { ...r.checklist, [field]: !r.checklist[field] };
          return { ...r, checklist: updatedChecklist };
        }
        return r;
      })
    );
  };

  const toggleDonorChecklist = (field: 'identityVerified' | 'medicalClearance' | 'legalConsent') => {
    setDonors(prev =>
      prev.map(d => {
        if (d.id === selectedDonorId) {
          const updatedChecklist = { ...d.checklist, [field]: !d.checklist[field] };
          return { ...d, checklist: updatedChecklist };
        }
        return d;
      })
    );
  };

  // Setup schedule surgery autofill fields from current selected item
  const openScheduleSurgeryFromMatch = () => {
    if (activeTab === 'requests' && selectedRequest) {
      setNewSurgPatient(selectedRequest.patientName);
      setNewSurgOrgan(selectedRequest.organType);
      setNewSurgBlood(selectedRequest.bloodGroup);
      // Try to find a matching donor name or auto-generate
      const matchingDonor = donors.find(
        d => d.organType === selectedRequest.organType && d.bloodGroup === selectedRequest.bloodGroup
      );
      if (matchingDonor) {
        setNewSurgDonor(matchingDonor.donorName);
      } else {
        setNewSurgDonor('Anonymous Donor');
      }
      setIsScheduleSurgeryOpen(true);
    } else if (activeTab === 'donors' && selectedDonor) {
      setNewSurgDonor(selectedDonor.donorName);
      setNewSurgOrgan(selectedDonor.organType);
      setNewSurgBlood(selectedDonor.bloodGroup);
      const matchingReq = requests.find(
        r => r.organType === selectedDonor.organType && r.bloodGroup === selectedDonor.bloodGroup
      );
      if (matchingReq) {
        setNewSurgPatient(matchingReq.patientName);
      } else {
        setNewSurgPatient('Awaiting Patient Allocation');
      }
      setIsScheduleSurgeryOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-lg text-[#121c2a] select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3e5219] text-white px-lg py-md rounded-xl shadow-2xl flex items-center gap-md border border-[#c8f17a]/30 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#c8f17a]">check_circle</span>
          <span className="font-body-md font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col gap-sm">
        <nav className="flex items-center text-[#45483c] font-label-caps text-label-caps gap-xs text-xs">
          <span>Admin</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#3e5219] font-bold">Organ Management</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-[#3e5219] tracking-tight">Organ Management</h1>
          </div>
          <div className="flex gap-md items-center w-full md:w-auto">
            <div className="bg-[#d9e3f6] p-1.5 rounded-xl flex gap-xs">
              <button
                onClick={() => {
                  setActiveTab('requests');
                  setSearchQuery('');
                  setOrganFilter('All');
                  setBloodFilter('All');
                  setStatusFilter('All');
                  setUrgencyFilter('All');
                }}
                className={`px-md py-2 rounded-lg font-label-caps text-label-caps transition-all ${
                  activeTab === 'requests'
                    ? 'bg-[#3e5219] text-white shadow-sm'
                    : 'text-[#45483c] hover:bg-[#e6eeff]'
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => {
                  setActiveTab('donors');
                  setSearchQuery('');
                  setOrganFilter('All');
                  setBloodFilter('All');
                  setStatusFilter('All');
                  setUrgencyFilter('All');
                }}
                className={`px-md py-2 rounded-lg font-label-caps text-label-caps transition-all ${
                  activeTab === 'donors'
                    ? 'bg-[#3e5219] text-white shadow-sm'
                    : 'text-[#45483c] hover:bg-[#e6eeff]'
                }`}
              >
                Donor Registry
              </button>
              <button
                onClick={() => {
                  setActiveTab('surgeries');
                  setSearchQuery('');
                  setOrganFilter('All');
                  setBloodFilter('All');
                  setStatusFilter('All');
                  setUrgencyFilter('All');
                }}
                className={`px-md py-2 rounded-lg font-label-caps text-label-caps transition-all ${
                  activeTab === 'surgeries'
                    ? 'bg-[#3e5219] text-white shadow-sm'
                    : 'text-[#45483c] hover:bg-[#e6eeff]'
                }`}
              >
                Surgeries
              </button>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'requests') setIsCreateRequestOpen(true);
                else if (activeTab === 'donors') setIsRegisterDonorOpen(true);
                else setIsScheduleSurgeryOpen(true);
              }}
              className="bg-gradient-to-br from-[#3e5219] to-[#c8f17a] text-white hover:brightness-105 font-medium px-md py-2.5 rounded-xl shadow-md transition-all flex items-center gap-xs ml-auto shrink-0 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {activeTab === 'requests' ? 'Create Request' : activeTab === 'donors' ? 'Register Donor' : 'Schedule Surgery'}
            </button>
          </div>
        </div>
      </header>

      {/* Critical Banner */}
      {criticalCount > 0 && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-2xl p-md flex items-center justify-between shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-md">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ba1a1a]"></span>
            </div>
            <span className="font-headline-sm text-headline-sm text-[#93000a] text-sm md:text-base font-semibold">
              {criticalCount} Critical Cases Require Immediate Match Resolution
            </span>
          </div>
          <button
            onClick={() => {
              setUrgencyFilter('Critical');
              setActiveTab('requests');
            }}
            className="text-[#ba1a1a] font-semibold text-xs md:text-sm flex items-center gap-xs hover:bg-[#ba1a1a]/10 px-md py-1.5 rounded-lg transition-colors border border-[#ba1a1a]/10 shrink-0"
          >
            View Cases <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-md md:gap-lg">
        <div
          onClick={() => {
            setActiveTab('requests');
            setStatusFilter('All');
            setUrgencyFilter('All');
          }}
          className={`cursor-pointer rounded-2xl p-lg flex flex-col gap-sm border border-[#C7D2C0] shadow-sm transition-all duration-300 hover:translate-y-[-2px] ${
            activeTab === 'requests' && statusFilter === 'All' && urgencyFilter === 'All'
              ? 'bg-[#3e5219]/10 border-[#3e5219] border-l-4'
              : 'bg-[#DDE5D3]'
          }`}
        >
          <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Active Requests</span>
          <span className="font-headline-lg text-headline-lg text-[#3e5219] text-3xl font-bold">{activeRequestsCount}</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('requests');
            setStatusFilter('Awaiting Match');
            setUrgencyFilter('All');
          }}
          className={`cursor-pointer rounded-2xl p-lg flex flex-col gap-sm border border-[#C7D2C0] shadow-sm transition-all duration-300 hover:translate-y-[-2px] ${
            activeTab === 'requests' && statusFilter === 'Awaiting Match'
              ? 'bg-[#3e5219]/10 border-[#3e5219] border-l-4'
              : 'bg-[#DDE5D3]'
          }`}
        >
          <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Awaiting Match</span>
          <span className="font-headline-lg text-headline-lg text-[#121c2a] text-3xl font-bold">{awaitingMatchCount}</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('requests');
            setStatusFilter('Verification');
            setUrgencyFilter('All');
          }}
          className={`cursor-pointer rounded-2xl p-lg flex flex-col gap-sm border border-[#C7D2C0] shadow-sm transition-all duration-300 hover:translate-y-[-2px] ${
            activeTab === 'requests' && statusFilter === 'Verification'
              ? 'bg-[#3e5219]/10 border-[#3e5219] border-l-4'
              : 'bg-[#DDE5D3]'
          }`}
        >
          <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Under Verification</span>
          <span className="font-headline-lg text-headline-lg text-[#121c2a] text-3xl font-bold">{underVerificationCount}</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('surgeries');
            setStatusFilter('Scheduled');
          }}
          className={`cursor-pointer rounded-2xl p-lg flex flex-col gap-sm border border-[#C7D2C0] shadow-sm transition-all duration-300 hover:translate-y-[-2px] ${
            activeTab === 'surgeries' && statusFilter === 'Scheduled'
              ? 'bg-[#3e5219]/10 border-[#3e5219] border-l-4'
              : 'bg-[#DDE5D3]'
          }`}
        >
          <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Surgery Scheduled</span>
          <span className="font-headline-lg text-headline-lg text-[#121c2a] text-3xl font-bold">{scheduledSurgeriesCount}</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('donors');
            setStatusFilter('All');
          }}
          className={`cursor-pointer rounded-2xl p-lg flex flex-col gap-sm border border-[#C7D2C0] shadow-sm transition-all duration-300 hover:translate-y-[-2px] ${
            activeTab === 'donors' && statusFilter === 'All'
              ? 'bg-[#3e5219]/10 border-[#3e5219] border-l-4'
              : 'bg-[#DDE5D3]'
          }`}
        >
          <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Registered Donors</span>
          <span className="font-headline-lg text-headline-lg text-[#121c2a] text-3xl font-bold">{registeredDonorsCount}</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-lg items-start">
        
        {/* Left Column: Table & Filters */}
        <div className="flex-1 w-full flex flex-col gap-lg min-w-0">
          
          {/* Filters Bar */}
          <div className="bg-[#DDE5D3] border border-[#C7D2C0] rounded-2xl p-md flex flex-col md:flex-row gap-sm items-center justify-between shadow-sm">
            
            {/* Search */}
            <div className="flex items-center gap-sm bg-white rounded-xl px-sm py-2 border border-[#c5c8b8] focus-within:border-[#3e5219] transition-all w-full md:flex-1">
              <span className="material-symbols-outlined text-[#75796b]">search</span>
              <input
                type="text"
                placeholder={
                  activeTab === 'requests'
                    ? 'Search requests by patient or ID...'
                    : activeTab === 'donors'
                    ? 'Search donors by name or ID...'
                    : 'Search surgeries by patient or hospital...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full text-[#121c2a] placeholder-[#75796b]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#75796b] hover:text-[#3e5219]">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap gap-sm items-center w-full md:w-auto">
              {/* Organ Filter */}
              <select
                value={organFilter}
                onChange={(e) => setOrganFilter(e.target.value)}
                className="bg-white border border-[#c5c8b8] text-xs font-medium rounded-xl py-2 pl-sm pr-lg text-[#45483c] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
              >
                <option value="All">All Organs</option>
                <option value="Kidney">Kidney</option>
                <option value="Heart">Heart</option>
                <option value="Liver">Liver</option>
                <option value="Lung">Lung</option>
                <option value="Pancreas">Pancreas</option>
              </select>

              {/* Blood group Filter (For Requests & Donors) */}
              {activeTab !== 'surgeries' && (
                <select
                  value={bloodFilter}
                  onChange={(e) => setBloodFilter(e.target.value)}
                  className="bg-white border border-[#c5c8b8] text-xs font-medium rounded-xl py-2 pl-sm pr-lg text-[#45483c] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                >
                  <option value="All">All Blood</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              )}

              {/* Urgency Filter (For Requests) */}
              {activeTab === 'requests' && (
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="bg-white border border-[#c5c8b8] text-xs font-medium rounded-xl py-2 pl-sm pr-lg text-[#45483c] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                >
                  <option value="All">All Urgency</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Routine">Routine</option>
                </select>
              )}

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#c5c8b8] text-xs font-medium rounded-xl py-2 pl-sm pr-lg text-[#45483c] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
              >
                <option value="All">All Status</option>
                {activeTab === 'requests' && (
                  <>
                    <option value="Awaiting Match">Awaiting Match</option>
                    <option value="Verification">Verification</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </>
                )}
                {activeTab === 'donors' && (
                  <>
                    <option value="Awaiting Match">Awaiting Match</option>
                    <option value="Matched">Matched</option>
                    <option value="Verification">Verification</option>
                  </>
                )}
                {activeTab === 'surgeries' && (
                  <>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </>
                )}
              </select>

              {/* Clear filters shortcut */}
              {(searchQuery || organFilter !== 'All' || bloodFilter !== 'All' || urgencyFilter !== 'All' || statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOrganFilter('All');
                    setBloodFilter('All');
                    setUrgencyFilter('All');
                    setStatusFilter('All');
                  }}
                  className="text-xs text-[#3e5219] hover:underline font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">filter_alt_off</span> Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#DDE5D3] border border-[#C7D2C0] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              
              {/* TAB 1: Organ Requests Table */}
              {activeTab === 'requests' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#C7D2C0] bg-[#3e5219]/5">
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Request ID</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Patient</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Organ</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Blood</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Urgency</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Status</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C7D2C0]/50 text-sm">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-lg text-center text-[#45483c]">
                          No organ requests matched the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRequestId(item.id)}
                          className={`hover:bg-[#3e5219]/5 transition-all cursor-pointer ${
                            selectedRequestId === item.id ? 'bg-[#3e5219]/10 font-medium' : ''
                          }`}
                        >
                          <td className="p-md font-medium text-[#3e5219]">{item.id}</td>
                          <td className="p-md">
                            <div className="flex flex-col">
                              <span>{item.patientName}</span>
                              <span className="text-[11px] text-[#45483c]">{item.age} Yrs • {item.gender}</span>
                            </div>
                          </td>
                          <td className="p-md">
                            <span className="flex items-center gap-xs capitalize">
                              {getOrganIcon(item.organType)}
                              {item.organType}
                            </span>
                          </td>
                          <td className="p-md font-semibold">{item.bloodGroup}</td>
                          <td className="p-md">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-label-caps border ${
                                item.urgency === 'Critical'
                                  ? 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]'
                                  : item.urgency === 'High'
                                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                                  : 'bg-[#EFF2EE] text-[#45483c] border-[#C7D2C0]'
                              }`}
                            >
                              {item.urgency}
                            </span>
                          </td>
                          <td className="p-md">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.status === 'Completed'
                                    ? 'bg-[#3e5219]'
                                    : item.status === 'Scheduled'
                                    ? 'bg-[#496800]'
                                    : item.status === 'Verification'
                                    ? 'bg-amber-600'
                                    : 'bg-gray-500'
                                }`}
                              ></span>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-md">
                            {item.matchPercentage !== null ? (
                              <span className="text-[#3e5219] font-bold">{item.matchPercentage}%</span>
                            ) : (
                              <span className="text-[#45483c]">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: Donors Registry Table */}
              {activeTab === 'donors' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#C7D2C0] bg-[#3e5219]/5">
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Donor ID</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Donor Name</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Organ</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Blood</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Registered</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Health Clear</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C7D2C0]/50 text-sm">
                    {filteredDonors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-lg text-center text-[#45483c]">
                          No donor registries matched the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDonors.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedDonorId(item.id)}
                          className={`hover:bg-[#3e5219]/5 transition-all cursor-pointer ${
                            selectedDonorId === item.id ? 'bg-[#3e5219]/10 font-medium' : ''
                          }`}
                        >
                          <td className="p-md font-medium text-[#3e5219]">{item.id}</td>
                          <td className="p-md">
                            <div className="flex flex-col">
                              <span>{item.donorName}</span>
                              <span className="text-[11px] text-[#45483c]">{item.age} Yrs • {item.gender}</span>
                            </div>
                          </td>
                          <td className="p-md flex items-center gap-xs capitalize">
                            {getOrganIcon(item.organType)}
                            {item.organType}
                          </td>
                          <td className="p-md font-semibold">{item.bloodGroup}</td>
                          <td className="p-md">{item.registeredDate}</td>
                          <td className="p-md">
                            <span className="flex items-center gap-1.5 text-xs text-[#3e5219] font-medium">
                              <span className="material-symbols-outlined text-[16px] text-[#3e5219]">check_circle</span>
                              Cleared
                            </span>
                          </td>
                          <td className="p-md">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-label-caps border ${
                                item.status === 'Matched'
                                  ? 'bg-[#d2eca2] text-[#394d14] border-[#d2eca2]'
                                  : item.status === 'Verification'
                                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                                  : 'bg-sky-50 text-sky-900 border-sky-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 3: Surgeries Table */}
              {activeTab === 'surgeries' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#C7D2C0] bg-[#3e5219]/5">
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Surgery ID</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Patient / Donor</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Organ</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Location</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Date & Time</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Team</th>
                      <th className="p-md font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C7D2C0]/50 text-sm">
                    {filteredSurgeries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-lg text-center text-[#45483c]">
                          No surgery appointments matched the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSurgeries.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedSurgeryId(item.id)}
                          className={`hover:bg-[#3e5219]/5 transition-all cursor-pointer ${
                            selectedSurgeryId === item.id ? 'bg-[#3e5219]/10 font-medium' : ''
                          }`}
                        >
                          <td className="p-md font-medium text-[#3e5219]">{item.id}</td>
                          <td className="p-md">
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.patientName}</span>
                              <span className="text-[11px] text-[#45483c]">Donor: {item.donorName}</span>
                            </div>
                          </td>
                          <td className="p-md">
                            <span className="flex items-center gap-xs capitalize">
                              {getOrganIcon(item.organType)}
                              {item.organType}
                            </span>
                          </td>
                          <td className="p-md text-xs">{item.hospital}</td>
                          <td className="p-md text-xs">
                            <div className="flex flex-col">
                              <span>{item.scheduledDate}</span>
                              <span className="text-[#3e5219] font-medium">{item.scheduledTime}</span>
                            </div>
                          </td>
                          <td className="p-md text-[11px] text-[#45483c] max-w-[120px] truncate">{item.surgicalTeam}</td>
                          <td className="p-md">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-label-caps border ${
                                item.status === 'Completed'
                                  ? 'bg-[#3e5219] text-white border-[#3e5219]'
                                  : item.status === 'In Progress'
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : 'bg-[#EFF2EE] text-[#45483c] border-[#C7D2C0]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>

        {/* Right Side details drawer panel */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-4">
          
          {/* DETAIL VIEW: Organ Requests */}
          {activeTab === 'requests' && selectedRequest && (
            <div className="bg-[#DDE5D3] border border-[#C7D2C0] rounded-2xl p-lg flex flex-col gap-lg shadow-sm">
              <div className="flex justify-between items-start border-b border-[#C7D2C0]/50 pb-md">
                <div>
                  <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold block mb-xs">Request Details</span>
                  <h3 className="font-headline-sm text-headline-sm text-[#3e5219] text-xl font-bold">{selectedRequest.id}</h3>
                  <p className="text-body-sm text-[#45483c] text-sm mt-0.5">{selectedRequest.patientName} • {selectedRequest.age} Yrs • {selectedRequest.gender}</p>
                </div>
                <span className="bg-[#3e5219]/10 text-[#3e5219] text-[10px] px-2 py-0.5 font-bold font-label-caps rounded border border-[#3e5219]/20 uppercase">
                  {selectedRequest.organType} Need
                </span>
              </div>

              {/* HLA Compatibility breakdown */}
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">HLA Compatibility Match</h4>
                  {selectedRequest.matchPercentage !== null && (
                    <span className="text-xs bg-[#c8f17a] text-[#364e00] font-bold px-2 py-0.5 rounded-full">
                      {selectedRequest.matchPercentage}% Compatible
                    </span>
                  )}
                </div>
                
                <div className="bg-white/40 border border-[#C7D2C0]/60 rounded-xl p-md space-y-sm">
                  <div className="flex justify-between text-xs text-[#121c2a]">
                    <span>Class I (A, B, C)</span>
                    <span className="font-bold text-[#3e5219]">
                      {selectedRequest.status === 'Awaiting Match' ? 'No match registered' : `${selectedRequest.hlaCompatibility.classI} Match`}
                    </span>
                  </div>
                  <div className="w-full bg-[#EFF2EE] rounded-full h-2">
                    <div
                      className="bg-[#3e5219] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedRequest.hlaCompatibility.classIPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-[#121c2a] pt-xs">
                    <span>Class II (DR, DQ)</span>
                    <span className="font-bold text-[#3e5219]">
                      {selectedRequest.status === 'Awaiting Match' ? 'No match registered' : `${selectedRequest.hlaCompatibility.classII} Match`}
                    </span>
                  </div>
                  <div className="w-full bg-[#EFF2EE] rounded-full h-2">
                    <div
                      className="bg-[#3e5219] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedRequest.hlaCompatibility.classIIPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-md">
                <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Verification Checklist</h4>
                
                <ul className="space-y-sm text-sm">
                  <li
                    onClick={() => toggleRequestChecklist('identityVerified')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedRequest.checklist.identityVerified ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedRequest.checklist.identityVerified ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedRequest.checklist.identityVerified ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Patient Identity Verified
                    </span>
                  </li>

                  <li
                    onClick={() => toggleRequestChecklist('medicalClearance')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedRequest.checklist.medicalClearance ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedRequest.checklist.medicalClearance ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedRequest.checklist.medicalClearance ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Medical Clearance Profile
                    </span>
                  </li>

                  <li
                    onClick={() => toggleRequestChecklist('legalConsent')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedRequest.checklist.legalConsent ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedRequest.checklist.legalConsent ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedRequest.checklist.legalConsent ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Legal Consent & Ethics Forms
                    </span>
                  </li>
                </ul>
              </div>

              {/* Case notes */}
              {selectedRequest.notes && (
                <div className="space-y-sm">
                  <span className="font-label-caps text-label-caps text-[#45483c] text-[10px] font-semibold">Clinical Dispatch Notes</span>
                  <div className="bg-[#EFF2EE]/70 rounded-xl p-md border border-[#C7D2C0]/40 text-xs text-[#45483c] leading-relaxed">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-md border-t border-[#C7D2C0]/50 mt-auto space-y-sm">
                {selectedRequest.status === 'Verification' &&
                selectedRequest.checklist.identityVerified &&
                selectedRequest.checklist.medicalClearance &&
                selectedRequest.checklist.legalConsent ? (
                  <button
                    onClick={openScheduleSurgeryFromMatch}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Schedule Surgery Match
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (selectedRequest.status === 'Awaiting Match') {
                        // Scan for suitable match automatically
                        const matchedDonors = donors.filter(
                          d => d.organType === selectedRequest.organType && d.bloodGroup === selectedRequest.bloodGroup && d.status === 'Awaiting Match'
                        );
                        if (matchedDonors.length > 0) {
                          const topMatch = matchedDonors[0];
                          
                          // Update request to Verification and give a match score
                          setRequests(prev =>
                            prev.map(r => {
                              if (r.id === selectedRequest.id) {
                                return {
                                  ...r,
                                  status: 'Verification',
                                  matchPercentage: 96,
                                  hlaCompatibility: { classI: '6/6', classII: '3/4', classIPercent: 100, classIIPercent: 75 }
                                };
                              }
                              return r;
                            })
                          );

                          // Update donor to matched status
                          setDonors(prev =>
                            prev.map(d => {
                              if (d.id === topMatch.id) {
                                return { ...d, status: 'Verification' };
                              }
                              return d;
                            })
                          );

                          showToast(`LIFELINK Cross-matching: Found compatible match for ${selectedRequest.patientName} with donor ${topMatch.donorName} (${topMatch.id})!`);
                        } else {
                          showToast(`No compatible O+ / matched HLA donors found in registry cache for ${selectedRequest.patientName}. Matching algorithm remains active.`);
                        }
                      } else {
                        showToast(`Clinical dossier is undergoing bio-ethics validation. Complete the checklist items above.`);
                      }
                    }}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    {selectedRequest.status === 'Awaiting Match' ? 'Run Matching Search' : 'Review Full Case Dossier'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DETAIL VIEW: Donor Registry */}
          {activeTab === 'donors' && selectedDonor && (
            <div className="bg-[#DDE5D3] border border-[#C7D2C0] rounded-2xl p-lg flex flex-col gap-lg shadow-sm">
              <div className="flex justify-between items-start border-b border-[#C7D2C0]/50 pb-md">
                <div>
                  <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold block mb-xs">Donor Dossier</span>
                  <h3 className="font-headline-sm text-headline-sm text-[#3e5219] text-xl font-bold">{selectedDonor.id}</h3>
                  <p className="text-body-sm text-[#45483c] text-sm mt-0.5">{selectedDonor.donorName} • {selectedDonor.age} Yrs • {selectedDonor.gender}</p>
                </div>
                <span className="bg-[#496800]/10 text-[#496800] text-[10px] px-2 py-0.5 font-bold font-label-caps rounded border border-[#496800]/20 uppercase">
                  {selectedDonor.organType} Donor
                </span>
              </div>

              {/* Donor compatibility markers */}
              <div className="space-y-md">
                <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">HLA Antigens Profile</h4>
                <div className="bg-white/40 border border-[#C7D2C0]/60 rounded-xl p-md space-y-sm text-xs">
                  <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                    <span className="text-[#45483c]">HLA-A, B, C Antigens</span>
                    <span className="font-semibold text-[#121c2a]">{selectedDonor.hlaCompatibility.classI} Markers</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                    <span className="text-[#45483c]">HLA-DR, DQ Antigens</span>
                    <span className="font-semibold text-[#121c2a]">{selectedDonor.hlaCompatibility.classII} Markers</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#45483c]">Blood Compatibility</span>
                    <span className="font-bold text-[#3e5219]">{selectedDonor.bloodGroup} Group</span>
                  </div>
                </div>
              </div>

              {/* Donor Verification Checklist */}
              <div className="space-y-md">
                <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Donor Clearances</h4>
                <ul className="space-y-sm text-sm">
                  <li
                    onClick={() => toggleDonorChecklist('identityVerified')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedDonor.checklist.identityVerified ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedDonor.checklist.identityVerified ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedDonor.checklist.identityVerified ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Consent Form Signed
                    </span>
                  </li>

                  <li
                    onClick={() => toggleDonorChecklist('medicalClearance')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedDonor.checklist.medicalClearance ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedDonor.checklist.medicalClearance ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedDonor.checklist.medicalClearance ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Viral Screenings Cleared
                    </span>
                  </li>

                  <li
                    onClick={() => toggleDonorChecklist('legalConsent')}
                    className="flex items-center gap-sm cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${
                      selectedDonor.checklist.legalConsent ? 'text-[#3e5219]' : 'text-[#75796b]'
                    }`}>
                      {selectedDonor.checklist.legalConsent ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={selectedDonor.checklist.legalConsent ? 'text-[#121c2a]' : 'text-[#45483c]'}>
                      Organ Procurement Ethics Review
                    </span>
                  </li>
                </ul>
              </div>

              {selectedDonor.notes && (
                <div className="space-y-sm">
                  <span className="font-label-caps text-label-caps text-[#45483c] text-[10px] font-semibold">Procurement Notes</span>
                  <div className="bg-[#EFF2EE]/70 rounded-xl p-md border border-[#C7D2C0]/40 text-xs text-[#45483c] leading-relaxed">
                    {selectedDonor.notes}
                  </div>
                </div>
              )}

              <div className="pt-md border-t border-[#C7D2C0]/50 mt-auto">
                {selectedDonor.status === 'Verification' ? (
                  <button
                    onClick={openScheduleSurgeryFromMatch}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Schedule Scheduled Transplant
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      showToast(`Running HLA lookup for suitable matching recipe card. Checking active requests queue...`);
                    }}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    Run Match Finder
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DETAIL VIEW: Surgery Schedule */}
          {activeTab === 'surgeries' && selectedSurgery && (
            <div className="bg-[#DDE5D3] border border-[#C7D2C0] rounded-2xl p-lg flex flex-col gap-lg shadow-sm">
              <div className="flex justify-between items-start border-b border-[#C7D2C0]/50 pb-md">
                <div>
                  <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold block mb-xs">Operating Room Schedule</span>
                  <h3 className="font-headline-sm text-headline-sm text-[#3e5219] text-xl font-bold">{selectedSurgery.id}</h3>
                  <p className="text-body-sm text-[#45483c] text-sm mt-0.5">{selectedSurgery.organType} Procedure</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold font-label-caps rounded border ${
                  selectedSurgery.status === 'Completed'
                    ? 'bg-[#3e5219]/10 text-[#3e5219] border-[#3e5219]/20'
                    : selectedSurgery.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-900 border-amber-200 animate-pulse'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {selectedSurgery.status}
                </span>
              </div>

              {/* Surgery details breakdown */}
              <div className="space-y-sm text-sm">
                <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                  <span className="text-[#45483c]">Recipient Patient</span>
                  <span className="font-semibold text-[#121c2a]">{selectedSurgery.patientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                  <span className="text-[#45483c]">Organ Donor</span>
                  <span className="font-semibold text-[#121c2a]">{selectedSurgery.donorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                  <span className="text-[#45483c]">Surgical Team</span>
                  <span className="font-semibold text-[#121c2a] text-right">{selectedSurgery.surgicalTeam}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#C7D2C0]/20">
                  <span className="text-[#45483c]">Location Hospital</span>
                  <span className="font-semibold text-[#121c2a]">{selectedSurgery.hospital}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#45483c]">Scheduled Time</span>
                  <span className="font-bold text-[#3e5219]">{selectedSurgery.scheduledDate} @ {selectedSurgery.scheduledTime}</span>
                </div>
              </div>

              {selectedSurgery.notes && (
                <div className="space-y-sm">
                  <span className="font-label-caps text-label-caps text-[#45483c] text-[10px] font-semibold">Clinical Protocols</span>
                  <div className="bg-[#EFF2EE]/70 rounded-xl p-md border border-[#C7D2C0]/40 text-xs text-[#45483c] leading-relaxed">
                    {selectedSurgery.notes}
                  </div>
                </div>
              )}

              {/* Action toggles */}
              <div className="pt-md border-t border-[#C7D2C0]/50 mt-auto space-y-sm">
                {selectedSurgery.status === 'Scheduled' && (
                  <button
                    onClick={() => {
                      setSurgeries(prev =>
                        prev.map(s => (s.id === selectedSurgery.id ? { ...s, status: 'In Progress' } : s))
                      );
                      showToast(`Surgery procedure ${selectedSurgery.id} started. Operating Rooms active.`);
                    }}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Start Transplant Procedure
                  </button>
                )}

                {selectedSurgery.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      setSurgeries(prev =>
                        prev.map(s => (s.id === selectedSurgery.id ? { ...s, status: 'Completed' } : s))
                      );
                      // Update request state as Completed
                      setRequests(prev =>
                        prev.map(r => {
                          if (r.patientName.toLowerCase() === selectedSurgery.patientName.toLowerCase()) {
                            return { ...r, status: 'Completed' };
                          }
                          return r;
                        })
                      );
                      showToast(`Transplant Surgery ${selectedSurgery.id} marked as COMPLETED. Patient transferred to Post-Op.`);
                    }}
                    className="w-full bg-gradient-to-br from-[#3e5219] to-[#c8f17a] text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Complete Transplant Procedure
                  </button>
                )}

                {selectedSurgery.status === 'Completed' && (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-2.5 rounded-xl font-medium text-sm cursor-not-allowed flex items-center justify-center gap-xs border border-gray-400/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Transplant Fully Completed
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL: Create Organ Request ================= */}
      {isCreateRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#F4F7F0] border border-[#C7D2C0] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#3e5219] text-white p-lg flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-lg font-bold">Create Organ Request</h3>
                <p className="text-xs text-[#d2eca2]/80 mt-1">Register a patient onto the HLA matching waitlist</p>
              </div>
              <button
                onClick={() => setIsCreateRequestOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-lg space-y-md max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-md">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(parseInt(e.target.value) || 30)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Organ Needed</label>
                  <select
                    value={newPatientOrgan}
                    onChange={(e) => setNewPatientOrgan(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="Kidney">Kidney</option>
                    <option value="Heart">Heart</option>
                    <option value="Liver">Liver</option>
                    <option value="Lung">Lung</option>
                    <option value="Pancreas">Pancreas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Blood Group</label>
                  <select
                    value={newPatientBlood}
                    onChange={(e) => setNewPatientBlood(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Urgency Severity</label>
                <div className="grid grid-cols-3 gap-sm">
                  {['Routine', 'High', 'Critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewPatientUrgency(level as any)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        newPatientUrgency === level
                          ? level === 'Critical'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]'
                            : level === 'High'
                            ? 'bg-amber-100 text-amber-900 border-amber-400'
                            : 'bg-[#d2eca2] text-[#394d14] border-[#3e5219]'
                          : 'bg-white border-[#c5c8b8] text-[#45483c] hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Clinical Indication & Notes</label>
                <textarea
                  value={newPatientNotes}
                  onChange={(e) => setNewPatientNotes(e.target.value)}
                  placeholder="Provide diagnostic history, dialysis intervals, or transplant registry references..."
                  rows={3}
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] placeholder-[#75796b]"
                />
              </div>

              <div className="flex gap-md pt-sm border-t border-[#C7D2C0]/50 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateRequestOpen(false)}
                  className="border border-[#c5c8b8] text-[#45483c] px-lg py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3e5219] hover:bg-[#496800] text-white px-lg py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Register Organ Donor ================= */}
      {isRegisterDonorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#F4F7F0] border border-[#C7D2C0] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#3e5219] text-white p-lg flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-lg font-bold">Register Organ Donor</h3>
                <p className="text-xs text-[#d2eca2]/80 mt-1">Add a new altruistic or deceased donor profile</p>
              </div>
              <button
                onClick={() => setIsRegisterDonorOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="p-lg space-y-md max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-md">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Donor Full Name</label>
                  <input
                    type="text"
                    required
                    value={newDonorName}
                    onChange={(e) => setNewDonorName(e.target.value)}
                    placeholder="e.g. Johnathan Miller"
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={newDonorAge}
                    onChange={(e) => setNewDonorAge(parseInt(e.target.value) || 30)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Gender</label>
                  <select
                    value={newDonorGender}
                    onChange={(e) => setNewDonorGender(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Organ to Donate</label>
                  <select
                    value={newDonorOrgan}
                    onChange={(e) => setNewDonorOrgan(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="Kidney">Kidney</option>
                    <option value="Heart">Heart</option>
                    <option value="Liver">Liver</option>
                    <option value="Lung">Lung</option>
                    <option value="Pancreas">Pancreas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Blood Group</label>
                  <select
                    value={newDonorBlood}
                    onChange={(e) => setNewDonorBlood(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Initial Status</label>
                <select
                  value={newDonorStatus}
                  onChange={(e) => setNewDonorStatus(e.target.value as any)}
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                >
                  <option value="Awaiting Match">Awaiting Match</option>
                  <option value="Verification">Verification / Screening</option>
                  <option value="Matched">Matched</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Medical Assessment Notes</label>
                <textarea
                  value={newDonorNotes}
                  onChange={(e) => setNewDonorNotes(e.target.value)}
                  placeholder="Detail HLA profiling indicators, relative matches, consent declarations, or clinical warnings..."
                  rows={3}
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] placeholder-[#75796b]"
                />
              </div>

              <div className="flex gap-md pt-sm border-t border-[#C7D2C0]/50 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRegisterDonorOpen(false)}
                  className="border border-[#c5c8b8] text-[#45483c] px-lg py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3e5219] hover:bg-[#496800] text-white px-lg py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Schedule Surgery ================= */}
      {isScheduleSurgeryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#F4F7F0] border border-[#C7D2C0] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#3e5219] text-white p-lg flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-lg font-bold">Schedule Transplant Surgery</h3>
                <p className="text-xs text-[#d2eca2]/80 mt-1">Coordinate Operating Room & Transplant Teams</p>
              </div>
              <button
                onClick={() => setIsScheduleSurgeryOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleSurgery} className="p-lg space-y-md max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Patient Recipient</label>
                  <input
                    type="text"
                    required
                    value={newSurgPatient}
                    onChange={(e) => setNewSurgPatient(e.target.value)}
                    placeholder="Recipient patient name"
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Organ Donor</label>
                  <input
                    type="text"
                    required
                    value={newSurgDonor}
                    onChange={(e) => setNewSurgDonor(e.target.value)}
                    placeholder="Donor name or Anonymous"
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Organ Type</label>
                  <select
                    value={newSurgOrgan}
                    onChange={(e) => setNewSurgOrgan(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="Kidney">Kidney</option>
                    <option value="Heart">Heart</option>
                    <option value="Liver">Liver</option>
                    <option value="Lung">Lung</option>
                    <option value="Pancreas">Pancreas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Blood Group</label>
                  <select
                    value={newSurgBlood}
                    onChange={(e) => setNewSurgBlood(e.target.value as any)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl py-2 px-sm text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] cursor-pointer"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Destination Hospital</label>
                <input
                  type="text"
                  required
                  value={newSurgHospital}
                  onChange={(e) => setNewSurgHospital(e.target.value)}
                  placeholder="e.g. St. Jude's Medical Center"
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Lead Surgeons & Team</label>
                <input
                  type="text"
                  required
                  value={newSurgTeam}
                  onChange={(e) => setNewSurgTeam(e.target.value)}
                  placeholder="e.g. Dr. A. Vance, Dr. K. Miller"
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Surgery Date</label>
                  <input
                    type="date"
                    required
                    value={newSurgDate}
                    onChange={(e) => setNewSurgDate(e.target.value)}
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Surgery Time</label>
                  <input
                    type="text"
                    required
                    value={newSurgTime}
                    onChange={(e) => setNewSurgTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45483c] uppercase mb-1">Pre-Op Logistics & Notes</label>
                <textarea
                  value={newSurgNotes}
                  onChange={(e) => setNewSurgNotes(e.target.value)}
                  placeholder="Transport route details, cold ischemia limits, warm bypass time bounds..."
                  rows={2}
                  className="w-full bg-white border border-[#c5c8b8] text-sm rounded-xl px-md py-2 text-[#121c2a] focus:border-[#3e5219] focus:ring-[#3e5219] placeholder-[#75796b]"
                />
              </div>

              <div className="flex gap-md pt-sm border-t border-[#C7D2C0]/50 justify-end">
                <button
                  type="button"
                  onClick={() => setIsScheduleSurgeryOpen(false)}
                  className="border border-[#c5c8b8] text-[#45483c] px-lg py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3e5219] hover:bg-[#496800] text-white px-lg py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Schedule Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
