import { Router } from 'express';
import { 
  getRequests, 
  createRequest, 
  createPatientRequest, 
  getMyRequests, 
  updateRequest, 
  deleteRequest 
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

// --- Admin Management Routes ---
// High-level system overrides restricted strictly to system administrators
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;
