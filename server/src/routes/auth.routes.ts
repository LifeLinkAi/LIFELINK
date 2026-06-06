import { Router } from 'express';
import { register, login, me, logout, getInviteDetails, completeSetup } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate as any, me as any);
router.post('/logout', logout);
router.get('/invite-details', getInviteDetails);
router.post('/complete-setup', completeSetup);

export default router;
