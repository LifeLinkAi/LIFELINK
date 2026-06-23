import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  updateDonorOrganProfile,
  getDonorOrganMatches,
  expressOrganInterest,
  getActiveOrganRequest,
} from '../controllers/donorOrgan.controller';

const router = Router();

router.post('/profile', authenticate, updateDonorOrganProfile);
router.get('/matches', authenticate, getDonorOrganMatches);
router.post('/express-interest', authenticate, expressOrganInterest);
router.get('/active-request', authenticate, getActiveOrganRequest);

export default router;
