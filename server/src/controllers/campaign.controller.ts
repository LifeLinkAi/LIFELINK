import { Response, NextFunction } from 'express';
import { Campaign } from '../models/Campaign';
import { CampaignRegistration } from '../models/CampaignRegistration';
import { DonorProfile } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCampaigns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      title, type, status, hospital, startDate, endDate, 
      bloodGroups, donorsTarget, description, imageUrl,
      venueType, venueName, venueAddress 
    } = req.body;

    if (!title || !startDate || !endDate) {
      return next(new ApiError(400, 'Title, start date, and end date are required fields.'));
    }

    const vType = venueType || 'HOSPITAL';
    const vName = vType === 'HOSPITAL' ? (venueName || hospital || 'Metro General Hospital') : (venueName || '');
    const vAddress = vType === 'HOSPITAL' ? (venueAddress || 'Main Campus Address') : (venueAddress || '');

    const campaign = new Campaign({
      title,
      type,
      status: status || 'DRAFT',
      hospital: hospital || 'Metro General Hospital',
      venueType: vType,
      venueName: vName,
      venueAddress: vAddress,
      startDate,
      endDate,
      bloodGroups: bloodGroups || ['ANY'],
      donorsTarget: donorsTarget || 100,
      description: description || '',
      imageUrl: imageUrl || '',
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const campaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!campaign) {
      return next(new ApiError(404, 'Campaign not found.'));
    }

    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return next(new ApiError(404, 'Campaign not found.'));
    }

    res.status(200).json({ success: true, message: 'Campaign deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const registerForCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: campaignId } = req.params;
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }
    const donorId = req.user.id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return next(new ApiError(404, 'Campaign not found.'));
    }

    if (campaign.status === 'ENDED' || campaign.status === 'DRAFT') {
      return next(new ApiError(400, 'This campaign is closed or not launched yet.'));
    }

    // Check if already registered
    const existing = await CampaignRegistration.findOne({ campaignId, donorId });
    if (existing) {
      return next(new ApiError(400, 'You are already registered for this campaign.'));
    }

    const registration = await CampaignRegistration.create({
      campaignId,
      donorId,
      status: 'REGISTERED',
    });

    // Increment donorsRegistered count
    campaign.donorsRegistered = (campaign.donorsRegistered || 0) + 1;
    await campaign.save();

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

export const cancelCampaignRegistration = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: campaignId } = req.params;
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }
    const donorId = req.user.id;

    const registration = await CampaignRegistration.findOneAndDelete({ campaignId, donorId });
    if (!registration) {
      return next(new ApiError(404, 'Registration not found.'));
    }

    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.donorsRegistered = Math.max(0, (campaign.donorsRegistered || 0) - 1);
      await campaign.save();
    }

    res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }
    const donorId = req.user.id;

    const registrations = await CampaignRegistration.find({ donorId })
      .populate('campaignId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
};

export const getCampaignRegistrationDetail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { regId } = req.params;

    const registration = await CampaignRegistration.findById(regId)
      .populate('campaignId')
      .populate('donorId', 'name email');

    if (!registration) {
      return next(new ApiError(404, 'Campaign registration ticket not found.'));
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

export const getCampaignRegistrations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: campaignId } = req.params;
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Hospital')) {
      return next(new ApiError(403, 'Access denied. Staff access credentials required.'));
    }

    const registrations = await CampaignRegistration.find({ campaignId })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
};

export const verifyDonation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { regId } = req.params;
    const { status, donationUnits, staffNotes } = req.body;

    if (!status || !['ATTENDED', 'ABSENT', 'DEFERRED'].includes(status)) {
      return next(new ApiError(400, 'Invalid status selection.'));
    }

    const registration = await CampaignRegistration.findById(regId);
    if (!registration) {
      return next(new ApiError(404, 'Registration not found.'));
    }

    const previousStatus = registration.status;
    registration.status = status;
    if (staffNotes !== undefined) {
      registration.staffNotes = staffNotes;
    }

    if (status === 'ATTENDED') {
      const units = Number(donationUnits || 1);
      registration.donationUnits = units;
      registration.donatedAt = new Date();

      // Update Campaign Collected units if not already completed
      if (previousStatus !== 'ATTENDED') {
        const campaign = await Campaign.findById(registration.campaignId);
        if (campaign) {
          campaign.donationsCollected = (campaign.donationsCollected || 0) + units;
          await campaign.save();
        }

        // Update Donor Profile metrics
        const donorProfile = await DonorProfile.findOne({ userId: registration.donorId });
        if (donorProfile) {
          // Parse Liters (e.g. "1.2 Liters" -> 1.2)
          let currentLiters = 0;
          if (donorProfile.totalDonated) {
            const match = donorProfile.totalDonated.match(/([\d\.]+)/);
            if (match) {
              currentLiters = parseFloat(match[1]);
            }
          }
          const addedLiters = units * 0.45; // 0.45 liters per unit/pint
          const updatedLiters = currentLiters + addedLiters;
          donorProfile.totalDonated = `${updatedLiters.toFixed(2)} Liters`;

          // Format lastDonation date (e.g., "13 June 2026")
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const today = new Date();
          const dateString = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
          donorProfile.lastDonation = dateString;

          // Set status as pending setup completed cooldown if necessary
          donorProfile.status = 'Available';
          await donorProfile.save();
        }
      }
    }

    await registration.save();
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};
