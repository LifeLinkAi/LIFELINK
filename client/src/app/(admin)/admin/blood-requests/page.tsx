'use client';

import React, { useState, useMemo } from 'react';

// Interfaces for Blood Management data structures
interface BloodRequest {
  id: string;
  facility: string;
  bloodGroup: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
  units: number;
  urgency: 'Critical' | 'Urgent' | 'Routine';
  status: 'Pending Match' | 'Matching' | 'Allocated' | 'Dispatched' | 'Delivered' | 'Declined';
  time: string;
  distance: string;
  facilityType: string;
  notes?: string;
  timeline: {
    status: string;
    time: string;
    description: string;
    done: boolean;
  }[];
}

interface StockItem {
  bloodGroup: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
  units: number;
  minRequired: number;
  status: 'Healthy' | 'Low' | 'Critical Low';
  compatibles: string[];
}

interface DonationRecord {
  id: string;
  donorName: string;
  bloodGroup: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
  units: number;
  location: string;
  status: 'Screening' | 'Processing' | 'Tested & Approved' | 'Stored' | 'Dispatched';
  date: string;
  temperature: string;
  hemoglobin: string;
}

export default function BloodManagementPage() {
  // Navigation tabs state: 'requests' | 'stock' | 'donations'
  const [activeTab, setActiveTab] = useState<'requests' | 'stock' | 'donations'>('requests');

  // Interactive filters
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected item detail slide-out state
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState(false);

  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
  const [isDonationDrawerOpen, setIsDonationDrawerOpen] = useState(false);

  // Overlay forms modals
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isRecordDonationOpen, setIsRecordDonationOpen] = useState(false);

  // Form input states
  const [newRequestFacility, setNewRequestFacility] = useState('');
  const [newRequestGroup, setNewRequestGroup] = useState<'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'>('O-');
  const [newRequestUnits, setNewRequestUnits] = useState(2);
  const [newRequestUrgency, setNewRequestUrgency] = useState<'Critical' | 'Urgent' | 'Routine'>('Routine');
  const [newRequestFacilityType, setNewRequestFacilityType] = useState('Hospital');
  const [newRequestNotes, setNewRequestNotes] = useState('');

  const [newDonationName, setNewDonationName] = useState('');
  const [newDonationGroup, setNewDonationGroup] = useState<'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'>('O+');
  const [newDonationUnits, setNewDonationUnits] = useState(1);
  const [newDonationLocation, setNewDonationLocation] = useState('');
  const [newDonationTemp, setNewDonationTemp] = useState('98.6');
  const [newDonationHgb, setNewDonationHgb] = useState('13.5');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock Blood Requests Dataset (Enhanced to 10 records)
  const [requests, setRequests] = useState<BloodRequest[]>([
    {
      id: 'REQ-8901',
      facility: 'Metro General Hospital',
      bloodGroup: 'O-',
      units: 4,
      urgency: 'Critical',
      status: 'Matching',
      time: '10:42 AM',
      distance: '4.2 miles',
      facilityType: 'Level 1 Trauma Center',
      notes: 'Post-trauma abdominal hemorrhage emergency. Immediate cross-match and allocation required.',
      timeline: [
        { status: 'Request Received', time: '10:42 AM', description: 'Emergency dispatch request logged', done: true },
        { status: 'Inventory Matching', time: '10:45 AM', description: 'Scanning central hub and reserve coolers', done: true },
        { status: 'Allocation Approved', time: '--', description: 'Pending unit allocation dispatch approval', done: false },
        { status: 'Courier Dispatched', time: '--', description: 'Awaiting transport delivery pickup', done: false },
        { status: 'Delivered', time: '--', description: 'Awaiting hospital staff handoff sign-off', done: false }
      ]
    },
    {
      id: 'REQ-8902',
      facility: "St. Jude's Medical Center",
      bloodGroup: 'A+',
      units: 2,
      urgency: 'Routine',
      status: 'Pending Match',
      time: '09:15 AM',
      distance: '6.8 miles',
      facilityType: 'Specialty Pediatric Care',
      notes: 'Scheduled surgery support blood bank preparation.',
      timeline: [
        { status: 'Request Received', time: '09:15 AM', description: 'Routine surgical reservation logged', done: true },
        { status: 'Inventory Matching', time: '09:30 AM', description: 'Reserve scanning completed. In stock.', done: true },
        { status: 'Allocation Approved', time: '--', description: 'Awaiting scheduled delivery release', done: false }
      ]
    },
    {
      id: 'REQ-8903',
      facility: 'City Oncology Clinic',
      bloodGroup: 'AB-',
      units: 3,
      urgency: 'Urgent',
      status: 'Allocated',
      time: '08:30 AM',
      distance: '2.1 miles',
      facilityType: 'Specialty Cancer Hospital',
      notes: 'Directed patient support transfusion protocol.',
      timeline: [
        { status: 'Request Received', time: '08:30 AM', description: 'Clinically indicated request logged', done: true },
        { status: 'Inventory Matching', time: '08:35 AM', description: 'Targeted rare donor inventory matching completed', done: true },
        { status: 'Allocation Approved', time: '08:45 AM', description: '3 units reserved in Cooler #C4', done: true },
        { status: 'Courier Dispatched', time: '--', description: 'Pending courier team assignment', done: false }
      ]
    },
    {
      id: 'REQ-8904',
      facility: 'Eastside Trauma Center',
      bloodGroup: 'O+',
      units: 8,
      urgency: 'Critical',
      status: 'Dispatched',
      time: '11:10 AM',
      distance: '8.4 miles',
      facilityType: 'Trauma & Emergency Hub',
      notes: 'Emergency mass transfusion protocol active for multi-vehicle accident trauma.',
      timeline: [
        { status: 'Request Received', time: '11:10 AM', description: 'MTP alert broadcast received', done: true },
        { status: 'Inventory Matching', time: '11:12 AM', description: 'Reserve emergency block assigned', done: true },
        { status: 'Allocation Approved', time: '11:15 AM', description: '8 O+ units packed in quick-chill containers', done: true },
        { status: 'Courier Dispatched', time: '11:20 AM', description: 'Medic Unit AMB-7482 in transit', done: true },
        { status: 'Delivered', time: '--', description: 'Estimated arrival in 8 mins', done: false }
      ]
    },
    {
      id: 'REQ-8905',
      facility: 'Central Medicare Center',
      bloodGroup: 'B-',
      units: 1,
      urgency: 'Routine',
      status: 'Delivered',
      time: 'Yesterday',
      distance: '3.9 miles',
      facilityType: 'General Healthcare Hospital',
      notes: 'Non-emergency diagnostic blood exchange backup.',
      timeline: [
        { status: 'Request Received', time: 'Yesterday 3:10 PM', description: 'Request registered', done: true },
        { status: 'Inventory Matching', time: 'Yesterday 3:15 PM', description: 'Matched B- reserve unit', done: true },
        { status: 'Allocation Approved', time: 'Yesterday 3:30 PM', description: 'Approved and boxed', done: true },
        { status: 'Courier Dispatched', time: 'Yesterday 4:00 PM', description: 'Dispatched courier log #742', done: true },
        { status: 'Delivered', time: 'Yesterday 4:32 PM', description: 'Handed off to Lab tech J. Miller', done: true }
      ]
    },
    {
      id: 'REQ-8906',
      facility: 'Mercy Surgical Center',
      bloodGroup: 'O-',
      units: 5,
      urgency: 'Critical',
      status: 'Matching',
      time: '11:35 AM',
      distance: '5.1 miles',
      facilityType: 'Ambulatory Surgery Unit',
      notes: 'Cardiac bypass complication requires O- negative emergency backfill.',
      timeline: [
        { status: 'Request Received', time: '11:35 AM', description: 'STAT bypass reserve call', done: true },
        { status: 'Inventory Matching', time: '11:38 AM', description: 'Scanning reserve buffers. Low local stocks.', done: true }
      ]
    },
    {
      id: 'REQ-8907',
      facility: 'Childrens Memorial Hospital',
      bloodGroup: 'A-',
      units: 2,
      urgency: 'Urgent',
      status: 'Allocated',
      time: '10:05 AM',
      distance: '7.2 miles',
      facilityType: 'Pediatric Medical Center',
      notes: 'Neonatal transfusion preparation. Special filtration and irradiation required.',
      timeline: [
        { status: 'Request Received', time: '10:05 AM', description: 'Pediatric urgent unit request', done: true },
        { status: 'Inventory Matching', time: '10:10 AM', description: 'Irradiated A- units secured', done: true },
        { status: 'Allocation Approved', time: '10:25 AM', description: 'Allocated 2 units from specialized cache', done: true }
      ]
    },
    {
      id: 'REQ-8908',
      facility: 'Westside Veteran Hospital',
      bloodGroup: 'B+',
      units: 4,
      urgency: 'Routine',
      status: 'Pending Match',
      time: '07:45 AM',
      distance: '9.0 miles',
      facilityType: 'Veterans Administration Hospital',
      notes: 'Orthopedic clinic reservation request for upcoming procedures.',
      timeline: [
        { status: 'Request Received', time: '07:45 AM', description: 'Routine VA request logged', done: true }
      ]
    },
    {
      id: 'REQ-8909',
      facility: 'Northside Clinic',
      bloodGroup: 'AB+',
      units: 2,
      urgency: 'Routine',
      status: 'Delivered',
      time: 'Yesterday',
      distance: '1.2 miles',
      facilityType: 'Community Health Clinic',
      notes: 'Anemia outpatient therapy stock replenishment.',
      timeline: [
        { status: 'Request Received', time: 'Yesterday 1:00 PM', description: 'Request registered', done: true },
        { status: 'Inventory Matching', time: 'Yesterday 1:10 PM', description: 'Matched AB+ units', done: true },
        { status: 'Allocation Approved', time: 'Yesterday 1:20 PM', description: 'Approved and dispatched', done: true },
        { status: 'Courier Dispatched', time: 'Yesterday 1:40 PM', description: 'Delivered in transit', done: true },
        { status: 'Delivered', time: 'Yesterday 2:10 PM', description: 'Completed and signed', done: true }
      ]
    },
    {
      id: 'REQ-8910',
      facility: 'University Medical Center',
      bloodGroup: 'O-',
      units: 3,
      urgency: 'Critical',
      status: 'Declined',
      time: 'Yesterday',
      distance: '10.5 miles',
      facilityType: 'Academic Medical Hospital',
      notes: 'Stock allocation requested but inventory limits exceeded at request time.',
      timeline: [
        { status: 'Request Received', time: 'Yesterday 10:00 AM', description: 'O- volume request received', done: true },
        { status: 'Inventory Matching', time: 'Yesterday 10:15 AM', description: 'Out-of-stock check completed', done: true },
        { status: 'Request Declined', time: 'Yesterday 10:20 AM', description: 'Declined due to local inventory critical depletion. Redirected to Eastside Hub.', done: true }
      ]
    }
  ]);

  // Mock Stock Inventory Dataset (Enhanced to all 8 blood groups)
  const [stock, setStock] = useState<StockItem[]>([
    { bloodGroup: 'A+', units: 342, minRequired: 200, status: 'Healthy', compatibles: ['A+', 'A-', 'O+', 'O-'] },
    { bloodGroup: 'O-', units: 12, minRequired: 80, status: 'Critical Low', compatibles: ['O-'] },
    { bloodGroup: 'O+', units: 485, minRequired: 300, status: 'Healthy', compatibles: ['O+', 'O-'] },
    { bloodGroup: 'A-', units: 92, minRequired: 100, status: 'Low', compatibles: ['A-', 'O-'] },
    { bloodGroup: 'B+', units: 180, minRequired: 120, status: 'Healthy', compatibles: ['B+', 'B-', 'O+', 'O-'] },
    { bloodGroup: 'B-', units: 34, minRequired: 50, status: 'Low', compatibles: ['B-', 'O-'] },
    { bloodGroup: 'AB+', units: 102, minRequired: 60, status: 'Healthy', compatibles: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    { bloodGroup: 'AB-', units: 8, minRequired: 30, status: 'Critical Low', compatibles: ['AB-', 'A-', 'B-', 'O-'] }
  ]);

  // Mock Donations Log Dataset (Enhanced to 10 records)
  const [donations, setDonations] = useState<DonationRecord[]>([
    { id: 'DON-2031', donorName: 'John Doe', bloodGroup: 'O+', units: 1, location: 'Red Cross Center', status: 'Tested & Approved', date: 'Today, 08:30 AM', temperature: '98.4', hemoglobin: '14.2' },
    { id: 'DON-2032', donorName: 'Sarah Smith', bloodGroup: 'A-', units: 1, location: 'Eastside Mobile Drive', status: 'Processing', date: 'Today, 09:15 AM', temperature: '98.6', hemoglobin: '12.8' },
    { id: 'DON-2033', donorName: 'Robert Johnson', bloodGroup: 'O-', units: 2, location: 'Central Hub', status: 'Stored', date: 'Today, 07:10 AM', temperature: '98.1', hemoglobin: '15.1' },
    { id: 'DON-2034', donorName: 'Emily Davis', bloodGroup: 'B+', units: 1, location: 'Community College Clinic', status: 'Screening', date: 'Today, 11:00 AM', temperature: '99.0', hemoglobin: '13.2' },
    { id: 'DON-2035', donorName: 'Michael Brown', bloodGroup: 'AB+', units: 1, location: 'Red Cross Center', status: 'Stored', date: 'Yesterday', temperature: '98.5', hemoglobin: '14.8' },
    { id: 'DON-2036', donorName: 'Jessica Wilson', bloodGroup: 'A+', units: 1, location: 'Metro Hospital Clinic', status: 'Tested & Approved', date: 'Yesterday', temperature: '98.2', hemoglobin: '13.0' },
    { id: 'DON-2037', donorName: 'James Taylor', bloodGroup: 'B-', units: 2, location: 'Eastside Mobile Drive', status: 'Dispatched', date: 'May 20, 2026', temperature: '98.7', hemoglobin: '14.0' },
    { id: 'DON-2038', donorName: 'David Martinez', bloodGroup: 'O+', units: 1, location: 'Central Hub', status: 'Stored', date: 'May 19, 2026', temperature: '98.3', hemoglobin: '16.0' },
    { id: 'DON-2039', donorName: 'Lisa Anderson', bloodGroup: 'AB-', units: 1, location: 'City Oncology Clinic', status: 'Tested & Approved', date: 'May 18, 2026', temperature: '98.0', hemoglobin: '12.5' },
    { id: 'DON-2040', donorName: 'William Jackson', bloodGroup: 'A-', units: 1, location: 'Red Cross Center', status: 'Stored', date: 'May 17, 2026', temperature: '98.6', hemoglobin: '13.9' }
  ]);

  // Derived dashboard metrics
  const activeRequestsCount = useMemo(() => requests.filter(r => r.status !== 'Delivered' && r.status !== 'Declined').length, [requests]);
  const criticalRequestsCount = useMemo(() => requests.filter(r => r.urgency === 'Critical' && r.status !== 'Delivered' && r.status !== 'Declined').length, [requests]);
  const totalStockUnits = useMemo(() => stock.reduce((sum, item) => sum + item.units, 0), [stock]);
  const lowStockAlertsCount = useMemo(() => stock.filter(item => item.status === 'Critical Low' || item.status === 'Low').length, [stock]);
  const lowStockGroupsText = useMemo(() => stock.filter(item => item.status === 'Critical Low').map(item => item.bloodGroup).join(' , '), [stock]);
  const donationsTodayCount = useMemo(() => donations.filter(d => d.date.includes('Today')).reduce((sum, item) => sum + item.units, 0), [donations]);

  // Filtering for Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency = urgencyFilter === 'All' || req.urgency === urgencyFilter;
      const matchesBloodGroup = bloodGroupFilter === 'All' || req.bloodGroup === bloodGroupFilter;
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesUrgency && matchesBloodGroup && matchesStatus;
    });
  }, [requests, searchQuery, urgencyFilter, bloodGroupFilter, statusFilter]);

  // Filtering for Stock
  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchesSearch = item.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stock, searchQuery, statusFilter]);

  // Filtering for Donations
  const filteredDonations = useMemo(() => {
    return donations.filter(donation => {
      const matchesSearch =
        donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBloodGroup = bloodGroupFilter === 'All' || donation.bloodGroup === bloodGroupFilter;
      const matchesStatus = statusFilter === 'All' || donation.status === statusFilter;
      return matchesSearch && matchesBloodGroup && matchesStatus;
    });
  }, [donations, searchQuery, bloodGroupFilter, statusFilter]);

  // Handler for adding a new blood request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestFacility.trim()) return;

    const newReqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: BloodRequest = {
      id: newReqId,
      facility: newRequestFacility,
      bloodGroup: newRequestGroup,
      units: newRequestUnits,
      urgency: newRequestUrgency,
      status: 'Pending Match',
      time: 'Just Now',
      distance: 'Estimate Pending',
      facilityType: newRequestFacilityType,
      notes: newRequestNotes || 'No notes provided by dispatch.',
      timeline: [
        { status: 'Request Received', time: 'Just Now', description: 'Emergency dispatch request logged', done: true },
        { status: 'Inventory Matching', time: '--', description: 'Awaiting inventory verification', done: false }
      ]
    };

    setRequests([newReq, ...requests]);
    setIsAddRequestOpen(false);
    // Reset form
    setNewRequestFacility('');
    setNewRequestGroup('O-');
    setNewRequestUnits(2);
    setNewRequestUrgency('Routine');
    setNewRequestFacilityType('Hospital');
    setNewRequestNotes('');

    showToast(`New blood request ${newReqId} registered successfully!`);
  };

  // Handler for adding a new donation
  const handleRecordDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonationName.trim()) return;

    const newDonId = `DON-${Math.floor(2000 + Math.random() * 1000)}`;
    const newDon: DonationRecord = {
      id: newDonId,
      donorName: newDonationName,
      bloodGroup: newDonationGroup,
      units: newDonationUnits,
      location: newDonationLocation || 'Main Hub',
      status: 'Screening',
      date: 'Today, Just Now',
      temperature: newDonationTemp,
      hemoglobin: newDonationHgb
    };

    setDonations([newDon, ...donations]);
    
    // Add to stock units immediately
    setStock(prevStock => 
      prevStock.map(item => {
        if (item.bloodGroup === newDonationGroup) {
          const updatedUnits = item.units + newDonationUnits;
          let updatedStatus = item.status;
          if (updatedUnits >= item.minRequired) updatedStatus = 'Healthy';
          else if (updatedUnits > item.minRequired / 2) updatedStatus = 'Low';
          return { ...item, units: updatedUnits, status: updatedStatus };
        }
        return item;
      })
    );

    setIsRecordDonationOpen(false);
    // Reset form
    setNewDonationName('');
    setNewDonationGroup('O+');
    setNewDonationUnits(1);
    setNewDonationLocation('');
    setNewDonationTemp('98.6');
    setNewDonationHgb('13.5');

    showToast(`Donation ${newDonId} logged. ${newDonationUnits} units added to ${newDonationGroup} stock.`);
  };

  // Handler for allocating units
  const handleAllocateUnits = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Check stock availability
    const stockItem = stock.find(s => s.bloodGroup === req.bloodGroup);
    if (!stockItem || stockItem.units < req.units) {
      showToast(`Cannot allocate: Insufficient units of ${req.bloodGroup} in stock.`);
      return;
    }

    // Deduct stock
    setStock(prevStock =>
      prevStock.map(item => {
        if (item.bloodGroup === req.bloodGroup) {
          const updatedUnits = item.units - req.units;
          let updatedStatus = item.status;
          if (updatedUnits < item.minRequired / 2) updatedStatus = 'Critical Low';
          else if (updatedUnits < item.minRequired) updatedStatus = 'Low';
          return { ...item, units: updatedUnits, status: updatedStatus };
        }
        return item;
      })
    );

    // Update request status to Allocated
    setRequests(prevReqs =>
      prevReqs.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = r.timeline.map(t => {
            if (t.status === 'Allocation Approved') return { ...t, time: 'Just Now', done: true };
            if (t.status === 'Inventory Matching') return { ...t, done: true };
            return t;
          });
          return { ...r, status: 'Allocated', timeline: updatedTimeline };
        }
        return r;
      })
    );

    // Update local drawer state if open
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => {
        if (!prev) return null;
        const updatedTimeline = prev.timeline.map(t => {
          if (t.status === 'Allocation Approved') return { ...t, time: 'Just Now', done: true };
          if (t.status === 'Inventory Matching') return { ...t, done: true };
          return t;
        });
        return { ...prev, status: 'Allocated', timeline: updatedTimeline };
      });
    }

    showToast(`Allocated ${req.units} units of ${req.bloodGroup} for ${req.facility}.`);
  };

  // Handler for declining requests
  const handleDeclineRequest = (requestId: string) => {
    setRequests(prevReqs =>
      prevReqs.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = [...r.timeline, { status: 'Request Declined', time: 'Just Now', description: 'Declined by coordinating admin.', done: true }];
          return { ...r, status: 'Declined', timeline: updatedTimeline };
        }
        return r;
      })
    );

    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => {
        if (!prev) return null;
        const updatedTimeline = [...prev.timeline, { status: 'Request Declined', time: 'Just Now', description: 'Declined by coordinating admin.', done: true }];
        return { ...prev, status: 'Declined', timeline: updatedTimeline };
      });
    }

    showToast(`Request ${requestId} declined.`);
  };

  // Handler for dispatching request
  const handleDispatch = (requestId: string) => {
    setRequests(prevReqs =>
      prevReqs.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = r.timeline.map(t => {
            if (t.status === 'Courier Dispatched') return { ...t, time: 'Just Now', done: true };
            return t;
          });
          return { ...r, status: 'Dispatched', timeline: updatedTimeline };
        }
        return r;
      })
    );

    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => {
        if (!prev) return null;
        const updatedTimeline = prev.timeline.map(t => {
          if (t.status === 'Courier Dispatched') return { ...t, time: 'Just Now', done: true };
          return t;
        });
        return { ...prev, status: 'Dispatched', timeline: updatedTimeline };
      });
    }

    showToast(`Blood dispatch initiated for ${requestId}. Courier on route.`);
  };

  // Filter handlers helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('All');
    setBloodGroupFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-lg pb-xxl w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123e20] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-slide-in">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">info</span>
          <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sub-Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant/30 pb-lg">
        <div>
          <nav className="flex items-center gap-sm mb-1 text-on-surface-variant font-label-caps text-[10px] uppercase tracking-wider">
            <span>Admin</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-bold">Blood Management</span>
          </nav>
          <h1 className="font-syne font-bold text-2xl text-on-surface">Blood Management</h1>
        </div>

        {/* Tab Switcher and Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-outline-variant/30">
            <button 
              onClick={() => {
                setActiveTab('requests');
                handleResetFilters();
              }}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all ${
                activeTab === 'requests' 
                  ? 'bg-pale-mint text-forest-green shadow-sm font-bold' 
                  : 'text-on-surface-variant hover:bg-neutral-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">vital_signs</span>
              Requests
            </button>
            <button 
              onClick={() => {
                setActiveTab('stock');
                handleResetFilters();
              }}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all ${
                activeTab === 'stock' 
                  ? 'bg-pale-mint text-forest-green shadow-sm font-bold' 
                  : 'text-on-surface-variant hover:bg-neutral-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Stock Inventory
            </button>
            <button 
              onClick={() => {
                setActiveTab('donations');
                handleResetFilters();
              }}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all ${
                activeTab === 'donations' 
                  ? 'bg-pale-mint text-forest-green shadow-sm font-bold' 
                  : 'text-on-surface-variant hover:bg-neutral-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              Donations
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'donations' ? (
              <button 
                onClick={() => setIsRecordDonationOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps text-[12px]"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Record Donation
              </button>
            ) : (
              <button 
                onClick={() => setIsAddRequestOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md hover:brightness-110 transition-all font-label-caps text-[12px]"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Stats Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Requests */}
        <div 
          onClick={() => {
            setActiveTab('requests');
            setUrgencyFilter('All');
            setStatusFilter('All');
          }}
          className="bg-primary text-white p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="material-symbols-outlined text-white/85 text-3xl">vital_signs</span>
            <span className="text-[10px] font-bold text-[#c8f17a] bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> 12%
            </span>
          </div>
          <h3 className="font-syne font-bold text-[32px] tracking-tight leading-none">{activeRequestsCount}</h3>
          <p className="font-body-sm text-[12px] text-white/80 mt-1">Active Requests</p>
        </div>

        {/* Critical Alerts */}
        <div 
          onClick={() => {
            setActiveTab('requests');
            setUrgencyFilter('Critical');
            setStatusFilter('All');
          }}
          className="bg-white border border-red-200 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
            </div>
            {criticalRequestsCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            )}
          </div>
          <h3 className="font-syne font-bold text-[32px] text-red-600 leading-none">
            {criticalRequestsCount < 10 ? `0${criticalRequestsCount}` : criticalRequestsCount}
          </h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 font-bold">Critical Needs Action</p>
        </div>

        {/* Donations Today */}
        <div 
          onClick={() => {
            setActiveTab('donations');
            setStatusFilter('All');
          }}
          className="bg-white border border-outline-variant/30 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-pale-mint rounded-lg">
              <span className="material-symbols-outlined text-secondary text-[20px]">water_drop</span>
            </div>
            <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> 4%
            </span>
          </div>
          <h3 className="font-syne font-bold text-[32px] text-forest-green leading-none">{donationsTodayCount}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Donated Units Today</p>
        </div>

        {/* Total Stock */}
        <div 
          onClick={() => {
            setActiveTab('stock');
            setStatusFilter('All');
          }}
          className="bg-white border border-outline-variant/30 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container-highest rounded-lg">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">inventory_2</span>
            </div>
            <span className="text-[9px] font-bold text-forest-green bg-pale-mint px-2 py-0.5 rounded uppercase tracking-wider">Stable</span>
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">{totalStockUnits.toLocaleString()}</h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">Total Stock (Units)</p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => {
            setActiveTab('stock');
            setStatusFilter('Critical Low');
          }}
          className="bg-white border border-outline-variant/30 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-variant rounded-lg">
              <span className="material-symbols-outlined text-outline text-[20px]">notifications_active</span>
            </div>
            {lowStockAlertsCount > 0 && (
              <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Low Stock</span>
            )}
          </div>
          <h3 className="font-syne font-bold text-[30px] text-forest-green leading-none">
            {lowStockAlertsCount < 10 ? `0${lowStockAlertsCount}` : lowStockAlertsCount}
          </h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 truncate">Alerts: <span className="font-bold text-red-600">{lowStockGroupsText || 'None'}</span></p>
        </div>
      </div>

      {/* ==================== TAB CONTENT: REQUESTS ==================== */}
      {activeTab === 'requests' && (
        <div className="space-y-lg animate-fade-in">
          {/* Critical Requests Banner */}
          {criticalRequestsCount > 0 && (
            <div className="bg-red-50 text-red-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-red-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white rounded-full p-2 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm">{criticalRequestsCount} Critical Blood Requests Active</h3>
                  <p className="text-xs text-red-700/90 mt-0.5">Immediate inventory matching or redirection dispatch required for trauma emergencies.</p>
                </div>
              </div>
              <button 
                onClick={() => setUrgencyFilter('Critical')}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-xl text-xs font-bold font-syne uppercase tracking-wider shrink-0 shadow-sm transition-all"
              >
                Review Critical
              </button>
            </div>
          )}

          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
            {/* Table Header Controls */}
            <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-md bg-neutral-50/50">
              <div>
                <h2 className="font-syne font-bold text-lg text-forest-green">Blood Requests Pipeline</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Monitor, match, and authorize units allocation for regional clinics and hospitals.</p>
              </div>

              {/* Dynamic Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-outline-variant/50 text-xs outline-none focus:border-primary placeholder:text-on-surface-variant/65" 
                    placeholder="Search request ID, facility..."
                    type="text"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Urgency select */}
                  <select 
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="All">Urgency (All)</option>
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Routine">Routine</option>
                  </select>

                  {/* Blood group select */}
                  <select 
                    value={bloodGroupFilter}
                    onChange={(e) => setBloodGroupFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="All">Blood Group (All)</option>
                    <option value="O-">O-</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>

                  {/* Status select */}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="All">Status (All)</option>
                    <option value="Pending Match">Pending Match</option>
                    <option value="Matching">Matching</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Declined">Declined</option>
                  </select>

                  {/* Reset Button */}
                  {(searchQuery || urgencyFilter !== 'All' || bloodGroupFilter !== 'All' || statusFilter !== 'All') && (
                    <button 
                      onClick={handleResetFilters}
                      className="px-3 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-neutral-100 rounded-xl text-xs flex items-center gap-1 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF2EE] text-on-surface border-b border-outline-variant/30">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Target Facility</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Units</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Urgency</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Distance</th>
                    <th className="px-6 py-4 w-12 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      const isCritical = req.urgency === 'Critical';
                      const isUrgent = req.urgency === 'Urgent';

                      return (
                        <tr 
                          key={req.id} 
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRequestDrawerOpen(true);
                          }}
                          className={`hover:bg-neutral-50/80 transition-colors group cursor-pointer border-l-4 ${
                            isCritical ? 'border-l-red-600' : isUrgent ? 'border-l-amber-500' : 'border-l-primary'
                          }`}
                        >
                          <td className="px-6 py-4 font-bold text-on-surface">{req.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-on-surface">{req.facility}</div>
                            <div className="text-[11px] text-on-surface-variant">{req.facilityType}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded font-bold text-sm">
                              {req.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant rounded text-xs font-bold font-syne">
                              {req.units} units
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded uppercase border ${
                              isCritical ? 'bg-red-50 text-red-700 border-red-200' :
                              isUrgent ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-neutral-50 text-neutral-600 border-neutral-200'
                            }`}>
                              {req.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 w-fit rounded-full ${
                              req.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                              req.status === 'Declined' ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' :
                              req.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              req.status === 'Allocated' ? 'bg-secondary-container/50 text-on-secondary-container' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                req.status === 'Delivered' ? 'bg-green-600' :
                                req.status === 'Declined' ? 'bg-neutral-400' :
                                req.status === 'Dispatched' ? 'bg-blue-600' :
                                req.status === 'Allocated' ? 'bg-primary' :
                                'bg-amber-500 animate-pulse'
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{req.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">distance</span>
                              {req.distance}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => {
                                setSelectedRequest(req);
                                setIsRequestDrawerOpen(true);
                              }}
                              className="text-outline-variant hover:text-forest-green transition-colors p-1.5 rounded-lg hover:bg-neutral-100"
                              aria-label="View Details"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-on-surface-variant font-dmsans">
                        <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">no_accounts</span>
                        No blood requests matching search criteria or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Total count footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/30 bg-neutral-50/20">
              <p className="text-xs text-on-surface-variant">
                Showing 1-{filteredRequests.length} of {filteredRequests.length} requests
              </p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green text-white font-bold text-xs">1</button>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB CONTENT: STOCK INVENTORY ==================== */}
      {activeTab === 'stock' && (
        <div className="space-y-lg animate-fade-in">
          {/* Inventory Controls Header */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-md shadow-sm">
            <div>
              <h2 className="font-syne font-bold text-lg text-forest-green">Central Blood Bank Stock</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Real-time status of critical red blood cell reserves, compatibility metrics, and minimum backup requirements.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-outline-variant/50 text-xs outline-none focus:border-primary placeholder:text-on-surface-variant/65" 
                  placeholder="Filter blood group..."
                  type="text"
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
              >
                <option value="All">Level Status (All)</option>
                <option value="Healthy">Healthy</option>
                <option value="Low">Low</option>
                <option value="Critical Low">Critical Low</option>
              </select>
            </div>
          </div>

          {/* Blood Stock Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {filteredStock.length > 0 ? (
              filteredStock.map((item) => {
                const percent = Math.min(100, Math.round((item.units / item.minRequired) * 100));
                const isCritical = item.status === 'Critical Low';
                const isLow = item.status === 'Low';

                return (
                  <div 
                    key={item.bloodGroup}
                    onClick={() => {
                      setSelectedStock(item);
                      setIsStockDrawerOpen(true);
                    }}
                    className={`bg-white rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-sm group ${
                      isCritical ? 'border-red-200 bg-red-50/20' : isLow ? 'border-amber-200 bg-amber-50/10' : 'border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`font-syne font-bold text-2xl ${isCritical ? 'text-red-600' : 'text-forest-green'}`}>
                          {item.bloodGroup}
                        </h3>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          isCritical ? 'bg-red-100 text-red-800' : 
                          isLow ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="font-syne font-bold text-4xl text-on-surface">{item.units}</span>
                        <span className="text-xs text-on-surface-variant ml-1.5">units total</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
                        <span>Buffer Requirement: {item.minRequired} units</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-red-600' : isLow ? 'bg-amber-500' : 'bg-primary'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100 text-[10px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">volunteer_activism</span>
                        <span>Compatible: {item.compatibles.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">bloodtype</span>
                No matching blood inventory items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB CONTENT: DONATIONS LOG ==================== */}
      {activeTab === 'donations' && (
        <div className="space-y-lg animate-fade-in">
          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
            {/* Table Header Controls */}
            <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-md bg-neutral-50/50">
              <div>
                <h2 className="font-syne font-bold text-lg text-forest-green">Blood Donation Registry</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Track voluntary donor collection events, testing status, and central repository logging.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-outline-variant/50 text-xs outline-none focus:border-primary placeholder:text-on-surface-variant/65" 
                    placeholder="Search donor name, log ID..."
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    value={bloodGroupFilter}
                    onChange={(e) => setBloodGroupFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="All">Blood Group (All)</option>
                    <option value="O-">O-</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>

                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-white rounded-xl border border-outline-variant/50 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%234b5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="All">Status (All)</option>
                    <option value="Screening">Screening</option>
                    <option value="Processing">Processing</option>
                    <option value="Tested & Approved">Tested & Approved</option>
                    <option value="Stored">Stored</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>

                  {/* Reset Button */}
                  {(searchQuery || bloodGroupFilter !== 'All' || statusFilter !== 'All') && (
                    <button 
                      onClick={handleResetFilters}
                      className="px-3 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-neutral-100 rounded-xl text-xs flex items-center gap-1 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Donations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EFF2EE] text-on-surface border-b border-outline-variant/30">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Log ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Donor Name</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Units Collected</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Collection Site</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Date Logged</th>
                    <th className="px-6 py-4 w-12 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map((donation) => {
                      return (
                        <tr 
                          key={donation.id} 
                          onClick={() => {
                            setSelectedDonation(donation);
                            setIsDonationDrawerOpen(true);
                          }}
                          className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4 font-bold text-on-surface">{donation.id}</td>
                          <td className="px-6 py-4 font-semibold text-on-surface">{donation.donorName}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded font-bold text-sm">
                              {donation.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-on-surface">{donation.units} Unit{donation.units > 1 ? 's' : ''}</td>
                          <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">{donation.location}</td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 w-fit rounded-full ${
                              donation.status === 'Stored' ? 'bg-green-50 text-green-700 border border-green-200' :
                              donation.status === 'Tested & Approved' ? 'bg-secondary-container/50 text-on-secondary-container' :
                              donation.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                donation.status === 'Stored' ? 'bg-green-600' :
                                donation.status === 'Tested & Approved' ? 'bg-primary' :
                                donation.status === 'Dispatched' ? 'bg-blue-600' :
                                'bg-amber-500 animate-pulse'
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{donation.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-on-surface-variant font-medium">{donation.date}</td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => {
                                setSelectedDonation(donation);
                                setIsDonationDrawerOpen(true);
                              }}
                              className="text-outline-variant hover:text-forest-green transition-colors p-1.5 rounded-lg hover:bg-neutral-100"
                              aria-label="View Details"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-on-surface-variant font-dmsans">
                        <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">no_accounts</span>
                        No donation records matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/30 bg-neutral-50/20">
              <p className="text-xs text-on-surface-variant">
                Showing 1-{filteredDonations.length} of {filteredDonations.length} donations
              </p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green text-white font-bold text-xs">1</button>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-forest-green hover:bg-forest-green/90 text-white disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SLIDE OVER: BLOOD REQUEST DETAIL PANEL ==================== */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isRequestDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsRequestDrawerOpen(false)}
      />
      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isRequestDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedRequest && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded uppercase border mb-1.5 ${
                  selectedRequest.urgency === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  selectedRequest.urgency === 'Urgent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-neutral-50 text-neutral-600 border border-neutral-200'
                }`}>
                  {selectedRequest.urgency} Urgency
                </span>
                <h3 className="font-syne font-bold text-lg text-primary leading-tight">Request {selectedRequest.id}</h3>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsRequestDrawerOpen(false)}
                aria-label="Close details"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              {/* Facility card */}
              <div className="bg-neutral-50/80 border border-outline-variant/20 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-1 text-on-surface-variant">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Target Facility</span>
                  <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                </div>
                <h4 className="font-syne font-bold text-base text-forest-green">{selectedRequest.facility}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedRequest.facilityType} • {selectedRequest.distance} away</p>
              </div>

              {/* Requirement specifications */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Requirement Specifications</h4>
                <div className="grid grid-cols-2 gap-md">
                  <div className="border border-outline-variant/30 rounded-xl p-3 bg-neutral-50/50">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Blood Group Required</span>
                    <span className="block font-syne font-bold text-2xl text-red-600 mt-1">{selectedRequest.bloodGroup}</span>
                  </div>
                  <div className="border border-outline-variant/30 rounded-xl p-3 bg-neutral-50/50">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Units Requested</span>
                    <span className="block font-syne font-bold text-2xl text-forest-green mt-1">{selectedRequest.units} Units</span>
                  </div>
                </div>
              </div>

              {/* Matching Status Inventory check */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Central Inventory Status</h4>
                <div className="p-4 border border-outline-variant/20 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-on-surface-variant font-medium block">Current Reserves of {selectedRequest.bloodGroup}:</span>
                    <span className="font-syne font-bold text-sm text-forest-green mt-0.5">
                      {stock.find(s => s.bloodGroup === selectedRequest.bloodGroup)?.units || 0} units in stock
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded uppercase border ${
                    (stock.find(s => s.bloodGroup === selectedRequest.bloodGroup)?.units || 0) >= selectedRequest.units
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {(stock.find(s => s.bloodGroup === selectedRequest.bloodGroup)?.units || 0) >= selectedRequest.units
                      ? 'Stock Available' 
                      : 'Insufficient Reserve'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="space-y-sm">
                  <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Notes & Special Instructions</h4>
                  <p className="text-xs text-on-surface-variant bg-neutral-50 p-3 rounded-lg border border-outline-variant/20 italic">
                    "{selectedRequest.notes}"
                  </p>
                </div>
              )}

              {/* Matching timeline */}
              <div className="space-y-sm pt-4 border-t border-outline-variant/20">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Request Routing History</h4>
                <div className="space-y-4 pt-2">
                  {selectedRequest.timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-1 ${
                          item.done 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-100 text-neutral-400'
                        }`}>
                          {item.done && <span className="material-symbols-outlined text-[10px] font-bold">check</span>}
                        </div>
                        {idx < selectedRequest.timeline.length - 1 && (
                          <div className="w-[1px] bg-outline-variant/40 flex-1 my-1" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${item.done ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                          {item.status}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{item.description}</p>
                        {item.done && item.time !== '--' && (
                          <p className="text-[9px] text-primary mt-0.5 italic">{item.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action panel */}
            <div className="p-6 bg-white border-t border-outline-variant/30 flex gap-md shrink-0">
              {selectedRequest.status === 'Pending Match' || selectedRequest.status === 'Matching' ? (
                <>
                  <button 
                    onClick={() => {
                      handleDeclineRequest(selectedRequest.id);
                      setIsRequestDrawerOpen(false);
                    }}
                    className="flex-1 py-3 px-4 border border-outline-variant text-on-surface-variant hover:bg-neutral-50 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Decline Request
                  </button>
                  <button 
                    onClick={() => {
                      handleAllocateUnits(selectedRequest.id);
                    }}
                    disabled={(stock.find(s => s.bloodGroup === selectedRequest.bloodGroup)?.units || 0) < selectedRequest.units}
                    className="flex-1 py-3 px-4 bg-primary hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    Allocate Units
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </>
              ) : selectedRequest.status === 'Allocated' ? (
                <button 
                  onClick={() => {
                    handleDispatch(selectedRequest.id);
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  Dispatch Dispatcher Logistics
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 px-4 bg-neutral-100 border border-neutral-200 text-neutral-400 rounded-xl font-syne font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Request Completed ({selectedRequest.status})
                </button>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ==================== SLIDE OVER: BLOOD STOCK DETAILS ==================== */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isStockDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsStockDrawerOpen(false)}
      />
      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isStockDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedStock && (
          <>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div>
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Inventory Metrics</span>
                <h3 className="font-syne font-bold text-lg text-primary leading-tight">Blood Group {selectedStock.bloodGroup}</h3>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsStockDrawerOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 border border-outline-variant/20 rounded-xl">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Units Stored</span>
                  <span className="block font-syne font-bold text-3xl text-forest-green mt-1">{selectedStock.units} Units</span>
                </div>
                <div className="p-4 bg-neutral-50 border border-outline-variant/20 rounded-xl">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Backup Threshold</span>
                  <span className="block font-syne font-bold text-3xl text-primary mt-1">{selectedStock.minRequired} Units</span>
                </div>
              </div>

              {/* Compatibility matrix */}
              <div className="space-y-sm bg-neutral-50/50 border border-outline-variant/20 p-4 rounded-xl">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Transfusion Compatibility</h4>
                <div className="space-y-3 mt-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                    <span className="text-on-surface-variant">Compatible Donor Groups:</span>
                    <span className="font-bold text-on-surface">{selectedStock.compatibles.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                    <span className="text-on-surface-variant">Can Receive Transfusions From:</span>
                    <span className="font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                      {selectedStock.bloodGroup === 'AB+' ? 'Universal Recipient (All)' : selectedStock.compatibles.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-on-surface-variant">Can Give Transfusions To:</span>
                    <span className="font-bold text-forest-green bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                      {selectedStock.bloodGroup === 'O-' ? 'Universal Donor (All)' : selectedStock.bloodGroup}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related requests list */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Active Local Requests for {selectedStock.bloodGroup}</h4>
                <div className="space-y-2 mt-2">
                  {requests.filter(r => r.bloodGroup === selectedStock.bloodGroup && r.status !== 'Delivered' && r.status !== 'Declined').length > 0 ? (
                    requests.filter(r => r.bloodGroup === selectedStock.bloodGroup && r.status !== 'Delivered' && r.status !== 'Declined').map(r => (
                      <div key={r.id} className="p-3 bg-neutral-50/50 hover:bg-neutral-100 border border-outline-variant/20 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-on-surface">{r.id}</span> • <span className="text-on-surface-variant">{r.facility}</span>
                        </div>
                        <span className="font-bold text-forest-green">{r.units} Units</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant/75 italic">No active requests for this blood group.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-outline-variant/30 shrink-0">
              <button 
                onClick={() => {
                  setNewDonationGroup(selectedStock.bloodGroup);
                  setIsStockDrawerOpen(false);
                  setIsRecordDonationOpen(true);
                }}
                className="w-full py-3 bg-primary hover:brightness-110 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Log Targeted Donor Collection
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ==================== SLIDE OVER: DONATION DETAILS ==================== */}
      <div 
        className={`fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isDonationDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDonationDrawerOpen(false)}
      />
      <aside 
        className={`fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 border-l border-outline-variant/30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isDonationDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedDonation && (
          <>
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
              <div>
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">Donation Log Details</span>
                <h3 className="font-syne font-bold text-lg text-primary leading-tight">{selectedDonation.id}</h3>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setIsDonationDrawerOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-lg no-scrollbar">
              {/* Donor Summary */}
              <div className="p-4 bg-neutral-50 border border-outline-variant/20 rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Donor Name:</span>
                  <span className="font-bold text-on-surface">{selectedDonation.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Blood Group:</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 rounded font-syne">{selectedDonation.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Volume Collected:</span>
                  <span className="font-bold text-on-surface">{selectedDonation.units} Unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Collection Site:</span>
                  <span className="font-bold text-on-surface">{selectedDonation.location}</span>
                </div>
              </div>

              {/* Donor Vitals / Screening Results */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Screening & Vitals Log</h4>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="border border-outline-variant/30 rounded-xl p-3 bg-neutral-50/50 text-xs">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Temperature</span>
                    <span className="block font-syne font-bold text-base text-forest-green mt-1">{selectedDonation.temperature}°F</span>
                  </div>
                  <div className="border border-outline-variant/30 rounded-xl p-3 bg-neutral-50/50 text-xs">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Hemoglobin</span>
                    <span className="block font-syne font-bold text-base text-forest-green mt-1">{selectedDonation.hemoglobin} g/dL</span>
                  </div>
                </div>
              </div>

              {/* Status workflow */}
              <div className="space-y-sm">
                <h4 className="font-syne font-bold text-xs text-primary uppercase tracking-wider">Log Status Workflow</h4>
                <div className="space-y-3 mt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-on-surface-variant">Collection Date:</span>
                    <span className="font-medium text-on-surface">{selectedDonation.date}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-on-surface-variant">Virology Screening:</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Negative (Clear)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-on-surface-variant">Processing Status:</span>
                    <span className="font-bold uppercase tracking-wide text-primary">{selectedDonation.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-outline-variant/30 shrink-0">
              <button 
                onClick={() => {
                  showToast(`Donation certificate generated and emailed to donor.`);
                  setIsDonationDrawerOpen(false);
                }}
                className="w-full py-3 bg-primary hover:brightness-110 text-white rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Issue Donation Receipt
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ==================== MODAL OVERLAY: ADD REQUEST ==================== */}
      {isAddRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm"
            onClick={() => setIsAddRequestOpen(false)}
          />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full z-10 border border-outline-variant/30 shadow-2xl relative animate-scale-in">
            <h3 className="font-syne font-bold text-xl text-primary mb-1">Log New Blood Request</h3>
            <p className="text-xs text-on-surface-variant mb-4">Register a new clinical blood dispatch requirement for hospital blood bank inventory matching.</p>
            
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Facility / Hospital Name</label>
                <input 
                  type="text" 
                  value={newRequestFacility}
                  onChange={(e) => setNewRequestFacility(e.target.value)}
                  placeholder="e.g. Metro General Hospital" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Blood Group Needed</label>
                  <select 
                    value={newRequestGroup}
                    onChange={(e) => setNewRequestGroup(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option>O-</option>
                    <option>O+</option>
                    <option>A-</option>
                    <option>A+</option>
                    <option>B-</option>
                    <option>B+</option>
                    <option>AB-</option>
                    <option>AB+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Units Requested</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={newRequestUnits}
                    onChange={(e) => setNewRequestUnits(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Urgency Category</label>
                  <select 
                    value={newRequestUrgency}
                    onChange={(e) => setNewRequestUrgency(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Facility Classification</label>
                  <input 
                    type="text" 
                    value={newRequestFacilityType}
                    onChange={(e) => setNewRequestFacilityType(e.target.value)}
                    placeholder="e.g. Trauma Center" 
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Clinical Notes & Instructions</label>
                <textarea 
                  value={newRequestNotes}
                  onChange={(e) => setNewRequestNotes(e.target.value)}
                  placeholder="Provide emergency details, cross-match specifications..." 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all h-20 resize-none" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddRequestOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md"
                >
                  Log Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL OVERLAY: RECORD DONATION ==================== */}
      {isRecordDonationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#121c2a]/45 backdrop-blur-sm"
            onClick={() => setIsRecordDonationOpen(false)}
          />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full z-10 border border-outline-variant/30 shadow-2xl relative animate-scale-in">
            <h3 className="font-syne font-bold text-xl text-primary mb-1">Record Blood Donation</h3>
            <p className="text-xs text-on-surface-variant mb-4">Log volunteer blood donor details, pre-screening vitals, and add units to stock ledger.</p>
            
            <form onSubmit={handleRecordDonation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Donor Full Name</label>
                <input 
                  type="text" 
                  value={newDonationName}
                  onChange={(e) => setNewDonationName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Blood Group</label>
                  <select 
                    value={newDonationGroup}
                    onChange={(e) => setNewDonationGroup(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    <option>O-</option>
                    <option>O+</option>
                    <option>A-</option>
                    <option>A+</option>
                    <option>B-</option>
                    <option>B+</option>
                    <option>AB-</option>
                    <option>AB+</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Units Collected</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={5}
                    value={newDonationUnits}
                    onChange={(e) => setNewDonationUnits(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pre-Screen Temp (°F)</label>
                  <input 
                    type="text" 
                    value={newDonationTemp}
                    onChange={(e) => setNewDonationTemp(e.target.value)}
                    placeholder="98.6" 
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Hemoglobin Level (g/dL)</label>
                  <input 
                    type="text" 
                    value={newDonationHgb}
                    onChange={(e) => setNewDonationHgb(e.target.value)}
                    placeholder="e.g. 13.5" 
                    className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Collection Site Location</label>
                <input 
                  type="text" 
                  value={newDonationLocation}
                  onChange={(e) => setNewDonationLocation(e.target.value)}
                  placeholder="e.g. Red Cross Mobile Drive" 
                  className="w-full bg-neutral-50 border border-outline-variant/40 focus:border-primary rounded-xl px-4 py-2 text-sm outline-none transition-all" 
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsRecordDonationOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md"
                >
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
