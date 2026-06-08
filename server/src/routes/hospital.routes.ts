import { Router } from 'express';
import { 
  getHospitals, 
  createHospital, 
  createHospitalBulk, 
  updateHospital, 
  deleteHospital,
  getMeHospitalProfile,
  completeHospitalSetup
} from '../controllers/hospital.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication
router.get('/me', authenticate, getMeHospitalProfile);
router.put('/setup-complete', authenticate, completeHospitalSetup);

// mutate actions require Admin role
router.get('/', authenticate, getHospitals);
router.post('/', authenticate, authorize('Admin'), createHospital);
router.post('/bulk', authenticate, authorize('Admin'), createHospitalBulk);
router.put('/:id', authenticate, authorize('Admin'), updateHospital);
router.delete('/:id', authenticate, authorize('Admin'), deleteHospital);

export default router;
