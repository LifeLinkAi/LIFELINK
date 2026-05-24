import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';

const router = Router();

// Mount all API endpoints
router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
