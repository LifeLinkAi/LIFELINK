import { Router } from 'express';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Retrieve campaigns can be authenticated, write actions require Admin role
router.get('/', authenticate, getCampaigns);
router.post('/', authenticate, authorize('Admin'), createCampaign);
router.put('/:id', authenticate, authorize('Admin'), updateCampaign);
router.delete('/:id', authenticate, authorize('Admin'), deleteCampaign);

export default router;
