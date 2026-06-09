import { Router } from 'express';
import { getRequests, createRequest, updateRequest, deleteRequest, createPatientRequest, getMyRequests } from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/', authenticate, getRequests);

// --- Patient Role Routes ---
router.post('/patient', authenticate, authorize('Patient', 'Hospital'), createPatientRequest);
router.get('/my-history', authenticate, authorize('Patient', 'Hospital'), getMyRequests);

// --- Admin Role Routes ---
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;
