import { Response, NextFunction } from 'express';

import { User } from '../models/User';
import { Request } from '../models/Request';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPatientProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user || user.role !== 'Patient') {
      return next(new ApiError(404, 'Patient user not found.'));
    }

    const requests = await Request.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('type bloodGroup organType facility contactPhone status urgency registeredDate updatedAt')
      .lean();

    const latestRequest = requests[0] || null;
    const activeStatuses = new Set(['Pending', 'PENDING', 'DONOR_NOTIFIED', 'APPROVED', 'IN_PROGRESS']);
    const completedStatuses = new Set(['COMPLETED', 'FULFILLED']);

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: latestRequest?.contactPhone || '',
        bloodGroup: latestRequest?.bloodGroup || '',
        preferredFacility: latestRequest?.facility || '',
        latestRequest: latestRequest
          ? {
              id: latestRequest._id.toString(),
              type: latestRequest.type,
              bloodGroup: latestRequest.bloodGroup,
              organType: latestRequest.organType,
              facility: latestRequest.facility,
              status: latestRequest.status,
              urgency: latestRequest.urgency,
              registeredDate: latestRequest.registeredDate,
              updatedAt: latestRequest.updatedAt,
            }
          : null,
        stats: {
          totalRequests: requests.length,
          activeRequests: requests.filter(request => activeStatuses.has(request.status)).length,
          completedRequests: requests.filter(request => completedStatuses.has(request.status)).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
