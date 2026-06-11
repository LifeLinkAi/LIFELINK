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

// Routes require authentication
router.get('/me', authenticate, getMeProfile);
router.put('/setup-complete', authenticate, completeDonorSetup);

// mutate actions require Admin role
router.get('/', authenticate, getDonors);
router.post('/', authenticate, authorize('Admin'), createDonor);
router.post('/bulk', authenticate, authorize('Admin'), createDonorBulk);
router.post('/bulk-invite', authenticate, authorize('Admin'), bulkInviteDonors);
router.put('/:id', authenticate, authorize('Admin'), updateDonor);
router.delete('/:id', authenticate, authorize('Admin'), deleteDonor);

// Donor certificate upload & date extraction
router.post('/upload-certificate', authenticate, certUpload.single('certificate'), uploadCertificate);

export default router;
