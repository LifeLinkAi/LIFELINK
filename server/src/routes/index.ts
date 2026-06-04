import { Router } from 'express';
import healthRouter  from './health.routes';
import authRouter    from './auth.routes';
import donorRouter   from './donor.routes';
import requestRouter from './request.routes';
import historyRouter from './history.routes';

const router = Router();

// ── Core ──────────────────────────────────────────────────────────────────
router.use('/health',  healthRouter);   // GET  /api/health
router.use('/auth',    authRouter);     // POST /api/auth/login|register|logout

// ── Donor CRUD ────────────────────────────────────────────────────────────
router.use('/donor/profile', donorRouter);   // CRUD /api/donor/profile
router.use('/requests',      requestRouter); // CRUD /api/requests
router.use('/history',       historyRouter); // CRUD /api/history

export default router;
