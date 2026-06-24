import { Router } from 'express';
import { 
  getRequests, 
  createRequest, 
  createPatientRequest, 
  getMyRequests, 
  getHospitalIncomingRequests,
  updateRequestStatus,
  updateRequest, 
  deleteRequest,
  respondToRequest,
  findMatchesForRequest,
  dispatchToDonors,
  expressInterest,
  fulfillBloodRequest,
  getHospitalTriageBoard,
  getHospitalLobbyQueue,
  getHospitalPhlebotomyQueue,
  arriveDirectedDonor,
  completeDirectDonation,
  getMyPledges
} from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- General Triage / Overview ---
// Allows authenticated users/nodes to view the request pool
router.get('/', authenticate, getRequests);

// --- Patient & Hospital Request Routes ---
// Routes for creating and tracking patient-specific needs
router.post('/patient', authenticate, authorize('Patient', 'Hospital', 'Donor'), createPatientRequest);
router.get('/my-history', authenticate, authorize('Patient', 'Hospital', 'Donor'), getMyRequests);
router.get('/donor/my-pledges', authenticate, authorize('Donor'), getMyPledges);

// --- Hospital Request Management Routes ---
// Hospital dashboard endpoints for reviewing and fulfilling incoming needs
router.get('/hospital/incoming', authenticate, authorize('Hospital'), getHospitalIncomingRequests);
router.patch('/:id/status', authenticate, authorize('Hospital'), updateRequestStatus);
router.patch('/:id/fulfill-blood', authenticate, authorize('Hospital'), fulfillBloodRequest);

// --- Directed Command Center Routes ---
router.get('/hospital/triage-board', authenticate, authorize('Hospital'), getHospitalTriageBoard);
router.get('/hospital/lobby-queue', authenticate, authorize('Hospital'), getHospitalLobbyQueue);
router.get('/hospital/phlebotomy-queue', authenticate, authorize('Hospital'), getHospitalPhlebotomyQueue);
router.patch('/:reqId/pledge/:donorId/arrive', authenticate, authorize('Hospital'), arriveDirectedDonor);
router.patch('/:reqId/pledge/:donorId/complete', authenticate, authorize('Hospital'), completeDirectDonation);

// --- Manual Selection & Donor Responses ---
// Donor response endpoint - token-based, no authentication required so donors can respond via email link
router.post('/:id/respond', respondToRequest);

// Donor self-initiated interest expression route
router.post('/:id/interest', authenticate, authorize('Donor'), expressInterest);

// Manual selection endpoints
router.get('/:id/find-matches', authenticate, authorize('Patient', 'Hospital', 'Donor'), findMatchesForRequest);
router.post('/:id/dispatch', authenticate, authorize('Patient', 'Hospital', 'Donor'), dispatchToDonors);

// --- Admin Management Routes ---
// High-level system overrides restricted strictly to system administrators
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;