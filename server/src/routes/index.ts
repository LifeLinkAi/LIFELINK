import { Router } from 'express';
import healthRouter from './health.routes';

const router = Router();

// Mount all API endpoints
router.use('/health', healthRouter);

export default router;
