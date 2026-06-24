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
  status: 'Awaiting Match' | 'Verification' | 'Scheduled' | 'Completed' | 'In Progress';
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
  donorName?: string;
  facility?: string;
  time?: string;
  clinicalEvaluation?: {
    scheduledTestDate?: string;
    notes?: string;
  };
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

  // State for interactive matching & sonar search
  const [activeScanRequest, setActiveScanRequest] = useState<OrganRequest | null>(null);
  const [isScanningMatch, setIsScanningMatch] = useState(false);
  const [scanResults, setScanResults] = useState<Array<{
    donor: DonorRecord;
    score: number;
    hlaIPercent: number;
    hlaIIPercent: number;
    hlaI: string;
    hlaII: string;
    bloodCompatibility: 'Identical' | 'Compatible';
  }>>([]);

  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({
    'REQ-7842': 'DON-5011',
    'REQ-7839': 'DON-5012',
    'REQ-7841': 'DON-5013',
    'REQ-7844': 'DON-5015',
    'REQ-7845': 'DON-5016',
    'REQ-7849': 'DON-5020',
    'DON-5011': 'REQ-7842',
    'DON-5012': 'REQ-7839',
    'DON-5013': 'REQ-7841',
    'DON-5015': 'REQ-7844',
    'DON-5016': 'REQ-7845',
    'DON-5020': 'REQ-7849',
  });

  const isBloodCompatible = (donorBlood: string, recipientBlood: string): boolean => {
    if (donorBlood === recipientBlood) return true;
    if (donorBlood === 'O-') return true;
    if (recipientBlood === 'AB+') return true;
    if (donorBlood === 'O+') return ['O+', 'A+', 'B+', 'AB+'].includes(recipientBlood);
    if (donorBlood === 'A-') return ['A-', 'A+', 'AB-', 'AB+'].includes(recipientBlood);
    if (donorBlood === 'A+') return ['A+', 'AB+'].includes(recipientBlood);
    if (donorBlood === 'B-') return ['B-', 'B+', 'AB-', 'AB+'].includes(recipientBlood);
    if (donorBlood === 'B+') return ['B+', 'AB+'].includes(recipientBlood);
    if (donorBlood === 'AB-') return ['AB-', 'AB+'].includes(recipientBlood);
    return false;
  };

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

  // Helper to generate consistent age based on string ID hash
  const getConsistentAge = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 20 + (Math.abs(hash) % 46); // Ages 20 to 65
  };

  // Helper to generate consistent gender based on string ID hash
  const getConsistentGender = (id: string): 'Male' | 'Female' | 'Other' => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rem = Math.abs(hash) % 3;
    if (rem === 0) return 'Male';
    if (rem === 1) return 'Female';
    return 'Other';
  };

  // Helper to generate consistent HLA compatibility based on string ID hash
  const getConsistentHla = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hlaIClass = Math.abs(hash) % 7; // 0 to 6
    const hlaIIClass = Math.abs(hash) % 5; // 0 to 4
    const classIPercent = Math.round((hlaIClass / 6) * 100);
    const classIIPercent = Math.round((hlaIIClass / 4) * 100);
    return {
      classI: `${hlaIClass}/6`,
      classII: `${hlaIIClass}/4`,
      classIPercent,
      classIIPercent
    };
  };

  // Fetch Requests from DB
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/requests?type=Organ');
      // Set to requests
      const reqList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const mapped = reqList.map((r: any) => {
        // Map database status string to frontend matching status type
        const getMappedStatus = (): 'Awaiting Match' | 'Verification' | 'Scheduled' | 'Completed' | 'In Progress' => {
          const dbStatus = String(r.status).toUpperCase();
          if (dbStatus.includes('COMPLETE') || dbStatus.includes('SUCCESS')) return 'Completed';
          if (dbStatus.includes('PROGRESS') || dbStatus.includes('IN_PROGRESS')) return 'In Progress';
          if (dbStatus.includes('SCHEDULE')) return 'Scheduled';
          if (dbStatus.includes('VERIFY') || dbStatus.includes('LEGAL') || dbStatus.includes('TEST') || dbStatus.includes('PENDING')) return 'Verification';
          return 'Awaiting Match';
        };

        const currentStatus = getMappedStatus();

        return {
          id: r.id || r._id,
          patientName: r.patientName,
          age: r.age || getConsistentAge(r.id || r._id),
          gender: r.gender || getConsistentGender(r.id || r._id),
          organType: r.organType,
          bloodGroup: r.bloodGroup,
          urgency: r.urgency,
          status: currentStatus,
          matchPercentage: r.matchPercentage || (currentStatus !== 'Awaiting Match' ? 96 : null),
          registeredDate: r.registeredDate ? r.registeredDate.split('T')[0] : '',
          hlaCompatibility: r.hlaCompatibility || { 
            classI: currentStatus === 'Awaiting Match' ? '0/6' : '6/6', 
            classII: currentStatus === 'Awaiting Match' ? '0/4' : '3/4', 
            classIPercent: currentStatus === 'Awaiting Match' ? 0 : 100, 
            classIIPercent: currentStatus === 'Awaiting Match' ? 0 : 75 
          },
          checklist: r.checklist || { 
            identityVerified: r.checklist?.identityVerified ?? true, 
            medicalClearance: r.checklist?.medicalClearance ?? (currentStatus !== 'Awaiting Match'), 
            legalConsent: r.checklist?.legalConsent ?? (currentStatus !== 'Awaiting Match') 
          },
          notes: r.notes || '',
          donorName: r.donorName || '',
          facility: r.facility || '',
          time: r.time || '',
          clinicalEvaluation: r.clinicalEvaluation ? {
            scheduledTestDate: r.clinicalEvaluation.scheduledTestDate,
            notes: r.clinicalEvaluation.notes
          } : undefined
        };
      });
      setRequests(mapped);
      if (mapped.length > 0) {
        setSelectedRequestId(mapped[0].id);
      }
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to fetch requests from database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Donors from DB
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors');
      const donorList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const mapped = donorList.map((d: any) => {
        const id = d.id || d._id;
        const rawOrgan = d.organsWillingToDonate?.[0] || 'Kidney';
        const organType = ['Kidney', 'Heart', 'Liver', 'Lung', 'Pancreas'].includes(rawOrgan) ? rawOrgan : 'Kidney';
        const dbStatus = String(d.status).toUpperCase();
        
        const getMappedDonorStatus = (): 'Awaiting Match' | 'Matched' | 'Verification' => {
          if (dbStatus.includes('MATCHED')) return 'Matched';
          if (dbStatus.includes('VERIFY') || dbStatus.includes('PENDING')) return 'Verification';
          return 'Awaiting Match';
        };

        return {
          id,
          donorName: d.name,
          age: getConsistentAge(id),
          gender: getConsistentGender(id),
          organType,
          bloodGroup: d.bloodType || 'O+',
          status: getMappedDonorStatus(),
          registeredDate: d.createdAt ? d.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          checklist: {
            identityVerified: true,
            medicalClearance: d.status === 'Verified' || d.status === 'Available',
            legalConsent: d.status === 'Verified' || d.status === 'Available',
          },
          hlaCompatibility: getConsistentHla(id),
          notes: d.details || 'Altruistic organ donor.'
        };
      });
      setDonors(mapped);
      if (mapped.length > 0) {
        setSelectedDonorId(mapped[0].id);
      }
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to fetch donors from database.');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchDonors();
  }, []);

  // Dynamic surgeries list derived from requests and donors
  const surgeries = useMemo<SurgeryRecord[]>(() => {
    return requests
      .filter(r => ['Scheduled', 'Completed', 'In Progress'].includes(r.status))
      .map(r => {
        const id = r.id;
        const matchedDonorId = matchedPairs[r.id];
        const matchedDonor = matchedDonorId ? donors.find(d => d.id === matchedDonorId) : null;
        const donorName = r.donorName || matchedDonor?.donorName || 'Anonymous Donor';
        
        return {
          id,
          patientName: r.patientName,
          donorName,
          organType: r.organType,
          bloodGroup: r.bloodGroup,
          hospital: r.facility || 'Coordinating Medical Center',
          surgicalTeam: r.clinicalEvaluation?.notes || 'Dr. A. Vance, Dr. K. Miller',
          scheduledDate: r.clinicalEvaluation?.scheduledTestDate ? r.clinicalEvaluation.scheduledTestDate.split('T')[0] : r.registeredDate,
          scheduledTime: r.time || '08:00 AM',
          status: r.status === 'Completed' ? 'Completed' : (r.status === 'In Progress' ? 'In Progress' : 'Scheduled'),
          notes: r.notes || 'Scheduled transplant procedure.'
        };
      });
  }, [requests, donors, matchedPairs]);


  // Derive display values from real database records
  const activeRequestsCount = useMemo(() => {
    return requests.filter(r => r.status !== 'Completed').length;
  }, [requests]);

  const awaitingMatchCount = useMemo(() => {
    return requests.filter(r => r.status === 'Awaiting Match').length;
  }, [requests]);

  const underVerificationCount = useMemo(() => {
    return requests.filter(r => r.status === 'Verification').length;
  }, [requests]);

  const scheduledSurgeriesCount = useMemo(() => {
    return surgeries.filter(s => s.status === 'Scheduled').length;
  }, [surgeries]);

  const registeredDonorsCount = useMemo(() => {
    return donors.length;
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

  const linkedDonor = useMemo(() => {
    if (!selectedRequest) return null;
    const donorId = matchedPairs[selectedRequest.id];
    if (!donorId) return null;
    return donors.find(d => d.id === donorId) || null;
  }, [selectedRequest, matchedPairs, donors]);

  const linkedPatient = useMemo(() => {
    if (!selectedDonor) return null;
    const patientId = matchedPairs[selectedDonor.id];
    if (!patientId) return null;
    return requests.find(r => r.id === patientId) || null;
  }, [selectedDonor, matchedPairs, requests]);

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
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    try {
      const res = await api.post('/requests', {
        type: 'Organ',
        urgency: newPatientUrgency,
        status: 'Awaiting Match',
        patientName: newPatientName,
        age: newPatientAge,
        gender: newPatientGender,
        organType: newPatientOrgan,
        bloodGroup: newPatientBlood,
        notes: newPatientNotes || 'No notes added.'
      });

      const reqData = res.data?.data || res.data;
      const newId = reqData?.id || reqData?._id;

      showToast(`Successfully created organ request for ${newPatientName}.`);
      setIsCreateRequestOpen(false);

      // Reset Form
      setNewPatientName('');
      setNewPatientAge(35);
      setNewPatientGender('Male');
      setNewPatientOrgan('Kidney');
      setNewPatientBlood('O+');
      setNewPatientUrgency('Routine');
      setNewPatientNotes('');

      await fetchRequests();
      if (newId) setSelectedRequestId(newId);
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to create request in database.');
    }
  };

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    try {
      const emailLower = `${newDonorName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(Math.random() * 1000)}@lifelink.org`;
      // Create user
      const res = await api.post('/donors', {
        name: newDonorName,
        email: emailLower
      });
      const donorData = res.data?.data || res.data;
      const donorId = donorData?.id || donorData?._id;
      
      if (!donorId) {
        throw new Error('Failed to retrieve donor ID from response');
      }

      // Update donor profile details
      await api.put(`/donors/${donorId}`, {
        bloodType: newDonorBlood,
        organsWillingToDonate: [newDonorOrgan],
        status: newDonorStatus === 'Matched' ? 'Verified' : 'Available',
        details: newDonorNotes || 'No notes added.'
      });

      showToast(`Successfully registered donor ${newDonorName}.`);
      setIsRegisterDonorOpen(false);

      // Reset Form
      setNewDonorName('');
      setNewDonorAge(30);
      setNewDonorGender('Male');
      setNewDonorOrgan('Kidney');
      setNewDonorBlood('O+');
      setNewDonorStatus('Awaiting Match');
      setNewDonorNotes('');

      await fetchDonors();
      setSelectedDonorId(donorId);
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to register donor in database.');
    }
  };

  const handleScheduleSurgery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurgPatient.trim() || !newSurgDonor.trim()) return;

    const matchingReq = requests.find(r => r.patientName.toLowerCase() === newSurgPatient.toLowerCase());
    if (matchingReq) {
      try {
        await api.put(`/requests/${matchingReq.id}`, {
          status: 'Scheduled',
          donorName: newSurgDonor,
          facility: newSurgHospital,
          time: newSurgTime,
          notes: newSurgNotes || 'Scheduled transplant procedure.',
          clinicalEvaluation: {
            ...matchingReq.hlaCompatibility,
            scheduledTestDate: newSurgDate,
            notes: newSurgTeam
          }
        });

        // Also update donor status if matched
        const matchingDonor = donors.find(d => d.donorName.toLowerCase() === newSurgDonor.toLowerCase());
        if (matchingDonor) {
          await api.put(`/donors/${matchingDonor.id}`, {
            status: 'Matched'
          });
        }

        showToast(`Successfully scheduled transplant surgery for ${newSurgPatient}.`);
        setIsScheduleSurgeryOpen(false);

        // Reset Form
        setNewSurgPatient('');
        setNewSurgDonor('');
        setNewSurgNotes('');

        await fetchRequests();
        await fetchDonors();
        setSelectedSurgeryId(matchingReq.id);
      } catch (error) {
        console.error(error);
        showToast('❌ Failed to schedule surgery in database.');
      }
    } else {
      showToast('❌ Matching request not found.');
    }
  };


  // Toggle checklist values locally
  const toggleRequestChecklist = async (field: 'identityVerified' | 'medicalClearance' | 'legalConsent') => {
    const target = requests.find(r => r.id === selectedRequestId);
    if (!target) return;
    const updatedChecklist = { ...target.checklist, [field]: !target.checklist[field] };
    try {
      await api.put(`/requests/${selectedRequestId}`, {
        checklist: updatedChecklist
      });
      await fetchRequests();
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to update checklist in database.');
    }
  };

  const toggleDonorChecklist = async (field: 'identityVerified' | 'medicalClearance' | 'legalConsent') => {
    const target = donors.find(d => d.id === selectedDonorId);
    if (!target) return;
    const updatedChecklist = { ...target.checklist, [field]: !target.checklist[field] };
    setDonors(prev =>
      prev.map(d => {
        if (d.id === selectedDonorId) {
          return { ...d, checklist: updatedChecklist };
        }
        return d;
      })
    );
  };

  const handleRunMatchingSearch = (req: OrganRequest) => {
    setActiveScanRequest(req);
    setIsScanningMatch(true);
    
    // Simulate sonar radar scanning
    setTimeout(() => {
      // Find candidate donors with compatible blood type and same organ type
      const candidates = donors.filter(
        d => d.organType === req.organType && 
             d.status === 'Awaiting Match' && 
             isBloodCompatible(d.bloodGroup, req.bloodGroup)
      );

      // Map candidates with realistic scores
      const mappedResults = candidates.map(d => {
        // ABO compatibility score
        const isIdentical = d.bloodGroup === req.bloodGroup;
        const bloodScore = isIdentical ? 30 : 15;
        
        // HLA compatibility score
        const hlaIPercent = d.hlaCompatibility.classIPercent;
        const hlaIIPercent = d.hlaCompatibility.classIIPercent;
        
        const totalScore = Math.min(100, Math.round(bloodScore + (hlaIPercent * 0.4) + (hlaIIPercent * 0.3)));
        
        return {
          donor: d,
          score: totalScore,
          hlaIPercent,
          hlaIIPercent,
          hlaI: d.hlaCompatibility.classI,
          hlaII: d.hlaCompatibility.classII,
          bloodCompatibility: (isIdentical ? 'Identical' : 'Compatible') as 'Identical' | 'Compatible'
        };
      });

      // Sort by score descending
      mappedResults.sort((a, b) => b.score - a.score);
      setScanResults(mappedResults);
      setIsScanningMatch(false);
    }, 1500);
  };

  const confirmMatchAllocation = async (
    req: OrganRequest, 
    donor: DonorRecord, 
    matchScore: number,
    classI: string,
    classII: string,
    classIPercent: number,
    classIIPercent: number
  ) => {
    try {
      // 1. Update request status, match percentage, and hla compatibility
      await api.put(`/requests/${req.id}`, {
        status: 'Verification',
        matchPercentage: matchScore,
        hlaCompatibility: {
          classI,
          classII,
          classIPercent,
          classIIPercent
        },
        donorName: donor.donorName,
        assignedDonorId: donor.id
      });

      // 2. Update donor status
      await api.put(`/donors/${donor.id}`, {
        status: 'Verification'
      });

      // 3. Update matchedPairs dictionary
      setMatchedPairs(prev => ({
        ...prev,
        [req.id]: donor.id,
        [donor.id]: req.id
      }));

      // 4. Show success toast & close modal
      showToast(`Successfully allocated donor ${donor.donorName} to patient ${req.patientName}!`);
      setActiveScanRequest(null);
      await fetchRequests();
      await fetchDonors();
    } catch (error) {
      console.error(error);
      showToast('❌ Failed to allocate match in database.');
    }
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

              {/* Linked Donor Profile */}
              {linkedDonor && (
                <div className="space-y-sm">
                  <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold block">Linked Donor Dossier</span>
                  <div 
                    onClick={() => {
                      setActiveTab('donors');
                      setSelectedDonorId(linkedDonor.id);
                    }}
                    className="bg-white hover:bg-white/70 border border-[#C7D2C0] rounded-xl p-md flex items-center justify-between gap-md cursor-pointer transition-all hover:scale-[1.01] shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-xs">
                        <span className="font-bold text-sm text-[#3e5219]">{linkedDonor.donorName}</span>
                        <span className="text-[10px] text-gray-500">({linkedDonor.id})</span>
                      </div>
                      <p className="text-[11px] text-[#45483c] mt-0.5">
                        {linkedDonor.age} Yrs • {linkedDonor.gender} • Blood: <span className="font-bold">{linkedDonor.bloodGroup}</span>
                      </p>
                      <span className="inline-block bg-[#496800]/10 text-[#496800] text-[9px] px-1.5 py-0.5 rounded border border-[#496800]/20 font-bold uppercase mt-1">
                        {linkedDonor.organType} Donor
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#3e5219] text-[20px] shrink-0">arrow_forward</span>
                  </div>
                </div>
              )}

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
                        handleRunMatchingSearch(selectedRequest);
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

              {/* Linked Patient Profile */}
              {linkedPatient && (
                <div className="space-y-sm">
                  <span className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold block">Linked Patient Dossier</span>
                  <div 
                    onClick={() => {
                      setActiveTab('requests');
                      setSelectedRequestId(linkedPatient.id);
                    }}
                    className="bg-white hover:bg-white/70 border border-[#C7D2C0] rounded-xl p-md flex items-center justify-between gap-md cursor-pointer transition-all hover:scale-[1.01] shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-xs">
                        <span className="font-bold text-sm text-[#3e5219]">{linkedPatient.patientName}</span>
                        <span className="text-[10px] text-gray-500">({linkedPatient.id})</span>
                      </div>
                      <p className="text-[11px] text-[#45483c] mt-0.5">
                        {linkedPatient.age} Yrs • {linkedPatient.gender} • Urgency: <span className={`font-bold ${
                          linkedPatient.urgency === 'Critical' ? 'text-[#ba1a1a]' : 'text-[#3e5219]'
                        }`}>{linkedPatient.urgency}</span>
                      </p>
                      <span className="inline-block bg-[#3e5219]/10 text-[#3e5219] text-[9px] px-1.5 py-0.5 rounded border border-[#3e5219]/20 font-bold uppercase mt-1">
                        {linkedPatient.organType} Recipient
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#3e5219] text-[20px] shrink-0">arrow_forward</span>
                  </div>
                </div>
              )}

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

              {/* Preservation & Logistics Telemetry */}
              <div className="space-y-md">
                <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Preservation & Logistics Telemetry</h4>
                <div className="bg-white/40 border border-[#C7D2C0]/60 rounded-xl p-md space-y-md text-xs">
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="bg-[#EFF2EE] p-sm rounded-lg flex flex-col gap-xs border border-[#C7D2C0]/30">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Cold Ischemia Limit</span>
                      <span className="font-bold text-sm text-[#3e5219]">
                        {selectedSurgery.organType === 'Heart' ? '4 Hours' :
                         selectedSurgery.organType === 'Lung' ? '8 Hours' :
                         selectedSurgery.organType === 'Kidney' ? '24 Hours' : '12 Hours'}
                      </span>
                    </div>
                    <div className="bg-[#EFF2EE] p-sm rounded-lg flex flex-col gap-xs border border-[#C7D2C0]/30">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Preservation Temp</span>
                      <span className={`font-bold text-sm ${selectedSurgery.status === 'Completed' ? 'text-gray-500' : 'text-[#496800]'}`}>
                        {selectedSurgery.status === 'Completed' ? 'N/A (Explanted)' : '3.8°C (Optimal)'}
                      </span>
                    </div>
                  </div>

                  {/* Stepper tracker */}
                  <div className="space-y-sm">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Transit Progression</span>
                    <div className="flex items-center justify-between relative mt-2 px-1">
                      {/* Horizontal progress bar background */}
                      <div className="absolute top-[9px] left-2 right-2 h-0.5 bg-gray-200 -z-10"></div>
                      <div 
                        className="absolute top-[9px] left-2 h-0.5 bg-[#3e5219] -z-10 transition-all duration-500"
                        style={{
                          width: selectedSurgery.status === 'Completed' ? '100%' :
                                 selectedSurgery.status === 'In Progress' ? '50%' : '0%'
                        }}
                      ></div>

                      {/* Procurement Step */}
                      <div className="flex flex-col items-center gap-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                          selectedSurgery.status !== 'Scheduled' 
                            ? 'bg-[#3e5219] text-white border-[#3e5219]' 
                            : 'bg-white text-gray-400 border-gray-300'
                        }`}>
                          {selectedSurgery.status !== 'Scheduled' ? '✓' : '1'}
                        </div>
                        <span className="text-[9px] font-semibold text-gray-500">Procured</span>
                      </div>

                      {/* Transit Step */}
                      <div className="flex flex-col items-center gap-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                          selectedSurgery.status !== 'Scheduled' 
                            ? selectedSurgery.status === 'Completed' 
                              ? 'bg-[#3e5219] text-white border-[#3e5219]' 
                              : 'bg-amber-500 text-white border-amber-600 animate-pulse'
                            : 'bg-white text-gray-400 border-gray-300'
                        }`}>
                          {selectedSurgery.status === 'Completed' ? '✓' : '2'}
                        </div>
                        <span className="text-[9px] font-semibold text-gray-500">In Transit</span>
                      </div>

                      {/* Implant Step */}
                      <div className="flex flex-col items-center gap-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                          selectedSurgery.status === 'Completed' 
                            ? 'bg-[#3e5219] text-white border-[#3e5219]' 
                            : 'bg-white text-gray-400 border-gray-300'
                        }`}>
                          {selectedSurgery.status === 'Completed' ? '✓' : '3'}
                        </div>
                        <span className="text-[9px] font-semibold text-gray-500">Implanted</span>
                      </div>
                    </div>
                  </div>
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
                    onClick={async () => {
                      try {
                        await api.put(`/requests/${selectedSurgery.id}`, {
                          status: 'In Progress'
                        });
                        showToast(`Surgery procedure ${selectedSurgery.id} started. Operating Rooms active.`);
                        await fetchRequests();
                      } catch (err) {
                        console.error(err);
                        showToast('❌ Failed to start surgery in database.');
                      }
                    }}
                    className="w-full bg-[#3e5219] hover:bg-[#496800] text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Start Transplant Procedure
                  </button>
                )}

                {selectedSurgery.status === 'In Progress' && (
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/requests/${selectedSurgery.id}`, {
                          status: 'Completed'
                        });
                        showToast(`Transplant Surgery ${selectedSurgery.id} marked as COMPLETED. Patient transferred to Post-Op.`);
                        await fetchRequests();
                      } catch (err) {
                        console.error(err);
                        showToast('❌ Failed to complete surgery in database.');
                      }
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

      {/* ================= MODAL: Match Finder Scanner ================= */}
      {activeScanRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <style>{`
            @keyframes sonar {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(2); opacity: 0; }
            }
            .animate-sonar-1 {
              animation: sonar 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
            }
            .animate-sonar-2 {
              animation: sonar 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
              animation-delay: 0.6s;
            }
            .animate-sonar-3 {
              animation: sonar 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
              animation-delay: 1.2s;
            }
          `}</style>

          <div className="bg-[#F4F7F0] border border-[#C7D2C0] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#3e5219] text-white p-lg flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-lg font-bold">LIFELINK Match Finder</h3>
                <p className="text-xs text-[#d2eca2]/80 mt-1">Cross-matching HLA & ABO profiles in real-time</p>
              </div>
              {!isScanningMatch && (
                <button
                  onClick={() => setActiveScanRequest(null)}
                  className="text-white/80 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              )}
            </div>

            {isScanningMatch ? (
              /* SCANNING TELEMETRY VIEW */
              <div className="p-xl flex flex-col items-center justify-center min-h-[350px] gap-xl text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Radar waves */}
                  <div className="absolute inset-0 rounded-full bg-[#3e5219]/10 border border-[#3e5219]/30 animate-sonar-1"></div>
                  <div className="absolute inset-0 rounded-full bg-[#3e5219]/10 border border-[#3e5219]/30 animate-sonar-2"></div>
                  <div className="absolute inset-0 rounded-full bg-[#3e5219]/10 border border-[#3e5219]/30 animate-sonar-3"></div>
                  
                  {/* Central icon */}
                  <div className="w-16 h-16 rounded-full bg-[#3e5219] text-white flex items-center justify-center shadow-lg z-10">
                    <span className="material-symbols-outlined text-[32px] animate-pulse">radar</span>
                  </div>
                </div>
                
                <div className="space-y-sm">
                  <h4 className="font-bold text-[#3e5219] text-lg">Scanning LIFELINK National Registry...</h4>
                  <p className="text-sm text-[#45483c] max-w-md">
                    Comparing HLA antigens loci mapping and verifying ABO compatibility rules for <span className="font-bold">{activeScanRequest.patientName}</span>.
                  </p>
                </div>

                <div className="text-xs text-[#45483c] bg-[#EFF2EE] border border-[#C7D2C0]/50 rounded-xl px-lg py-md w-full max-w-sm space-y-1 text-left font-mono">
                  <div className="flex items-center gap-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3e5219] animate-ping"></span>
                    <span>Querying donor HLA registry card cache...</span>
                  </div>
                  <div className="text-gray-400">ABO Blood Rule check: COMPATIBLE ONLY</div>
                  <div className="text-gray-400">Target Organ: {activeScanRequest.organType}</div>
                </div>
              </div>
            ) : (
              /* MATCH SCAN RESULTS VIEW */
              <div className="p-lg space-y-md">
                {/* Recipient card summary */}
                <div className="bg-[#EFF2EE] border border-[#C7D2C0] rounded-xl p-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Recipient Patient</span>
                    <span className="font-bold text-sm text-[#3e5219]">{activeScanRequest.patientName} ({activeScanRequest.id})</span>
                    <span className="text-xs text-[#45483c] ml-sm">Age: {activeScanRequest.age} • Blood Group: <span className="font-semibold">{activeScanRequest.bloodGroup}</span></span>
                  </div>
                  <span className="bg-[#3e5219]/10 text-[#3e5219] text-xs px-2.5 py-1 font-bold rounded border border-[#3e5219]/20 uppercase">
                    {activeScanRequest.organType} Waitlist
                  </span>
                </div>

                <h4 className="font-label-caps text-label-caps text-[#45483c] text-xs font-semibold">Compatible Registry Donors Found ({scanResults.length})</h4>

                {scanResults.length === 0 ? (
                  <div className="text-center py-xl border border-dashed border-[#C7D2C0] rounded-xl text-gray-500 text-sm">
                    No compatible {activeScanRequest.organType} donors found with compatible blood group ({activeScanRequest.bloodGroup}) at this time.
                  </div>
                ) : (
                  <div className="border border-[#C7D2C0] rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-[#C7D2C0] font-medium text-gray-500">
                          <th className="p-sm">Donor Name</th>
                          <th className="p-sm">Blood</th>
                          <th className="p-sm">HLA Match Markers</th>
                          <th className="p-sm text-center">Match Score</th>
                          <th className="p-sm text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {scanResults.map(({ donor, score, hlaI, hlaII, hlaIPercent, hlaIIPercent, bloodCompatibility }) => (
                          <tr key={donor.id} className="hover:bg-gray-50/50">
                            <td className="p-sm">
                              <div className="font-semibold text-gray-900">{donor.donorName}</div>
                              <div className="text-[10px] text-gray-400">{donor.id} • {donor.age} Yrs • {donor.gender}</div>
                            </td>
                            <td className="p-sm">
                              <span className="font-semibold">{donor.bloodGroup}</span>
                              <span className="text-[9px] block text-gray-400 capitalize">{bloodCompatibility}</span>
                            </td>
                            <td className="p-sm">
                              <div>Class I: <span className="font-semibold text-[#3e5219]">{hlaI} ({hlaIPercent}%)</span></div>
                              <div>Class II: <span className="font-semibold text-[#3e5219]">{hlaII} ({hlaIIPercent}%)</span></div>
                            </td>
                            <td className="p-sm text-center">
                              <span className="font-bold text-sm text-[#3e5219] bg-[#c8f17a]/30 px-2 py-0.5 rounded-full">
                                {score}%
                              </span>
                            </td>
                            <td className="p-sm text-right">
                              <button
                                type="button"
                                onClick={() => confirmMatchAllocation(activeScanRequest, donor, score, hlaI, hlaII, hlaIPercent, hlaIIPercent)}
                                className="bg-[#3e5219] hover:bg-[#496800] text-white px-md py-1.5 rounded-lg font-medium transition-all text-[11px]"
                              >
                                Allocate Match
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end pt-sm border-t border-[#C7D2C0]/50">
                  <button
                    type="button"
                    onClick={() => setActiveScanRequest(null)}
                    className="border border-[#c5c8b8] text-[#45483c] px-lg py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Close Match Finder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
