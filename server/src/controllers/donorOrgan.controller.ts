import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../middlewares/error.middleware';
import { DonorProfile } from '../models/DonorProfile';
import { OrganWaitlist } from '../models/OrganWaitlist';
import { Request as DonationRequest } from '../models/Request';
import { User } from '../models/User';
import { HospitalProfile } from '../models/HospitalProfile';

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

    const detailsObj = {
      healthChecklist,
      medicalCertificateUrl
    };

    const profile = await DonorProfile.findOneAndUpdate(
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
      data: profile,
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

    const waitlist = await OrganWaitlist.find({
      requiredOrgan: { $in: profile.organsWillingToDonate },
      bloodGroup: profile.bloodType,
      status: { $in: ['Waitlisted', 'Searching'] }
    }).sort({ urgency: -1, createdAt: 1 }).populate('hospitalId', 'name address').lean();

    res.status(200).json({
      success: true,
      data: waitlist,
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

    const existing = await DonationRequest.findOne({
      acceptedDonorId: profile._id,
      waitlistId: new Types.ObjectId(waitlistId),
      type: 'Organ'
    });

    if (existing) {
      return next(new ApiError(400, 'You have already expressed interest for this patient.'));
    }

    const requestDoc = new DonationRequest({
      hospitalId: new Types.ObjectId(hospitalId),
      type: 'Organ',
      status: 'PENDING_HOSPITAL',
      patientName: 'Confidential Patient',
      patientAge: 0,
      patientGender: 'Unknown',
      bloodType: profile.bloodType,
      organType: profile.organsWillingToDonate[0] || 'Unknown',
      urgency: 'Medium',
      acceptedDonorId: profile._id,
      waitlistId: new Types.ObjectId(waitlistId),
      donorName: user.name,
      donorEmail: user.email,
      donorBloodType: profile.bloodType,
      timeline: [
        { event: 'donor_expressed_interest', timestamp: new Date() }
      ],
      distanceKm: Math.floor(Math.random() * 50) + 1 // mock distance
    });

    await requestDoc.save();

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
      type: 'Organ'
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

    res.status(200).json({
      success: true,
      data: requestDoc,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to fetch active request: ${error.message}`));
  }
};
