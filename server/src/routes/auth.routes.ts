import { Router } from 'express';
import { register, login, me, logout, getInviteDetails, completeSetup, googleAuth, getUsers } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticate as any, me as any);
router.post('/logout', logout);
router.get('/invite-details', getInviteDetails);
router.post('/complete-setup', completeSetup);
router.get('/users', authenticate as any, authorize('Admin') as any, getUsers as any);

export default router;
