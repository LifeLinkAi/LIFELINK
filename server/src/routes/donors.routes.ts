import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getDonors,
  createDonor,
  createDonorBulk,
  updateDonor,
  deleteDonor,
} from '../controllers/donor.controller';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/',        authenticate as any,                            getDonors      as any);
router.post('/',       authenticate as any, authorize('Admin') as any, createDonor    as any);
router.post('/bulk',   authenticate as any, authorize('Admin') as any, createDonorBulk as any);
router.put('/:id',     authenticate as any, authorize('Admin') as any, updateDonor    as any);
router.delete('/:id',  authenticate as any, authorize('Admin') as any, deleteDonor    as any);

export default router;
