import { Router } from 'express';
import { getHospitalDonations, updatePipelineStatus } from '../controllers/donation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- Hospital Donation Routes ---
router.get('/hospital', authenticate, authorize('Hospital'), getHospitalDonations);
router.patch('/:id/pipeline-status', authenticate, authorize('Hospital'), updatePipelineStatus);

export default router;
