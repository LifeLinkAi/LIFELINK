import { Router } from 'express';
import { 
  getDonors, 
  createDonor, 
  createDonorBulk, 
  updateDonor, 
  deleteDonor,
  getMeProfile,
  completeDonorSetup
} from '../controllers/donor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication
router.get('/me', authenticate, getMeProfile);
router.put('/setup-complete', authenticate, completeDonorSetup);

// mutate actions require Admin role
router.get('/', authenticate, getDonors);
router.post('/', authenticate, authorize('Admin'), createDonor);
router.post('/bulk', authenticate, authorize('Admin'), createDonorBulk);
router.put('/:id', authenticate, authorize('Admin'), updateDonor);
router.delete('/:id', authenticate, authorize('Admin'), deleteDonor);

export default router;
