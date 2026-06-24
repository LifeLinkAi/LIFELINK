import { DonorProfile } from '../../models/DonorProfile';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';

// Types
export interface GeoJSONLocation {
  type: 'Point';
  coordinates: number[];
}

export interface MatchRequest {
  id?: string;
  type: 'Blood' | 'Organ';
  location?: GeoJSONLocation;
  bloodGroup?: string;
  organType?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

// Comprehensive ABO/Rh compatibility matrix
const getCompatibleBloodTypes = (bloodGroup: string): string[] => {
  const matrix: Record<string, string[]> = {
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
    'A+': ['O+', 'O-', 'A+', 'A-'],
    'A-': ['O-', 'A-'],
    'B+': ['O+', 'O-', 'B+', 'B-'],
    'B-': ['O-', 'B-'],
    'AB+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
  };
  return matrix[bloodGroup.toUpperCase()] || [bloodGroup];
};

/**
 * Checks if the donor is eligible to donate (>= 56 days recovery period)
 */
export function isDonorEligible(lastDonation: string | undefined | null): boolean {
  if (!lastDonation || lastDonation === 'N/A') return true;
  const parseDate = (raw: string): Date | null => {
    const wordMatch = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (wordMatch) {
      const d = new Date(`${wordMatch[2]} ${wordMatch[1]}, ${wordMatch[3]}`);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
    return null;
  };
  const donationDate = parseDate(lastDonation);
  if (!donationDate) return true;
  const now = new Date();
  const donation = new Date(donationDate.getFullYear(), donationDate.getMonth(), donationDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = Math.floor((today.getTime() - donation.getTime()) / msPerDay);
  return daysSince >= 56;
}

export const findNearbyCompatibleDonors = async (request: any) => {
  try {
    const hasLocation = request.location &&
      Array.isArray(request.location.coordinates) &&
      request.location.coordinates.length === 2 &&
      !(request.location.coordinates[0] === 0 && request.location.coordinates[1] === 0);

    const matchStage: any = {
      status: { $in: ['Available', 'Verified', 'AVAILABLE'] },
      isSetupComplete: true,
    };

    if (request.type === 'Blood' && request.bloodGroup) {
      matchStage.bloodType = { $in: getCompatibleBloodTypes(request.bloodGroup) };
    } else if (request.type === 'Organ') {
      if (!request.organType) {
        logger.error('Matching failed: Organ request initiated without an explicit organ target type.');
        return [];
      }
      matchStage.organsWillingToDonate = request.organType;
    }

    const exclusionSet = new Set([
      ...(request.notifiedDonors || []).map((donorId: any) => donorId.toString()),
      ...(request.rejectedBy || []).map((donorId: any) => donorId.toString()),
      ...(request.matchedDonors || [])
        .filter((matched: any) => ['NOTIFIED', 'ACCEPTED'].includes(matched.status))
        .map((matched: any) => matched.donorId?.toString())
        .filter(Boolean),
    ]);

    const excludedDonorObjectIds = Array.from(exclusionSet).map(id => new mongoose.Types.ObjectId(id));

    if (excludedDonorObjectIds.length > 0) {
      matchStage._id = { $nin: excludedDonorObjectIds };
    }

    const pipeline: any[] = [];

    if (hasLocation) {
      const [targetLng, targetLat] = request.location.coordinates;
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [targetLng, targetLat] },
          distanceField: 'distanceInMeters',
          maxDistance: 500000, 
          spherical: true,
          query: matchStage 
        }
      });
    } else {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      }
    );

    if (hasLocation) {
      pipeline.push({ $sort: { distanceInMeters: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $limit: 30 });

    pipeline.push({
      $project: {
        _id: 1,
        name: { $ifNull: ['$user.name', 'Anonymous Donor'] },
        phone: { $ifNull: ['$user.phone', 'N/A'] },
        bloodType: 1,
        organsWillingToDonate: 1,
        distanceInMeters: hasLocation ? 1 : { $literal: 0 },
        lastDonation: 1,
        distance: hasLocation ? { 
          $concat: [
            { $toString: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 1] } }, 
            " km"
          ] 
        } : { $literal: "N/A" },
        matchPercentage: { $literal: 98 }
      }
    });

    const compatibleDonors = await DonorProfile.aggregate(pipeline);
    const eligibleDonors = compatibleDonors.filter(donor => isDonorEligible(donor.lastDonation));

    return eligibleDonors.slice(0, 10);
  } catch (error) {
    logger.error('Critical exception captured within execution of findNearbyCompatibleDonors:', error);
    throw error;
  }
};

export const findBestCompatibleDonorForRequest = async (request: any) => {
  try {
    const hasLocation = request.location &&
      Array.isArray(request.location.coordinates) &&
      request.location.coordinates.length === 2 &&
      !(request.location.coordinates[0] === 0 && request.location.coordinates[1] === 0);

    const matchStage: any = {
      status: { $in: ['Available', 'Verified', 'AVAILABLE'] },
      isSetupComplete: true,
    };

    if (request.rejectedBy && request.rejectedBy.length > 0) {
      matchStage._id = { $nin: request.rejectedBy.map((id: any) => new mongoose.Types.ObjectId(id.toString())) };
    }

    if (request.type === 'Blood' && request.bloodGroup) {
      matchStage.bloodType = { $in: getCompatibleBloodTypes(request.bloodGroup) };
    } else if (request.type === 'Organ' && request.organType) {
      matchStage.organsWillingToDonate = request.organType;
    }

    const pipeline: any[] = [];

    if (hasLocation) {
      const [targetLng, targetLat] = request.location.coordinates;
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [targetLng, targetLat] },
          distanceField: 'distanceInMeters',
          maxDistance: 50000, 
          spherical: true,
          query: matchStage 
        }
      });
    } else {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({
      $sort: hasLocation 
        ? { isEmergencyMode: -1, isAvailable: -1, distanceInMeters: 1 }
        : { isEmergencyMode: -1, isAvailable: -1, createdAt: -1 }
    });

    pipeline.push({ $limit: 20 });

    const compatibleDonors = await DonorProfile.aggregate(pipeline);
    if (compatibleDonors.length === 0) return null;

    const eligibleDonors = compatibleDonors.filter(donor => isDonorEligible(donor.lastDonation));
    if (eligibleDonors.length === 0) return null;

    return eligibleDonors[0];
  } catch (error) {
    logger.error('Error finding best compatible donor:', error);
    return null;
  }
};