import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../middlewares/error.middleware';
import { DonorProfile } from '../models/DonorProfile';
import { Request as DonationRequest } from '../models/Request';
import { WellnessLog } from '../models/WellnessLog';
import { User } from '../models/User';
import { sendWellnessLoggedEmail } from '../services/notifications/email.service';

/**
 * @desc    Log post-operative wellness metrics
 * @route   POST /api/donor/wellness/log
 * @access  Private (Donor)
 */
export const logWellnessMetric = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Donor') {
      return next(new ApiError(403, 'Access denied. Donor role required.'));
    }

    const { requestId, organType, loggedAt, metrics, notes, reportUrl, reportName, milestone } = req.body;

    if (!requestId) {
      return next(new ApiError(400, 'requestId is required.'));
    }

    const profile = await DonorProfile.findOne({ userId: new Types.ObjectId(req.user.id) });
    if (!profile) {
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    const requestDoc = await DonationRequest.findOne({
      _id: new Types.ObjectId(requestId),
      acceptedDonorId: profile._id,
      status: 'TRANSPLANT_SUCCESSFUL'
    });

    if (!requestDoc) {
      return next(new ApiError(400, 'Invalid request or transplant procedure is not completed.'));
    }

    // Enforce sequential checkup submission
    if (milestone === '6_MONTH') {
      const prev = await WellnessLog.findOne({ donorId: profile._id, requestId: requestDoc._id, milestone: '1_MONTH' });
      if (!prev) {
        return next(new ApiError(400, 'You must log your 1 Month Check-up before logging your 6 Month Check-up.'));
      }
    } else if (milestone === '1_YEAR') {
      const prev = await WellnessLog.findOne({ donorId: profile._id, requestId: requestDoc._id, milestone: '6_MONTH' });
      if (!prev) {
        return next(new ApiError(400, 'You must log your 6 Month Check-up before logging your 1 Year Assessment.'));
      }
    } else if (milestone === '2_YEAR') {
      const prev = await WellnessLog.findOne({ donorId: profile._id, requestId: requestDoc._id, milestone: '1_YEAR' });
      if (!prev) {
        return next(new ApiError(400, 'You must log your 1 Year Assessment before logging your 2 Year Assessment.'));
      }
    }

    const log = new WellnessLog({
      donorId: profile._id,
      requestId: new Types.ObjectId(requestId),
      organType: organType || requestDoc.organType || 'Unknown',
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      metrics: {
        creatinine: metrics?.creatinine ?? null,
        gfr: metrics?.gfr ?? null,
        alt: metrics?.alt ?? null,
        ast: metrics?.ast ?? null,
        bilirubin: metrics?.bilirubin ?? null,
        systolicBP: metrics?.systolicBP ?? null,
        diastolicBP: metrics?.diastolicBP ?? null,
        energyLevel: metrics?.energyLevel ?? null,
      },
      notes: notes || '',
      reportUrl: reportUrl || '',
      reportName: reportName || '',
      milestone: milestone || 'UNSCHEDULED',
      status: 'Logged'
    });

    await log.save();

    // Trigger sequential email notification
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        let milestoneName = milestone ? milestone.replace('_', ' ') : 'Unscheduled Check-up';
        
        // Title case formatting
        if (milestoneName === '1 MONTH') milestoneName = '1 Month Check-up';
        else if (milestoneName === '6 MONTH') milestoneName = '6 Month Check-up';
        else if (milestoneName === '1 YEAR') milestoneName = '1 Year Assessment';
        else if (milestoneName === '2 YEAR') milestoneName = '2 Year Assessment';

        // Calculate next checkup details
        let nextCheckupName = '';
        let nextCheckupDateStr = '';
        const surgeryDate = new Date(requestDoc.surgicalOutcome?.surgeryCompletedAt || requestDoc.updatedAt || requestDoc.createdAt);

        if (milestone === '1_MONTH') {
          nextCheckupName = '6 Month Check-up';
          const d = new Date(surgeryDate.getTime() + 180 * 24 * 60 * 60 * 1000);
          nextCheckupDateStr = d.toLocaleDateString(undefined, { dateStyle: 'long' });
        } else if (milestone === '6_MONTH') {
          nextCheckupName = '1 Year Assessment';
          const d = new Date(surgeryDate.getTime() + 365 * 24 * 60 * 60 * 1000);
          nextCheckupDateStr = d.toLocaleDateString(undefined, { dateStyle: 'long' });
        } else if (milestone === '1_YEAR') {
          nextCheckupName = '2 Year Assessment';
          const d = new Date(surgeryDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
          nextCheckupDateStr = d.toLocaleDateString(undefined, { dateStyle: 'long' });
        }

        await sendWellnessLoggedEmail(
          user.email,
          user.name || 'Donor',
          milestoneName,
          nextCheckupName || undefined,
          nextCheckupDateStr || undefined
        );
      }
    } catch (mailErr: any) {
      console.error('Failed to dispatch wellness log email notification:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Wellness metrics logged successfully.',
      data: log,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to log wellness metrics: ${error.message}`));
  }
};

/**
 * @desc    Get wellness logs for current donor
 * @route   GET /api/donor/wellness/logs
 * @access  Private (Donor)
 */
export const getWellnessLogs = async (
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
      return next(new ApiError(404, 'Donor profile not found.'));
    }

    const logs = await WellnessLog.find({ donorId: profile._id }).sort({ loggedAt: 1 }).lean();

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    next(new ApiError(500, `Failed to retrieve wellness logs: ${error.message}`));
  }
};
