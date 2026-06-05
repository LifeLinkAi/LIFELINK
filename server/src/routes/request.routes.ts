import { Router } from 'express';
import { getRequests, createRequest, updateRequest, deleteRequest } from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/', authenticate, getRequests);
router.post('/', authenticate, authorize('Admin'), createRequest);
router.put('/:id', authenticate, authorize('Admin'), updateRequest);
router.delete('/:id', authenticate, authorize('Admin'), deleteRequest);

export default router;
