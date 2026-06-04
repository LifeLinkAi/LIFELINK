import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BloodRequest } from '../models/BloodRequest';
import { ApiError } from '../middlewares/error.middleware';

// ── GET /api/requests  (all pending requests — for donors to see) ───────────
export const getAllRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, urgency } = req.query;
    const filter: Record<string, any> = { status: 'Pending' };
    if (urgency) filter.urgency = urgency;

    const requests = await BloodRequest.find(filter)
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/requests/:id ──────────────────────────────────────────────────
export const getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('requestedBy', 'name email');
    if (!request) return next(new ApiError(404, 'Request not found.'));
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/requests  (create a new request) ────────────────────────────
export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await BloodRequest.create({ requestedBy: req.user!.id, ...req.body });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/requests/:id/accept ──────────────────────────────────────────
export const acceptRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Accepted', acceptedBy: req.user!.id },
      { new: true }
    );
    if (!request) return next(new ApiError(404, 'Request not found.'));
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/requests/:id/dismiss ─────────────────────────────────────────
export const dismissRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Dismissed' },
      { new: true }
    );
    if (!request) return next(new ApiError(404, 'Request not found.'));
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/requests/:id ───────────────────────────────────────────────
export const deleteRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!request) return next(new ApiError(404, 'Request not found.'));
    res.status(200).json({ success: true, message: 'Request deleted.' });
  } catch (err) {
    next(err);
  }
};
