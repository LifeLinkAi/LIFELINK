import { DonorProfile } from '../../models/DonorProfile';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';

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

// Medical ABO/Rh compatibility matrix mapping
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
 * Finds up to 10 nearby compatible, eligible donors using an optimized single query pipeline.
 */
export const findNearbyCompatibleDonors = async (request: any) => {
  try {
    const hasLocation = Boolean(
      request?.location?.coordinates &&
      Array.isArray(request.location.coordinates) &&
      request.location.coordinates.length === 2 &&
      request.location.coordinates[0] !== 0
    );

    // 1. Core Filtering Criteria (Status & Compatibility)
    const matchCriteria: any = {
      status: { $in: ['Available', 'Verified', 'AVAILABLE'] },
      isSetupComplete: true,
    };

    if (request.type === 'Blood' && request.bloodGroup) {
      matchCriteria.bloodType = { $in: getCompatibleBloodTypes(request.bloodGroup) };
    } else if (request.type === 'Organ' && request.organType) {
      matchCriteria.organsWillingToDonate = request.organType;
    }

    // Combine notified and rejected exclusions safely using Mongoose maps
    const exclusions = [
      ...(request.notifiedDonors || []),
      ...(request.rejectedBy || [])
    ].map(id => new mongoose.Types.ObjectId(id.toString()));

    if (exclusions.length > 0) {
      matchCriteria._id = { $nin: exclusions };
    }

    // 2. Build the Optimized Aggregation Pipeline
    const pipeline: any[] = [];

    // Stage A: Geospatial Core Index Filter
    if (hasLocation) {
      const [lng, lat] = request.location.coordinates;
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceInMeters',
          maxDistance: 500000, // 500km limit
          spherical: true,
          query: matchCriteria // Merges match criteria directly into the index scan layer
        }
      });
    } else {
      pipeline.push({ $match: matchCriteria });
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Stage B: IN-ENGINE BIOLOGICAL COOLDOWN (Suggested by Reviewer)
    // Converts string dates or handles missing entries natively via the DB
    pipeline.push({
      $addFields: {
        parsedDonationDate: {
          $cond: {
            if: { $or: [{ $eq: ["$lastDonation", "N/A"] }, { $not: ["$lastDonation"] }] },
            then: new Date(0), // Sets to epoch if never donated, passing cooldown instantly
            else: { $toDate: "$lastDonation" }
          }
        }
      }
    });

    // Filter out donors whose last donation was within the 56-day window (56 days in milliseconds)
    const cooldownPeriodMs = 56 * 24 * 60 * 60 * 1000;
    pipeline.push({
      $match: {
        parsedDonationDate: { $lte: new Date(Date.now() - cooldownPeriodMs) }
      }
    });

    // Stage C: Graph Lookup User Relationships
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    );

    if (hasLocation) {
      pipeline.push({ $sort: { distanceInMeters: 1 } });
    }

    pipeline.push({ $limit: 10 });

    // Stage D: IN-ENGINE STRING FORMATTING (Clean Projection Payload)
    pipeline.push({
      $project: {
        _id: 1,
        name: { $ifNull: ['$user.name', 'Anonymous Donor'] },
        phone: { $ifNull: ['$user.phone', 'N/A'] },
        bloodType: 1,
        organsWillingToDonate: 1,
        distanceInMeters: 1,
        lastDonation: 1,
        matchPercentage: { $literal: 98 },
        distance: {
          $cond: {
            if: hasLocation,
            then: {
              $concat: [
                { $toString: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 1] } },
                " km"
              ]
            },
            else: "N/A"
          }
        }
      }
    });

    return await DonorProfile.aggregate(pipeline);

  } catch (error) {
    logger.error('Error in findNearbyCompatibleDonors optimization layer:', error);
    return [];
  }
};

/**
 * Finds the single best available dispatch target using the query pipeline.
 */
export const findBestCompatibleDonorForRequest = async (request: any) => {
  try {
    const hasLocation = Boolean(
      request?.location?.coordinates &&
      Array.isArray(request.location.coordinates) &&
      request.location.coordinates.length === 2 &&
      request.location.coordinates[0] !== 0
    );

    const matchCriteria: any = {
      status: { $in: ['Available', 'Verified', 'AVAILABLE'] },
      isSetupComplete: true,
    };

    if (request.rejectedBy && request.rejectedBy.length > 0) {
      matchCriteria._id = { $nin: request.rejectedBy.map((id: any) => new mongoose.Types.ObjectId(id.toString())) };
    }

    if (request.type === 'Blood' && request.bloodGroup) {
      matchCriteria.bloodType = { $in: getCompatibleBloodTypes(request.bloodGroup) };
    } else if (request.type === 'Organ' && request.organType) {
      matchCriteria.organsWillingToDonate = request.organType;
    }

    const pipeline: any[] = [];

    if (hasLocation) {
      const [lng, lat] = request.location.coordinates;
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceInMeters',
          maxDistance: 50000, 
          spherical: true,
          query: matchCriteria
        }
      });
    } else {
      pipeline.push({ $match: matchCriteria });
    }

    // Cooldown verification inside the query
    pipeline.push({
      $addFields: {
        parsedDonationDate: {
          $cond: {
            if: { $or: [{ $eq: ["$lastDonation", "N/A"] }, { $not: ["$lastDonation"] }] },
            then: new Date(0),
            else: { $toDate: "$lastDonation" }
          }
        }
      }
    });

    const cooldownPeriodMs = 56 * 24 * 60 * 60 * 1000;
    pipeline.push({
      $match: {
        parsedDonationDate: { $lte: new Date(Date.now() - cooldownPeriodMs) }
      }
    });

    pipeline.push({
      $sort: hasLocation 
        ? { isEmergencyMode: -1, isAvailable: -1, distanceInMeters: 1 }
        : { isEmergencyMode: -1, isAvailable: -1, createdAt: -1 }
    });

    pipeline.push({ $limit: 1 });

    const results = await DonorProfile.aggregate(pipeline);
    return results.length > 0 ? results[0] : null;

  } catch (error) {
    logger.error('Error in findBestCompatibleDonorForRequest optimization layer:', error);
    return null;
  }
};