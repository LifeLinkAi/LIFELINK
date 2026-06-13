import { Router } from 'express';
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  registerForCampaign,
  cancelCampaignRegistration,
  getMyRegistrations,
  getCampaignRegistrationDetail,
  getCampaignRegistrations,
  verifyDonation
} from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Retrieve campaigns can be authenticated, write actions require Admin role
router.get('/', authenticate, getCampaigns);
router.post('/', authenticate, authorize('Admin'), createCampaign);
router.put('/:id', authenticate, authorize('Admin'), updateCampaign);
router.delete('/:id', authenticate, authorize('Admin'), deleteCampaign);

// Donor registration routes
router.get('/my-registrations', authenticate, getMyRegistrations);
router.post('/:id/register', authenticate, registerForCampaign);
router.post('/:id/cancel', authenticate, cancelCampaignRegistration);

// Admin/Hospital verification and checking routes
router.get('/registration/:regId', authenticate, authorize('Admin', 'Hospital'), getCampaignRegistrationDetail);
router.get('/:id/registrations', authenticate, authorize('Admin', 'Hospital'), getCampaignRegistrations);
router.put('/registration/:regId/verify', authenticate, authorize('Admin', 'Hospital'), verifyDonation);

export default router;
