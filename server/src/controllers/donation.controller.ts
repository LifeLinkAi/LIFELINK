import { Response, NextFunction } from 'express';
import { DonationRecord } from '../models/DonationRecord';
import { HospitalProfile } from '../models/HospitalProfile';
import { Request as BloodRequest } from '../models/Request';
import { User } from '../models/User';
import { DonorProfile } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getHospitalDonations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Hospital') {
      return next(new ApiError(403, 'Access denied. Hospital role required.'));
    }

    let hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ApiError(404, 'Hospital user not found.'));
    }

    if (!hospitalProfile) {
      // Auto-heal the ghost user instead of throwing a 404
      hospitalProfile = await HospitalProfile.create({
        userId: user._id,
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Hospital')}`,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });
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

export const getAllDonations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const donations = await DonationRecord.find({})
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { donorName, bloodGroup, units, location, temperature, hemoglobin } = req.body;
    
    let donorUser = await User.findOne({ name: donorName, role: 'Donor' });
    if (!donorUser) {
      const emailLower = `${donorName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(Math.random() * 1000)}@lifelink.org`;
      donorUser = new User({
        name: donorName,
        email: emailLower,
        role: 'Donor',
        password: '$2b$10$temporaryhashedpasswordplaceholderforsecurityreason'
      });
      await donorUser.save();
      
      const profile = new DonorProfile({
        userId: donorUser._id,
        bloodType: bloodGroup || 'O+',
        status: 'Available',
        details: 'Altruistic blood donor.'
      });
      await profile.save();
    }

    const donation = new DonationRecord({
      donorId: donorUser._id,
      donationType: 'Blood',
      bloodType: bloodGroup || 'O+',
      facility: location || 'Main Hub',
      donationDate: new Date(),
      status: 'Stored',
      pipelineStatus: 'completed',
      volumeMl: (units || 1) * 450,
      notes: `Hemoglobin: ${hemoglobin || '13.5'}, Temp: ${temperature || '98.6'}`
    });
    await donation.save();

    // Check if the facility matches a registered hospital profile and update its inventory
    const hospitalUser = await User.findOne({ name: location, role: 'Hospital' });
    if (hospitalUser) {
      const hospitalProfile = await HospitalProfile.findOne({ userId: hospitalUser._id });
      if (hospitalProfile) {
        const invIndex = hospitalProfile.bloodInventory.findIndex(inv => inv.bloodGroup === bloodGroup);
        if (invIndex !== -1) {
          hospitalProfile.bloodInventory[invIndex].units += units || 1;
          await hospitalProfile.save();
        }
      }
    }

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};
