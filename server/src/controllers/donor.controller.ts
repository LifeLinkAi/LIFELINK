import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DonorProfile } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';

// ── GET /api/donor/profile ─────────────────────────────────────────────────
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user!.id }).populate('user', 'name email');
    if (!profile) return next(new ApiError(404, 'Donor profile not found.'));
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/donor/profile ────────────────────────────────────────────────
export const createProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exists = await DonorProfile.findOne({ user: req.user!.id });
    if (exists) return next(new ApiError(400, 'Donor profile already exists.'));

    const profile = await DonorProfile.create({ user: req.user!.id, ...req.body });
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/donor/profile ─────────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await DonorProfile.findOneAndUpdate(
      { user: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return next(new ApiError(404, 'Donor profile not found.'));
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/donor/profile ──────────────────────────────────────────────
export const deleteProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await DonorProfile.findOneAndDelete({ user: req.user!.id });
    if (!profile) return next(new ApiError(404, 'Donor profile not found.'));
    res.status(200).json({ success: true, message: 'Donor profile deleted.' });
  } catch (err) {
    next(err);
  }
};
