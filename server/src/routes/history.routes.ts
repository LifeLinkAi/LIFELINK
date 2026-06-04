import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getMyHistory,
  getHistoryById,
  createHistory,
  updateHistory,
  deleteHistory,
  getStats,
} from '../controllers/history.controller';

const router = Router();

// All history routes require auth + Donor role
router.use(authenticate as any, authorize('Donor') as any);

router.get('/stats', getStats      as any);   // GET    /api/history/stats
router.get('/',      getMyHistory  as any);   // GET    /api/history
router.get('/:id',   getHistoryById as any);  // GET    /api/history/:id
router.post('/',     createHistory as any);   // POST   /api/history
router.put('/:id',   updateHistory as any);   // PUT    /api/history/:id
router.delete('/:id', deleteHistory as any);  // DELETE /api/history/:id

export default router;
