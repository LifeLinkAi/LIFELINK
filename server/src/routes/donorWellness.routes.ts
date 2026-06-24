import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { logWellnessMetric, getWellnessLogs } from '../controllers/donorWellness.controller';

const router = Router();

router.post('/log', authenticate, logWellnessMetric);
router.get('/logs', authenticate, getWellnessLogs);

export default router;
