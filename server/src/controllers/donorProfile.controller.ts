import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { DonorProfile, DONOR_ORGAN_OPTIONS } from '../models/DonorProfile';
import { ApiError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

/**
 * PATCH /donors/me
 * Allows a donor to self-edit: phone, bloodType, location string,
 * coordinates ([lng, lat]), details, organsWillingToDonate, isAvailable.
 * Does NOT allow editing status, tier, avatar, or admin fields.
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'Donor') return next(new ApiError(404, 'Donor not found.'));

    // Whitelist of self-editable fields
    const {
      phone,
      bloodType,
      location,
      coordinates,
      details,
      organsWillingToDonate,
      isAvailable,
    } = req.body;

    // Validate organs if provided
    if (organsWillingToDonate !== undefined) {
      if (!Array.isArray(organsWillingToDonate)) {
        return next(new ApiError(400, 'organsWillingToDonate must be an array.'));
      }
      const invalid = organsWillingToDonate.filter((o: string) => !(DONOR_ORGAN_OPTIONS as readonly string[]).includes(o));
      if (invalid.length > 0) {
        return next(new ApiError(400, `Invalid organ options: ${invalid.join(', ')}. Allowed: ${DONOR_ORGAN_OPTIONS.join(', ')}.`));
      }
    }

    // Validate coordinates if provided — must be a valid [lng, lat] pair
    const hasValidCoords = Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number' &&
      coordinates[0] >= -180 && coordinates[0] <= 180 &&
      coordinates[1] >= -90 && coordinates[1] <= 90;

    if (coordinates !== undefined && !hasValidCoords && coordinates !== null) {
      return next(new ApiError(400, 'coordinates must be [longitude, latitude] with valid ranges.'));
    }

    const updateFields: Record<string, any> = {};
    const unsetFields: Record<string, any> = {};

    if (phone !== undefined)                 updateFields.phone = phone;
    if (bloodType !== undefined)             updateFields.bloodType = bloodType;
    if (location !== undefined)              updateFields.location = location;
    if (details !== undefined)               updateFields.details = details;
    if (organsWillingToDonate !== undefined) updateFields.organsWillingToDonate = organsWillingToDonate;
    if (isAvailable !== undefined)           updateFields.isAvailable = Boolean(isAvailable);

    // Only store coordinates when they are a valid pair; otherwise remove the field
    // so the sparse 2dsphere index is not violated by null/empty values
    if (coordinates !== undefined) {
      if (hasValidCoords) {
        updateFields.coordinates = coordinates;
      } else {
        unsetFields.coordinates = '';
      }
    }

    const mongoOp: Record<string, any> = {};
    if (Object.keys(updateFields).length > 0) mongoOp.$set = updateFields;
    if (Object.keys(unsetFields).length > 0)  mongoOp.$unset = unsetFields;

    let profile;
    if (Object.keys(mongoOp).length > 0) {
      profile = await DonorProfile.findOneAndUpdate(
        { userId: user._id },
        mongoOp,
        { new: true, upsert: true, setDefaultsOnInsert: false }
      );
    } else {
      profile = await DonorProfile.findOne({ userId: user._id });
      if (!profile) return next(new ApiError(404, 'Donor profile not found.'));
    }

    logger.info(`Donor ${user._id} updated profile: ${Object.keys(updateFields).join(', ')}`);

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      location: profile.location,
      coordinates: profile.coordinates ?? [],
      bloodType: profile.bloodType,
      tier: profile.tier,
      status: profile.status,
      isAvailable: profile.isAvailable,
      avatar: profile.avatar,
      phone: profile.phone,
      lastDonation: profile.lastDonation,
      totalDonated: profile.totalDonated,
      details: profile.details,
      organsWillingToDonate: profile.organsWillingToDonate ?? [],
      isSetupComplete: profile.isSetupComplete,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * PATCH /donors/me/availability
 * Dedicated endpoint for toggling availability on/off.
 */
export const toggleAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new ApiError(401, 'Not authenticated.'));

    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return next(new ApiError(400, 'isAvailable must be a boolean.'));
    }

    const profile = await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { isAvailable } },
      { new: true }
    );
    if (!profile) return next(new ApiError(404, 'Donor profile not found.'));

    logger.info(`Donor ${req.user.id} set isAvailable=${isAvailable}`);

    res.status(200).json({ success: true, isAvailable: profile.isAvailable });
  } catch (error) {
    next(error);
  }
};
