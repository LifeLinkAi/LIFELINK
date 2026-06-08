import { Router } from 'express';
import { 
  getHospitals, 
  createHospital, 
  createHospitalBulk, 
  updateHospital, 
  deleteHospital,
  getMeHospitalProfile,
  completeHospitalSetup,
  getHospitalDashboardData, // Added
  updateBloodInventory      // Added
} from '../controllers/hospital.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// --- Hospital Role Routes ---
router.get('/me', authenticate, getMeHospitalProfile);
router.put('/setup-complete', authenticate, completeHospitalSetup);
router.get('/dashboard', authenticate, authorize('Hospital'), getHospitalDashboardData); // New
router.put('/inventory', authenticate, authorize('Hospital'), updateBloodInventory);      // New

// --- Admin Role Routes ---
router.get('/', authenticate, getHospitals);
router.post('/', authenticate, authorize('Admin'), createHospital);
router.post('/bulk', authenticate, authorize('Admin'), createHospitalBulk);
router.put('/:id', authenticate, authorize('Admin'), updateHospital);
router.delete('/:id', authenticate, authorize('Admin'), deleteHospital);

export default router;