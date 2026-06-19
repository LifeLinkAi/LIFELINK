import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { OrganWaitlist } from '../models/OrganWaitlist';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { logger } from '../utils/logger';

// ==========================================
// CLOUDINARY SIGNATURE
// ==========================================

/**
 * GET /api/organ-waitlist/upload-signature
 * Generates a short-lived signed upload preset so the browser
 * can push directly to Cloudinary without exposing the API secret.
 */
export const getUploadSignature = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!isCloudinaryConfigured()) {
      return next(new ApiError(503, 'Cloudinary is not configured on this server.'));
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'organ_certificates';

    const paramsToSign = { folder, timestamp };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string,
    );

    res.status(200).json({
      success:   true,
      data: {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey:    process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (error: any) {
    logger.error(`[getUploadSignature] ${error.message}`);
    next(new ApiError(500, 'Failed to generate upload signature.'));
  }
};

// ==========================================
// CREATE WAITLIST PATIENT
// ==========================================

/**
 * POST /api/organ-waitlist
 * Saves a new organ waitlist patient. hospitalId is derived from the
 * authenticated JWT — the client never sends it.
 */
export const createWaitlistPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const {
      fullName,
      age,
      gender,
      contact,
      requiredOrgan,
      bloodGroup,
      urgency,
      medicalCertificateUrl,
      medicalHistory,
      comorbidities,
    } = req.body;

    // Basic required-field guard (Zod handles it on the client, double-check on server)
    if (!fullName || !age || !gender || !contact || !requiredOrgan || !bloodGroup || !medicalCertificateUrl) {
      return next(new ApiError(400, 'Missing required fields.'));
    }

    const patient = await OrganWaitlist.create({
      hospitalId:            new Types.ObjectId(req.user.id),
      fullName:              fullName.trim(),
      age:                   Number(age),
      gender,
      contact:               contact.trim(),
      requiredOrgan,
      bloodGroup,
      urgency:               urgency ?? 'Medium',
      medicalCertificateUrl: medicalCertificateUrl.trim(),
      medicalHistory:        medicalHistory?.trim() ?? '',
      comorbidities:         comorbidities?.trim() ?? '',
      status:                'Waitlisted',
    });

    logger.info(`[createWaitlistPatient] Patient ${patient._id} registered by hospital ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    logger.error(`[createWaitlistPatient] ${error.message}`);
    next(error);
  }
};

// ==========================================
// GET WAITLIST (scoped to this hospital)
// ==========================================

/**
 * GET /api/organ-waitlist
 * Returns all waitlisted patients registered by the logged-in hospital.
 * Supports ?status= and ?organ= query filters.
 */
export const getWaitlistPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const filter: Record<string, unknown> = {
      hospitalId: new Types.ObjectId(req.user.id),
    };

    // Optional query filters
    if (req.query.status) filter.status        = req.query.status;
    if (req.query.organ)  filter.requiredOrgan = req.query.organ;

    const patients = await OrganWaitlist.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const mapped = patients.map(p => ({
      id: p._id.toString(),
      ...p,
    }));

    res.status(200).json({
      success: true,
      count:   mapped.length,
      data:    mapped,
    });
  } catch (error: any) {
    logger.error(`[getWaitlistPatients] ${error.message}`);
    next(error);
  }
};

// ==========================================
// UPDATE STATUS (optional convenience route)
// ==========================================

/**
 * PATCH /api/organ-waitlist/:id/status
 */
export const updateWaitlistStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Waitlisted', 'Match Found', 'Surgery Scheduled', 'Completed', 'Withdrawn'];
    if (!allowed.includes(status)) {
      return next(new ApiError(400, 'Invalid status value.'));
    }

    const patient = await OrganWaitlist.findOneAndUpdate(
      { _id: id, hospitalId: new Types.ObjectId(req.user.id) },
      { $set: { status } },
      { new: true },
    );

    if (!patient) {
      return next(new ApiError(404, 'Patient not found or not owned by this hospital.'));
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error: any) {
    logger.error(`[updateWaitlistStatus] ${error.message}`);
    next(error);
  }
};
