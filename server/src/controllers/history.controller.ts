import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DonationHistory } from '../models/DonationHistory';
import { ApiError } from '../middlewares/error.middleware';

// ── GET /api/history  (current donor's own history) ───────────────────────
export const getMyHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await DonationHistory.find({ donor: req.user!.id }).sort({ donationDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/history/:id ───────────────────────────────────────────────────
export const getHistoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await DonationHistory.findOne({ _id: req.params.id, donor: req.user!.id });
    if (!record) return next(new ApiError(404, 'Donation record not found.'));
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/history ──────────────────────────────────────────────────────
export const createHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await DonationHistory.create({ donor: req.user!.id, ...req.body });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/history/:id ───────────────────────────────────────────────────
export const updateHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await DonationHistory.findOneAndUpdate(
      { _id: req.params.id, donor: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return next(new ApiError(404, 'Donation record not found.'));
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/history/:id ────────────────────────────────────────────────
export const deleteHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await DonationHistory.findOneAndDelete({ _id: req.params.id, donor: req.user!.id });
    if (!record) return next(new ApiError(404, 'Donation record not found.'));
    res.status(200).json({ success: true, message: 'Record deleted.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/history/stats ─────────────────────────────────────────────────
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await DonationHistory.find({ donor: req.user!.id, status: 'Completed' });
    const totalDonations = records.length;
    const totalVolumeMl   = records.reduce((sum, r) => sum + (r.volumeMl || 0), 0);
    const livesImpacted   = totalDonations * 3; // 1 donation ≈ 3 lives
    res.status(200).json({
      success: true,
      data: { totalDonations, totalVolumeLiters: +(totalVolumeMl / 1000).toFixed(2), livesImpacted },
    });
  } catch (err) {
    next(err);
  }
};
