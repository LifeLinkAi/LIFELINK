import { Router } from 'express';

import { getPatientProfile } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, authorize('Patient'), getPatientProfile);

export default router;
