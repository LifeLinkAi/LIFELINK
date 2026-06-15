import { Router } from 'express';
import multer from 'multer';
import {
  getDonors,
  createDonor,
  createDonorBulk,
  updateDonor,
  deleteDonor,
  getMeProfile,
  completeDonorSetup,
  uploadCertificate,
  bulkInviteDonors,
} from '../controllers/donor.controller';
import { updateProfile, toggleAvailability } from '../controllers/donorProfile.controller';
import { getDonorRequests, respondToRequest } from '../controllers/donorRequest.controller';
import { getDonorHistory, getDonorHistoryStats } from '../controllers/donorHistory.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Multer: memory storage, PDF only, 10 MB limit
const certUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted.'));
    }
  },
});

const router = Router();

// ── Donor self-service profile ──────────────────────────────────────────────
router.get('/me', authenticate, getMeProfile);
router.put('/setup-complete', authenticate, completeDonorSetup);
router.patch('/me', authenticate, updateProfile);
router.patch('/me/availability', authenticate, toggleAvailability);

// ── Donor request feed & responses ─────────────────────────────────────────
router.get('/requests', authenticate, getDonorRequests);
router.post('/requests/:id/respond', authenticate, respondToRequest);

// ── Donation history ────────────────────────────────────────────────────────
router.get('/history', authenticate, getDonorHistory);
router.get('/history/stats', authenticate, getDonorHistoryStats);

// ── Admin-only donor management ─────────────────────────────────────────────
router.get('/', authenticate, getDonors);
router.post('/', authenticate, authorize('Admin'), createDonor);
router.post('/bulk', authenticate, authorize('Admin'), createDonorBulk);
router.post('/bulk-invite', authenticate, authorize('Admin'), bulkInviteDonors);
router.put('/:id', authenticate, authorize('Admin'), updateDonor);
router.delete('/:id', authenticate, authorize('Admin'), deleteDonor);

// ── Certificate upload & date extraction ────────────────────────────────────
router.post('/upload-certificate', authenticate, certUpload.single('certificate'), uploadCertificate);

export default router;
