import { Response, NextFunction } from 'express';
import { DonationRecord } from '../models/DonationRecord';
import { HospitalProfile } from '../models/HospitalProfile';
import { Request as BloodRequest } from '../models/Request';
import { User } from '../models/User';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getHospitalDonations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    if (!hospitalProfile || !user) {
      return next(new ApiError(404, 'Hospital profile or user not found.'));
    }

    // Find donations at this hospital
    const donations = await DonationRecord.find({ facility: user.name })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const updatePipelineStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    const { id } = req.params;
    const { pipelineStatus } = req.body;

    const validStatuses = ['arriving', 'screening', 'donating', 'completed', 'deferred'];
    if (!validStatuses.includes(pipelineStatus)) {
      return next(new ApiError(400, 'Invalid pipeline status.'));
    }

    const donation = await DonationRecord.findById(id);
    if (!donation) {
      return next(new ApiError(404, 'Donation record not found.'));
    }

    donation.pipelineStatus = pipelineStatus;

    if (pipelineStatus === 'completed') {
      donation.status = 'Completed';

      // Automatically update the hospital's blood inventory
      if (donation.donationType === 'Blood') {
        const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
        if (hospitalProfile && donation.bloodType) {
          const invIndex = hospitalProfile.bloodInventory.findIndex(inv => inv.bloodGroup === donation.bloodType);
          if (invIndex !== -1) {
            const addedUnits = donation.volumeMl > 0 ? donation.volumeMl / 450 : 1; // approx units
            hospitalProfile.bloodInventory[invIndex].units += Math.round(addedUnits);

            const currentUnits = hospitalProfile.bloodInventory[invIndex].units;
            const currentMax = hospitalProfile.bloodInventory[invIndex].maxCapacity;
            const percentage = currentMax > 0 ? (currentUnits / currentMax) * 100 : 0;
            
            if (percentage <= 15) hospitalProfile.bloodInventory[invIndex].status = 'critical';
            else if (percentage <= 30) hospitalProfile.bloodInventory[invIndex].status = 'low';
            else if (percentage >= 80) hospitalProfile.bloodInventory[invIndex].status = 'optimal';
            else hospitalProfile.bloodInventory[invIndex].status = 'adequate';

            await hospitalProfile.save();
          }
        }
      }

      // If tied to a request, mark the request as fulfilled
      if (donation.requestId) {
        const requestObj = await BloodRequest.findById(donation.requestId);
        if (requestObj && requestObj.status !== 'FULFILLED') {
          requestObj.status = 'FULFILLED';
          await requestObj.save();
        }
      }
    } else if (pipelineStatus === 'deferred') {
      donation.status = 'Cancelled';
    }

    await donation.save();

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};
