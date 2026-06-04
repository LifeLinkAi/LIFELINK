import { Response, NextFunction } from 'express';
import { Campaign } from '../models/Campaign';
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
    const { title, type, status, hospital, startDate, endDate, bloodGroups, donorsTarget, description, imageUrl } = req.body;
    if (!title || !startDate || !endDate) {
      return next(new ApiError(400, 'Title, start date, and end date are required fields.'));
    }

    const campaign = new Campaign({
      title,
      type,
      status: status || 'DRAFT',
      hospital: hospital || 'Metro General Hospital',
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
