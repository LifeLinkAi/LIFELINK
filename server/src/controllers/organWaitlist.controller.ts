import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { OrganWaitlist } from '../models/OrganWaitlist';
import { Request as DonationRequest } from '../models/Request';
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

// ==========================================
// GET PENDING ORGAN MATCHES (Hospital Review Panel)
// ==========================================

/**
 * GET /api/organ-waitlist/matches
 * Returns all Request documents where:
 *   - hospitalId = current hospital user
 *   - type = 'Organ'
 *   - status = 'PENDING_HOSPITAL'
 * Populates the linked OrganWaitlist patient and DonorProfile.
 */
export const getPendingOrganMatches = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const matches = await DonationRequest.find({
      hospitalId: new Types.ObjectId(req.user.id),
      type: 'Organ',
      status: 'PENDING_HOSPITAL',
    })
      .populate({
        path: 'waitlistId',
        model: 'OrganWaitlist',
        select: 'fullName age gender contact requiredOrgan bloodGroup urgency medicalCertificateUrl medicalHistory comorbidities status',
      })
      .populate({
        path: 'acceptedDonorId',
        model: 'DonorProfile',
        select: 'bloodType organsWillingToDonate status tier details',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email',
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const mapped = matches.map((m: any) => ({
      id: m._id.toString(),
      status: m.status,
      timeline: m.timeline ?? [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      // Patient (from OrganWaitlist)
      patient: m.waitlistId
        ? {
            id: m.waitlistId._id?.toString(),
            fullName: m.waitlistId.fullName,
            age: m.waitlistId.age,
            gender: m.waitlistId.gender,
            contact: m.waitlistId.contact,
            requiredOrgan: m.waitlistId.requiredOrgan,
            bloodGroup: m.waitlistId.bloodGroup,
            urgency: m.waitlistId.urgency,
            medicalCertificateUrl: m.waitlistId.medicalCertificateUrl,
            medicalHistory: m.waitlistId.medicalHistory,
            comorbidities: m.waitlistId.comorbidities,
          }
        : null,
      // Donor (from DonorProfile + User)
      donor: m.acceptedDonorId
        ? {
            id: m.acceptedDonorId._id?.toString(),
            name: (m.acceptedDonorId.userId as any)?.name ?? 'Unknown Donor',
            email: (m.acceptedDonorId.userId as any)?.email ?? null,
            bloodType: m.acceptedDonorId.bloodType,
            organsWillingToDonate: m.acceptedDonorId.organsWillingToDonate,
            status: m.acceptedDonorId.status,
            tier: m.acceptedDonorId.tier,
            details: m.acceptedDonorId.details,
          }
        : null,
    }));

    logger.info(`[getPendingOrganMatches] ${mapped.length} matches found for hospital ${req.user.id}`);

    res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error: any) {
    logger.error(`[getPendingOrganMatches] ${error.message}`);
    next(error);
  }
};

// ==========================================
// EVALUATE ORGAN MATCH (Approve / Decline)
// ==========================================

/**
 * PATCH /api/organ-waitlist/matches/:requestId/evaluate
 * Body: { action: 'APPROVE_FOR_TESTING' | 'DECLINE' }
 *
 * - APPROVE_FOR_TESTING → status = 'CLINICAL_TESTING', push timeline event, update OrganWaitlist to 'Match Found'
 * - DECLINE             → status = 'PENDING_DONOR' (re-opens for another donor), push timeline event
 */
export const evaluateOrganMatch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const { requestId } = req.params;
    const { action } = req.body as { action?: 'APPROVE_FOR_TESTING' | 'DECLINE' };

    if (!action || !['APPROVE_FOR_TESTING', 'DECLINE'].includes(action)) {
      return next(new ApiError(400, "action must be 'APPROVE_FOR_TESTING' or 'DECLINE'."));
    }

    const requestDoc = await DonationRequest.findOne({
      _id: new Types.ObjectId(requestId),
      hospitalId: new Types.ObjectId(req.user.id),
      type: 'Organ',
      status: 'PENDING_HOSPITAL',
    });

    if (!requestDoc) {
      return next(new ApiError(404, 'Match not found, already evaluated, or not owned by this hospital.'));
    }

    const now = new Date();

    if (action === 'APPROVE_FOR_TESTING') {
      requestDoc.status = 'CLINICAL_TESTING';
      if (!requestDoc.timeline) requestDoc.timeline = [];
      requestDoc.timeline.push({ event: 'hospital_approved_testing', timestamp: now });

      // Also promote the OrganWaitlist patient to 'Match Found'
      if (requestDoc.waitlistId) {
        await OrganWaitlist.findByIdAndUpdate(requestDoc.waitlistId, {
          $set: { status: 'Match Found' },
        });
      }
    } else {
      // DECLINE — free the slot so another donor can express interest
      requestDoc.status = 'PENDING_DONOR';
      requestDoc.acceptedDonorId = null as any;
      requestDoc.targetDonorId   = null as any;
      if (!requestDoc.timeline) requestDoc.timeline = [];
      requestDoc.timeline.push({ event: 'hospital_declined_match', timestamp: now });
    }

    // Sanitize location: unset it if coordinates are missing/malformed to avoid
    // MongoServerError: "Can't extract geo keys" from the 2dsphere index.
    if (requestDoc.location != null) {
      const coords = (requestDoc.location as any).coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        requestDoc.location = undefined as any;
      }
    }

    await requestDoc.save();

    logger.info(`[evaluateOrganMatch] Request ${requestId} → ${action} by hospital ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: action === 'APPROVE_FOR_TESTING'
        ? 'Donor approved for clinical evaluation.'
        : 'Match declined. The request is open for another donor.',
    });
  } catch (error: any) {
    logger.error(`[evaluateOrganMatch] ${error.message}`);
    next(error);
  }
};

// ==========================================
// GET CLINICAL TESTING MATCHES
// ==========================================

export const getClinicalTestingMatches = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const matches = await DonationRequest.find({
      hospitalId: new Types.ObjectId(req.user.id),
      type: 'Organ',
      status: 'CLINICAL_TESTING',
    })
      .populate({
        path: 'waitlistId',
        model: 'OrganWaitlist',
        select: 'fullName age gender contact requiredOrgan bloodGroup urgency medicalCertificateUrl medicalHistory comorbidities status',
      })
      .populate({
        path: 'acceptedDonorId',
        model: 'DonorProfile',
        select: 'bloodType organsWillingToDonate status tier details',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email',
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const mapped = matches.map((m: any) => ({
      id: m._id.toString(),
      status: m.status,
      timeline: m.timeline ?? [],
      clinicalEvaluation: m.clinicalEvaluation ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      // Patient (from OrganWaitlist)
      patient: m.waitlistId
        ? {
            id: m.waitlistId._id?.toString(),
            fullName: m.waitlistId.fullName,
            age: m.waitlistId.age,
            gender: m.waitlistId.gender,
            contact: m.waitlistId.contact,
            requiredOrgan: m.waitlistId.requiredOrgan,
            bloodGroup: m.waitlistId.bloodGroup,
            urgency: m.waitlistId.urgency,
            medicalCertificateUrl: m.waitlistId.medicalCertificateUrl,
            medicalHistory: m.waitlistId.medicalHistory,
            comorbidities: m.waitlistId.comorbidities,
          }
        : null,
      // Donor (from DonorProfile + User)
      donor: m.acceptedDonorId
        ? {
            id: m.acceptedDonorId._id?.toString(),
            name: (m.acceptedDonorId.userId as any)?.name ?? 'Unknown Donor',
            email: (m.acceptedDonorId.userId as any)?.email ?? null,
            bloodType: m.acceptedDonorId.bloodType,
            organsWillingToDonate: m.acceptedDonorId.organsWillingToDonate,
            status: m.acceptedDonorId.status,
            tier: m.acceptedDonorId.tier,
            details: m.acceptedDonorId.details,
          }
        : null,
    }));

    logger.info(`[getClinicalTestingMatches] ${mapped.length} matches found for hospital ${req.user.id}`);

    res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error: any) {
    logger.error(`[getClinicalTestingMatches] ${error.message}`);
    next(error);
  }
};

// ==========================================
// SUBMIT CLINICAL EVALUATION
// ==========================================

export const submitClinicalEvaluation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const { requestId } = req.params;
    const {
      bloodCrossmatch,
      hlaMatchScore,
      serologyClear,
      notes,
      labReportUrl,
      decision,
    } = req.body;

    if (!decision || !['APPROVE_SURGERY', 'FAIL_CLINICAL_MATCH'].includes(decision)) {
      return next(new ApiError(400, "Decision must be 'APPROVE_SURGERY' or 'FAIL_CLINICAL_MATCH'."));
    }

    if (decision === 'APPROVE_SURGERY') {
      if (bloodCrossmatch !== 'COMPATIBLE_NEGATIVE' || serologyClear !== true) {
        return next(new ApiError(400, 'Cannot approve surgery: strict clinical validation failed (must be COMPATIBLE_NEGATIVE and serologyClear must be true).'));
      }
    }

    const requestDoc = await DonationRequest.findOne({
      _id: new Types.ObjectId(requestId),
      hospitalId: new Types.ObjectId(req.user.id),
      type: 'Organ',
      status: 'CLINICAL_TESTING',
    });

    if (!requestDoc) {
      return next(new ApiError(404, 'Match not found, not in testing, or not owned by this hospital.'));
    }

    const now = new Date();

    // Save evaluation block
    requestDoc.clinicalEvaluation = {
      bloodCrossmatch: bloodCrossmatch ?? 'PENDING',
      hlaMatchScore: Number(hlaMatchScore) || 0,
      serologyClear: Boolean(serologyClear),
      notes: notes ?? '',
      labReportUrl: labReportUrl ?? '',
      evaluatedAt: now,
      evaluatedBy: new Types.ObjectId(req.user.id) as any,
    };

    if (!requestDoc.timeline) requestDoc.timeline = [];

    if (decision === 'APPROVE_SURGERY') {
      requestDoc.status = 'TRANSPLANT_SCHEDULED';
      requestDoc.timeline.push({ event: 'clinical_evaluation_passed', timestamp: now });

      if (requestDoc.waitlistId) {
        await OrganWaitlist.findByIdAndUpdate(requestDoc.waitlistId, {
          $set: { status: 'Transplant Scheduled' },
        });
      }
    } else if (decision === 'FAIL_CLINICAL_MATCH') {
      const acceptedIdStr = requestDoc.acceptedDonorId?.toString();
      if (acceptedIdStr && requestDoc.matchedDonors) {
        const matchedEntry = requestDoc.matchedDonors.find(m => m.donorId.toString() === acceptedIdStr);
        if (matchedEntry) {
          matchedEntry.status = 'DECLINED';
        }
      }

      requestDoc.status = 'PENDING_DONOR';
      requestDoc.acceptedDonorId = null as any;
      requestDoc.targetDonorId = null as any;
      requestDoc.timeline.push({ event: 'clinical_evaluation_failed', timestamp: now });

      if (requestDoc.waitlistId) {
        await OrganWaitlist.findByIdAndUpdate(requestDoc.waitlistId, {
          $set: { status: 'Searching' },
        });
      }
    }

    // Sanitize location: unset it if coordinates are missing/malformed to avoid
    // MongoServerError: "Can't extract geo keys" from the 2dsphere index.
    if (requestDoc.location != null) {
      const coords = (requestDoc.location as any).coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        requestDoc.location = undefined as any;
      }
    }

    await requestDoc.save();

    logger.info(`[submitClinicalEvaluation] Request ${requestId} → ${decision} by hospital ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: decision === 'APPROVE_SURGERY'
        ? 'Clinical testing passed. Transplant scheduled.'
        : 'Clinical testing failed. Match rejected and slot reopened.',
    });
  } catch (error: any) {
    logger.error(`[submitClinicalEvaluation] ${error.message}`);
    next(error);
  }
};
