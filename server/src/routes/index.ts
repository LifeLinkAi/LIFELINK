import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import campaignRouter from './campaign.routes';
import donorRouter from './donor.routes';
import hospitalRouter from './hospital.routes';
import requestRouter from './request.routes';

const router = Router();

// Mount all API endpoints
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/campaigns', campaignRouter);
router.use('/donors', donorRouter);
router.use('/hospitals', hospitalRouter);
router.use('/requests', requestRouter);

export default router;
