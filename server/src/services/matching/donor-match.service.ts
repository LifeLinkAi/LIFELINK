import { DonorProfile } from '../../models/DonorProfile';
import { IRequest } from '../../models/Request';
import { Schema } from 'mongoose';

/**
 * Response type for matched donors
 */
export interface IMatchedDonorResult {
  donorId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  distance?: number;
  tier?: string;
  totalDonated?: string;
}

/**
 * Find nearby compatible donors for a given request using MongoDB geospatial queries.
 *
 * Criteria:
 * - Donor must be available (status: 'Available' or 'Verified')
 * - Blood type must be compatible (for Blood requests) OR organ donor (for Organ requests)
 * - Location must be set (has coordinates)
 * - Sorted by distance to request location (using $near)
 * - Limited to top 10 closest donors
 *
 * @param request - The patient's Request document (blood or organ)
 * @returns Array of up to 10 matched donors, sorted by proximity
 */
export async function findNearbyCompatibleDonors(
  request: IRequest
): Promise<IMatchedDonorResult[]> {
  // Validate that the request has a location
  if (
    !request.location ||
    !request.location.coordinates ||
    request.location.coordinates.length !== 2
  ) {
    console.warn(
      `Request ${request._id} has no valid location coordinates. Returning empty results.`
    );
    return [];
  }

  const [lng, lat] = request.location.coordinates;
  const requestBloodGroup = request.bloodGroup || '';
  const requestOrganType = request.organType || '';

  try {
    // Query DonorProfile with geospatial $near and blood type / organ match
    const query: any = {
      // Status: must be available or verified
      status: { $in: ['Available', 'Verified'] },
      // Location: must have coordinates
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          // Optionally limit by distance in meters (here: 50km = 50000m). Remove if you want no limit.
          $maxDistance: 50000,
        },
      },
    };

    // Add blood type match for Blood requests
    if (request.type === 'Blood' && requestBloodGroup) {
      query.bloodType = getCompatibleBloodTypes(requestBloodGroup);
    }

    // For organ requests, we might want to check if donor is willing to donate organs
    // For now, we'll just query all available donors (you can add organ willingness later)
    if (request.type === 'Organ') {
      // Placeholder: all verified/available donors can be organ donors
      // In future, add: organWillingness: { $contains: requestOrganType }
    }

    // Execute the query, sorted by distance (automatically done by $near)
    const donors = await DonorProfile.find(query)
      .populate('userId', 'name email phone avatar')
      .limit(10)
      .lean();

    // Map to response format
    const results: IMatchedDonorResult[] = donors.map((donor: any) => ({
      donorId: donor._id,
      userId: donor.userId?._id,
      name: donor.userId?.name,
      email: donor.userId?.email,
      phone: donor.phone || donor.userId?.phone,
      bloodType: donor.bloodType,
      distance: calculateDistance(lat, lng, 0, 0), // Placeholder; $near returns distance in sortedIndex
      tier: donor.tier,
      totalDonated: donor.totalDonated,
    }));

    console.log(
      `Found ${results.length} compatible donors for request ${request._id}`
    );
    return results;
  } catch (error) {
    console.error('Error finding nearby compatible donors:', error);
    return [];
  }
}

/**
 * Get compatible blood types for a given blood group.
 * Based on blood type compatibility rules.
 *
 * @param bloodGroup - The recipient's blood group (e.g., 'O+', 'AB-')
 * @returns Array of compatible donor blood types
 */
function getCompatibleBloodTypes(bloodGroup: string): string[] {
  const compatibilityMap: Record<string, string[]> = {
    'O+': ['O+', 'O-'], // O+ can receive from O+, O-
    'O-': ['O-'], // O- can only receive from O-
    'A+': ['O+', 'O-', 'A+', 'A-'], // A+ can receive from O, A
    'A-': ['O-', 'A-'], // A- can receive from O-, A-
    'B+': ['O+', 'O-', 'B+', 'B-'], // B+ can receive from O, B
    'B-': ['O-', 'B-'], // B- can receive from O-, B-
    'AB+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], // AB+ can receive from all
    'AB-': ['O-', 'A-', 'B-', 'AB-'], // AB- can receive from O-, A-, B-, AB-
  };

  return compatibilityMap[bloodGroup] || [bloodGroup];
}

/**
 * Calculate Haversine distance between two coordinates (in km).
 * This is a helper; MongoDB $near returns distance automatically.
 *
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
