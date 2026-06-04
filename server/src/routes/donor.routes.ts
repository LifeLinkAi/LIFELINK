import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from '../controllers/donor.controller';

const router = Router();

// All donor profile routes require auth + Donor role
router.use(authenticate as any, authorize('Donor') as any);

router.get('/',    getProfile    as any);   // GET    /api/donor/profile
router.post('/',   createProfile as any);   // POST   /api/donor/profile
router.put('/',    updateProfile as any);   // PUT    /api/donor/profile
router.delete('/', deleteProfile as any);   // DELETE /api/donor/profile

export default router;
