import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../middlewares/error.middleware';
import { DonorProfile } from '../models/DonorProfile';
import { OrganWaitlist } from '../models/OrganWaitlist';
import { Request as DonationRequest } from '../models/Request';
import { User } from '../models/User';
import { HospitalProfile } from '../models/HospitalProfile';
import { notify } from '../services/notifications/notify.service';
import { sendHospitalLegalReviewNotification } from '../services/notifications/email.service';
import { logger } from '../utils/logger';
import { calculateMatchScore } from '../utils/organScoring';

/**
 * @desc    Upsert donor organ profile (Intake)
 * @route   POST /api/donor/organ/profile
 * @access  Private (Donor)
 */
export const updateDonorOrganProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const { organSelection, bloodGroup, healthChecklist, medicalCertificateUrl } = req.body;

    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (profile) {
      const completedRequests = await DonationRequest.find({
        acceptedDonorId: profile._id,
        status: 'TRANSPLANT_SUCCESSFUL',
        type: 'Organ'
      });

      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      const recentlyCompleted = completedRequests.find(r => {
        const completionDate = r.surgicalOutcome?.surgeryCompletedAt || r.updatedAt;
        return completionDate > twoYearsAgo;
      });

      if (recentlyCompleted) {
        const completionDate = recentlyCompleted.surgicalOutcome?.surgeryCompletedAt || recentlyCompleted.updatedAt;
        const cooldownEnd = new Date(completionDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
        const remainingDays = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        return next(new ApiError(400, `You are in a 2-year cooldown period after your last donation. Remaining days: ${remainingDays}.`));
      }

      const donatedOrgans = completedRequests.map(r => r.organType);
      if (organSelection && donatedOrgans.includes(organSelection)) {
        return next(new ApiError(400, `You have already donated a ${organSelection} and cannot donate the same organ type again.`));
      }
    }

    const detailsObj = {
      healthChecklist,
      medicalCertificateUrl
    };

    const updatedProfile = await DonorProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(req.user.id) },
      {
        $set: {
          organsWillingToDonate: organSelection ? [organSelection] : [],
          bloodType: bloodGroup,
          details: JSON.stringify(detailsObj),
          status: 'Available',
          isSetupComplete: true,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Organ donor profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to update donor organ profile: ${error.message}`));
  }
};

/**
 * @desc    Get waitlist matches for donor's profile
 * @route   GET /api/donor/organ/matches
 * @access  Private (Donor)
 */
const getCompatiblePatientBloodGroups = (donorBloodType: string): string[] => {
  const d = donorBloodType.toUpperCase().trim();
  if (d === 'O-') return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  if (d === 'O+') return ['O+', 'A+', 'B+', 'AB+'];
  if (d === 'A-') return ['A-', 'A+', 'AB-', 'AB+'];
  if (d === 'A+') return ['A+', 'AB+'];
  if (d === 'B-') return ['B-', 'B+', 'AB-', 'AB+'];
  if (d === 'B+') return ['B+', 'AB+'];
  if (d === 'AB-') return ['AB-', 'AB+'];
  if (d === 'AB+') return ['AB+'];
  return [donorBloodType];
};

export const getDonorOrganMatches = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (!profile || !profile.organsWillingToDonate || profile.organsWillingToDonate.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // Include "Liver Segment" if donor is willing to donate "Liver"
    const organs = [...profile.organsWillingToDonate];
    if (organs.includes('Liver') && !organs.includes('Liver Segment')) {
      organs.push('Liver Segment');
    }

    const waitlist = await OrganWaitlist.find({
      requiredOrgan: { $in: organs },
      bloodGroup: { $in: getCompatiblePatientBloodGroups(profile.bloodType) },
      status: { $in: ['Waitlisted', 'Searching'] }
    }).populate('hospitalId', 'name address').lean();

    // Fetch hospital locations for distance calculation (Heart/Lung)
    const hospitalUserIds = [...new Set(waitlist.map((w: any) => w.hospitalId?._id?.toString()).filter(Boolean))];
    const hospitalProfiles = await HospitalProfile.find({ userId: { $in: hospitalUserIds } }).lean();
    const hospitalLocationMap = new Map();
    for (const hp of hospitalProfiles) {
      if (hp.location?.coordinates) {
        hospitalLocationMap.set(hp.userId.toString(), hp.location.coordinates);
      }
    }

    // Apply Strategy Pattern scoring
    const scoredWaitlist = waitlist.map((patient: any) => {
      const hospitalIdStr = patient.hospitalId?._id?.toString();
      const patientLocation = hospitalLocationMap.get(hospitalIdStr);
      const matchScore = calculateMatchScore(patient, profile, patientLocation);
      return { ...patient, matchScore };
    });

    // Sort descending by matchScore
    scoredWaitlist.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      data: scoredWaitlist,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to fetch organ matches: ${error.message}`));
  }
};

/**
 * @desc    Express direct interest in a waitlist patient
 * @route   POST /api/donor/organ/express-interest
 * @access  Private (Donor)
 */
export const expressOrganInterest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const { waitlistId, hospitalId } = req.body;
    if (!waitlistId || !hospitalId) {
      return next(new ApiError(400, 'waitlistId and hospitalId are required.'));
    }

    const user = await User.findById(req.user.id);
    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    
    if (!profile || !user) {
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    // Cooldown check
    const completedRequests = await DonationRequest.find({
      acceptedDonorId: profile._id,
      status: 'TRANSPLANT_SUCCESSFUL',
      type: 'Organ'
    });

    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = completedRequests.find(r => {
      const completionDate = r.surgicalOutcome?.surgeryCompletedAt || r.updatedAt;
      return completionDate > twoYearsAgo;
    });

    if (recentlyCompleted) {
      return next(new ApiError(400, 'You are in a 2-year cooldown period following your last organ donation.'));
    }

    const existing = await DonationRequest.findOne({
      acceptedDonorId: profile._id,
      waitlistId: new Types.ObjectId(waitlistId),
      type: 'Organ'
    });

    if (existing) {
      return next(new ApiError(400, 'You have already expressed interest for this patient.'));
    }

    const hospProfile = await HospitalProfile.findOne({ userId: new Types.ObjectId(hospitalId) });

    const requestDoc = new DonationRequest({
      hospitalId: new Types.ObjectId(hospitalId),
      type: 'Organ',
      status: 'PENDING_HOSPITAL',
      patientName: 'Confidential Patient',
      patientAge: 0,
      patientGender: 'Unknown',
      bloodType: profile.bloodType,
      bloodGroup: profile.bloodType,
      organType: profile.organsWillingToDonate[0] || 'Unknown',
      urgency: 'Medium',
      acceptedDonorId: profile._id,
      waitlistId: new Types.ObjectId(waitlistId),
      donorName: user.name,
      donorEmail: user.email,
      donorBloodType: profile.bloodType,
      requestedBy: new Types.ObjectId(req.user.id),
      registeredDate: new Date(),
      timeline: [
        { event: 'donor_expressed_interest', timestamp: new Date() }
      ],
      location: {
        type: 'Point',
        coordinates: hospProfile?.location?.coordinates || [0, 0]
      },
      distanceKm: Math.floor(Math.random() * 50) + 1
    });

    await requestDoc.save();

    await notify({
      recipientId: hospitalId.toString(),
      recipientRole: 'Hospital',
      type: 'organ_interest_received',
      title: 'New Organ Donor Interest',
      message: `${user.name} has expressed interest in donating a ${requestDoc.organType}.`,
      priority: 'high',
      actionUrl: `/hospital/organ-management`,
      metadata: { requestId: requestDoc._id, waitlistId }
    });

    res.status(201).json({
      success: true,
      message: 'Interest sent successfully.',
      data: requestDoc,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to express organ interest: ${error.message}`));
  }
};

/**
 * @desc    Get donor's active organ request (for Telemetry Tracker)
 * @route   GET /api/donor/organ/active-request
 * @access  Private (Donor)
 */
export const getActiveOrganRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (!profile) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const requestDoc = await DonationRequest.findOne({
      acceptedDonorId: profile._id,
      type: 'Organ',
      // Only return genuinely active records — exclude declined and completed
      status: { $in: ['PENDING_HOSPITAL', 'CLINICAL_TESTING', 'PENDING_LEGAL_APPROVAL', 'TRANSPLANT_SCHEDULED', 'SURGERY_IN_PROGRESS'] },
    }).sort({ createdAt: -1 }).populate({
      path: 'hospitalId',
      select: 'name email phone address'
    }).populate({
      path: 'waitlistId',
      select: 'requiredOrgan fullName bloodGroup urgency status medicalCertificateUrl'
    }).lean() as any;

    if (requestDoc && requestDoc.hospitalId) {
      const hospProfile = await HospitalProfile.findOne({ userId: requestDoc.hospitalId._id });
      if (hospProfile) {
        requestDoc.hospitalId.phone = hospProfile.phone || hospProfile.contactPerson?.phone || '';
        requestDoc.hospitalId.address = hospProfile.location || hospProfile.city || '';
      }
    }

    const completedRequests = await DonationRequest.find({
      acceptedDonorId: profile._id,
      status: 'TRANSPLANT_SUCCESSFUL',
      type: 'Organ'
    }).populate({
      path: 'hospitalId',
      select: 'name email phone address'
    }).populate({
      path: 'waitlistId',
      select: 'requiredOrgan fullName bloodGroup urgency status medicalCertificateUrl'
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: requestDoc,
      pastDonations: completedRequests,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to fetch active request: ${error.message}`));
  }
};

/**
 * @desc    Sign active request legal consent deed
 * @route   POST /api/donor/organ/active-request/sign-legal
 * @access  Private (Donor)
 */
export const signActiveRequestLegal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const { signatureName, signatureData } = req.body;
    if (!signatureName || !signatureData) {
      return next(new ApiError(400, 'signatureName and signatureData are required.'));
    }

    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (!profile) {
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    // Find the latest active Organ request for this donor
    const requestDoc = await DonationRequest.findOne({
      acceptedDonorId: profile._id,
      type: 'Organ'
    }).sort({ createdAt: -1 });

    if (!requestDoc) {
      return next(new ApiError(404, 'No active request found.'));
    }

    if (requestDoc.status !== 'PENDING_LEGAL_APPROVAL') {
      return next(new ApiError(400, 'Request is not in PENDING_LEGAL_APPROVAL state.'));
    }

    // Update the legal agreement fields for the donor
    requestDoc.legalAgreement = {
      donorSigned: true,
      donorSignatureName: signatureName,
      donorSignatureDate: new Date(),
      donorSignatureData: signatureData,
      recipientSigned: requestDoc.legalAgreement?.recipientSigned || false,
      recipientSignatureName: requestDoc.legalAgreement?.recipientSignatureName,
      recipientSignatureDate: requestDoc.legalAgreement?.recipientSignatureDate,
      recipientSignatureData: requestDoc.legalAgreement?.recipientSignatureData,
      hospitalSigned: requestDoc.legalAgreement?.hospitalSigned || false,
      hospitalSignatureName: requestDoc.legalAgreement?.hospitalSignatureName,
      hospitalSignedAt: requestDoc.legalAgreement?.hospitalSignedAt,
      ethicsCommitteeCleared: requestDoc.legalAgreement?.ethicsCommitteeCleared || false,
      ethicsCommitteeClearedAt: requestDoc.legalAgreement?.ethicsCommitteeClearedAt,
    };

    // Push event to timeline
    requestDoc.timeline = requestDoc.timeline || [];
    requestDoc.timeline.push({
      event: 'donor_signed_legal_agreement',
      timestamp: new Date()
    });

    // Sanitize location to avoid MongoServerError on save due to 2dsphere index
    if (requestDoc.location != null) {
      const coords = (requestDoc.location as any).coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        requestDoc.location = undefined as any;
      }
    }

    await requestDoc.save();

    // Trigger hospital representative notification when donor signs the legal deed
    if (requestDoc.hospitalId) {
      try {
        const hospitalUser = await User.findById(requestDoc.hospitalId).select('email name');
        const donorUser = await User.findById(req.user.id).select('name');
        if (hospitalUser && hospitalUser.email && donorUser) {
          await sendHospitalLegalReviewNotification(
            hospitalUser.email,
            hospitalUser.name || 'Hospital Representative',
            donorUser.name || 'Living Donor',
            requestDoc.organType || 'Unknown'
          );
        }
      } catch (mailErr: any) {
        logger.error(`Failed to send donor legal signature notification to hospital: ${mailErr.message}`);
      }

      await notify({
        recipientId: requestDoc.hospitalId.toString(),
        recipientRole: 'Hospital',
        type: 'donor_deed_signed',
        title: 'Donor Legal Consent Signed',
        message: `The donor has successfully signed the legal consent deed. It is now ready for your final clearance.`,
        priority: 'high',
        actionUrl: `/hospital/organ-management`,
        metadata: { requestId: requestDoc._id.toString() }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Legal agreement signed by donor successfully.',
      data: requestDoc,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to sign legal agreement: ${error.message}`));
  }
};
