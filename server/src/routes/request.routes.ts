import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  acceptRequest,
  dismissRequest,
  deleteRequest,
} from '../controllers/request.controller';

const router = Router();

// Public read — any authenticated user can see pending requests
router.get('/',    authenticate as any, getAllRequests   as any);  // GET    /api/requests
router.get('/:id', authenticate as any, getRequestById  as any);  // GET    /api/requests/:id

// Create a request (any auth user)
router.post('/',   authenticate as any, createRequest   as any);  // POST   /api/requests

// Donor actions
router.put('/:id/accept',  authenticate as any, acceptRequest  as any);  // PUT /api/requests/:id/accept
router.put('/:id/dismiss', authenticate as any, dismissRequest as any);  // PUT /api/requests/:id/dismiss

// Delete own request
router.delete('/:id', authenticate as any, deleteRequest as any);  // DELETE /api/requests/:id

export default router;
