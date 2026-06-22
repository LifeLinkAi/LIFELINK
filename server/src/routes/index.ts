import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import campaignRouter from './campaign.routes';
import donorRouter from './donor.routes';
import hospitalRouter from './hospital.routes';
import patientRouter from './patient.routes';
import requestRouter from './request.routes';
import uploadRouter from './upload.routes';
import donationRouter from './donation.routes';
import organWaitlistRouter from './organWaitlist.routes';
import donorOrganRouter from './donorOrgan.routes';

const router = Router();

// Mount all API endpoints
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/campaigns', campaignRouter);
router.use('/donors', donorRouter);
router.use('/hospitals', hospitalRouter);
router.use('/patients', patientRouter);
router.use('/requests', requestRouter);
router.use('/upload', uploadRouter);
router.use('/donations', donationRouter);
router.use('/organ-waitlist', organWaitlistRouter);
router.use('/donor/organ', donorOrganRouter);

export default router;

