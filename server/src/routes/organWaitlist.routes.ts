import { Router } from 'express';
import {
  getUploadSignature,
  createWaitlistPatient,
  getWaitlistPatients,
  updateWaitlistStatus,
  getPendingOrganMatches,
  evaluateOrganMatch,
  getClinicalTestingMatches,
  submitClinicalEvaluation,
} from '../controllers/organWaitlist.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All routes require an authenticated Hospital user
router.use(authenticate, authorize('Hospital'));

// Cloudinary signed-upload credentials (GET before file select)
router.get('/upload-signature', getUploadSignature);

// Incoming donor match review panel
router.get('/matches',                          getPendingOrganMatches);
router.patch('/matches/:requestId/evaluate',    evaluateOrganMatch);

// Clinical Evaluation Workbench
router.get('/matches/clinical-testing',         getClinicalTestingMatches);
router.post('/matches/:requestId/evaluation',   submitClinicalEvaluation);

// Waitlist CRUD
router.post('/',                  createWaitlistPatient);
router.get('/',                   getWaitlistPatients);
router.patch('/:id/status',       updateWaitlistStatus);

export default router;

