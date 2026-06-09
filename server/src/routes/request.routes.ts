import { Router } from 'express';
import { getRequests, createRequest, createPatientRequest, getMyRequests, updateRequest, deleteRequest } from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Patient-facing request endpoints
router.post('/patient', authenticate, createPatientRequest);
router.get('/my-history', authenticate, getMyRequests);

// Admin routes
router.get('/', authenticate, authorize('Admin'), getRequests);
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;
