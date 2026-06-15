import { Response, NextFunction } from 'express';
import { DonationRecord } from '../models/DonationRecord';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * GET /donors/history
 * Returns donation records for the authenticated donor, newest first.
 */
export const getDonorHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const records = await DonationRecord.find({ donorId: req.user.id })
      .sort({ donationDate: -1 })
      .lean();

    const mapped = records.map((r: any) => ({
      id: r._id.toString(),
      donationType: r.donationType,
      bloodType: r.bloodType,
      facility: r.facility,
      donationDate: r.donationDate,
      status: r.status,
      volumeMl: r.volumeMl,
      notes: r.notes,
      requestId: r.requestId?.toString() ?? null,
      createdAt: r.createdAt,
    }));

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /donors/history/stats
 * Returns aggregated donation statistics for the authenticated donor.
 * - totalDonations: count of completed records
 * - totalVolumeLiters: sum of volumeMl / 1000
 * - livesImpacted: each whole-blood or platelet donation = 3 lives, organ = 1
 */
export const getDonorHistoryStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const records = await DonationRecord.find({
      donorId: req.user.id,
      status: 'Completed',
    }).lean();

    const totalDonations = records.length;
    const totalVolumeMl = records.reduce((sum: number, r: any) => sum + (r.volumeMl ?? 0), 0);
    const totalVolumeLiters = parseFloat((totalVolumeMl / 1000).toFixed(2));

    // Conservative estimate: whole blood/platelet ≈ 3 patients, organ ≈ 1 recipient
    const livesImpacted = records.reduce((sum: number, r: any) => {
      if (r.donationType === 'Organ') return sum + 1;
      return sum + 3;
    }, 0);

    res.status(200).json({
      success: true,
      data: { totalDonations, totalVolumeLiters, livesImpacted },
    });
  } catch (error) {
    next(error);
  }
};
