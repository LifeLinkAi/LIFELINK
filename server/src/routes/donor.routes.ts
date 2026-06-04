import { Router } from 'express';
import { getDonors, createDonor, createDonorBulk, updateDonor, deleteDonor } from '../controllers/donor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/', authenticate, getDonors);
router.post('/', authenticate, authorize('Admin'), createDonor);
router.post('/bulk', authenticate, authorize('Admin'), createDonorBulk);
router.put('/:id', authenticate, authorize('Admin'), updateDonor);
router.delete('/:id', authenticate, authorize('Admin'), deleteDonor);

export default router;
