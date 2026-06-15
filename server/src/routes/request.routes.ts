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
  dispatchToDonors
} from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- General Triage / Overview ---
// Allows authenticated users/nodes to view the request pool
router.get('/', authenticate, getRequests);

// --- Patient & Hospital Request Routes ---
// Routes for creating and tracking patient-specific needs
router.post('/patient', authenticate, authorize('Patient', 'Hospital'), createPatientRequest);
router.get('/my-history', authenticate, authorize('Patient', 'Hospital'), getMyRequests);

// --- Hospital Request Management Routes ---
// Hospital dashboard endpoints for reviewing and fulfilling incoming needs
router.get('/hospital/incoming', authenticate, authorize('Hospital'), getHospitalIncomingRequests);
router.patch('/:id/status', authenticate, authorize('Hospital'), updateRequestStatus);

// --- Manual Selection & Donor Responses ---
// Donor response endpoint - token-based, no authentication required so donors can respond via email link
router.post('/:id/respond', respondToRequest);

// Manual selection endpoints
router.get('/:id/find-matches', authenticate, authorize('Patient', 'Hospital'), findMatchesForRequest);
router.post('/:id/dispatch', authenticate, authorize('Patient', 'Hospital'), dispatchToDonors);

// --- Admin Management Routes ---
// High-level system overrides restricted strictly to system administrators
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;