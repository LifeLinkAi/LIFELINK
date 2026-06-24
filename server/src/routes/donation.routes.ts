import { Router } from 'express';
import { getHospitalDonations, updatePipelineStatus, getAllDonations, createDonation } from '../controllers/donation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- General Administrative / Hospital Donation Routes ---
router.get('/', authenticate, authorize('Admin', 'Hospital'), getAllDonations);
router.post('/', authenticate, authorize('Admin', 'Hospital'), createDonation);

// --- Hospital Donation Routes ---
router.get('/hospital', authenticate, authorize('Hospital'), getHospitalDonations);
router.patch('/:id/pipeline-status', authenticate, authorize('Hospital'), updatePipelineStatus);

export default router;
