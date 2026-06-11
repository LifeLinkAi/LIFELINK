import { Router } from 'express';
import { getRequests, createRequest, updateRequest, deleteRequest, createPatientRequest, getMyRequests, respondToRequest, findMatchesForRequest, dispatchToDonors } from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/', authenticate, getRequests);

// --- Patient Role Routes ---
router.post('/patient', authenticate, authorize('Patient', 'Hospital'), createPatientRequest);
router.get('/my-history', authenticate, authorize('Patient', 'Hospital'), getMyRequests);

// Donor response endpoint - token-based, no authentication required so donors can respond via email link
router.post('/:id/respond', respondToRequest);

// Manual selection endpoints
router.get('/:id/find-matches', authenticate, authorize('Patient', 'Hospital'), findMatchesForRequest);
router.post('/:id/dispatch', authenticate, authorize('Patient', 'Hospital'), dispatchToDonors);

// --- Admin Role Routes ---
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;
