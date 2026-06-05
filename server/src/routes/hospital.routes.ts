import { Router } from 'express';
import { getHospitals, createHospital, createHospitalBulk, updateHospital, deleteHospital } from '../controllers/hospital.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Routes require authentication; mutate actions require Admin role
router.get('/', authenticate, getHospitals);
router.post('/', authenticate, authorize('Admin'), createHospital);
router.post('/bulk', authenticate, authorize('Admin'), createHospitalBulk);
router.put('/:id', authenticate, authorize('Admin'), updateHospital);
router.delete('/:id', authenticate, authorize('Admin'), deleteHospital);

export default router;
