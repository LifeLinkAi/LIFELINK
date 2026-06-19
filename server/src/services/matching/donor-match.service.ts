import { DonorProfile } from '../../models/DonorProfile';
import { logger } from '../../utils/logger';

interface GeoJSONLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface MatchingRequestInput {
  type: 'Blood' | 'Organ';
  location?: GeoJSONLocation;
  bloodGroup?: string;
  organType?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

// Haversine formula to compute actual spatial displacement along a sphere
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

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

export const findNearbyCompatibleDonors = async (request: MatchingRequestInput) => {
  try {
    const hasLocation = request.location &&
      Array.isArray(request.location.coordinates) &&
      request.location.coordinates.length === 2 &&
      !(request.location.coordinates[0] === 0 && request.location.coordinates[1] === 0);

    // 2. Base Database Query Setup
    const query: any = {
      status: { $in: ['Available', 'Verified'] },
      isSetupComplete: true,
    };

    if (hasLocation) {
      const [reqLng, reqLat] = request.location!.coordinates;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [reqLng, reqLat],
          },
          $maxDistance: 500000, // Strict 500km boundary metric
        },
      };
    }

    // 3. Category Evaluation Routing
    if (request.type === 'Blood') {
      if (request.bloodGroup) {
        const compatibleTypes = getCompatibleBloodTypes(request.bloodGroup);
        query.bloodType = { $in: compatibleTypes };
      }
    } else if (request.type === 'Organ') {
      if (!request.organType) {
        logger.error('Matching failed: Organ request initiated without an explicit organ target type.');
        return [];
      }
      // Matches donor's certified organ registration array against the requested organ line item
      query.organsWillingToDonate = request.organType;
    }

    // Execute query and fetch profiles alongside linked system user data definitions
    const rawDonors = await DonorProfile.find(query)
      .populate('userId', 'name email phone')
      .limit(20) // Retrieve a wider buffer for sorting logic before capping the top 10
      .lean();

    // 4. Mathematical Weighted Scoring Engine
    const evaluatedDonors = rawDonors.map((donor: any) => {
      const hasDonorLoc = donor.location &&
        Array.isArray(donor.location.coordinates) &&
        donor.location.coordinates.length === 2 &&
        !(donor.location.coordinates[0] === 0 && donor.location.coordinates[1] === 0);

      let trueDistanceMeters = 999999;
      let proximityScore = 0;

      if (hasLocation && hasDonorLoc) {
        const [reqLng, reqLat] = request.location!.coordinates;
        const [donorLng, donorLat] = donor.location.coordinates;
        trueDistanceMeters = calculateHaversineDistance(reqLat, reqLng, donorLat, donorLng);
        
        // Secondary absolute protection barrier for manual geo calculations
        if (trueDistanceMeters > 500000) return null;

        if (trueDistanceMeters <= 50000) {
          proximityScore = 40 * (1 - trueDistanceMeters / 50000);
        }
      }

      // Component B: Urgency Escalation Matrix (Max 35)
      let urgencyScore = 5;
      if (request.urgency === 'critical') urgencyScore = 35;
      else if (request.urgency === 'high') urgencyScore = 25;
      else if (request.urgency === 'medium') urgencyScore = 15;

      // Component C: Biological Identity Specificity Score (Max 25)
      let compatibilityScore = 15; // Baseline value for general compatibility
      if (request.type === 'Blood' && request.bloodGroup && donor.bloodType) {
        if (donor.bloodType.toUpperCase() === request.bloodGroup.toUpperCase()) {
          compatibilityScore = 25; // Premium value awarded to identical matches
        }
      } else if (request.type === 'Organ') {
        compatibilityScore = 25; // Direct matching organ validation passed via query filter
      }

      // Aggregate weights and bind structural identity constraints
      const rawMatchPercentage = Math.round(proximityScore + urgencyScore + compatibilityScore);
      const matchPercentage = Math.min(Math.max(rawMatchPercentage, 0), 100);

      return {
        _id: donor._id,
        name: donor.userId?.name || 'Anonymous Donor',
        phone: donor.userId?.phone || 'N/A',
        bloodType: donor.bloodType,
        organsWillingToDonate: donor.organsWillingToDonate,
        distance: trueDistanceMeters === 999999 ? 'Distance pending' : `${(trueDistanceMeters / 1000).toFixed(1)} km`,
        distanceInMeters: trueDistanceMeters === 999999 ? null : trueDistanceMeters,
        matchPercentage,
      };
    });

    // Clean null evaluations, sort descending by computed percentage, cap at top 10
    return evaluatedDonors
      .filter(Boolean)
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

  } catch (error) {
    logger.error('Critical exception captured within execution of findNearbyCompatibleDonors:', error);
    throw error; // Re-throw so handler middleware captures it appropriately rather than masking failures
  }
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

/**
 * Ranks all compatible, active, non-rejected donors using:
 * - availability (isAvailable)
 * - emergency mode (isEmergencyMode)
 * - donation eligibility
 * - distance
 * - matching score
 * Returns the single best DonorProfile document.
 */
export const findBestCompatibleDonorForRequest = async (request: any) => {
  try {
    const query: any = {
      status: { $in: ['Available', 'Verified'] },
      isSetupComplete: true,
    };

    // Exclude donors who have already rejected this request
    if (request.rejectedBy && request.rejectedBy.length > 0) {
      query._id = { $nin: request.rejectedBy };
    }

    if (request.type === 'Blood') {
      if (request.bloodGroup) {
        const compatibleTypes = getCompatibleBloodTypes(request.bloodGroup);
        query.bloodType = { $in: compatibleTypes };
      }
    } else if (request.type === 'Organ') {
      if (request.organType) {
        query.organsWillingToDonate = request.organType;
      }
    }

    const rawDonors = await DonorProfile.find(query).lean();
    if (rawDonors.length === 0) return null;

    const evaluatedDonors = rawDonors.map((donor: any) => {
      // 1. Availability check (isAvailable: true)
      const availScore = donor.isAvailable ? 1000 : 0;

      // 2. Emergency mode check (isEmergencyMode: true)
      const emergencyScore = donor.isEmergencyMode ? 500 : 0;

      // 3. Eligibility check (>= 56 days)
      const eligible = isDonorEligible(donor.lastDonation);
      const eligibilityScore = eligible ? 10000 : 0;

      // 4. Distance Calculation (Haversine, max 50km)
      let proximityScore = 0;
      let trueDistanceMeters = 999999;
      
      const hasReqLoc = request.location &&
        Array.isArray(request.location.coordinates) &&
        request.location.coordinates.length === 2 &&
        !(request.location.coordinates[0] === 0 && request.location.coordinates[1] === 0);

      const hasDonorLoc = donor.location &&
        Array.isArray(donor.location.coordinates) &&
        donor.location.coordinates.length === 2 &&
        !(donor.location.coordinates[0] === 0 && donor.location.coordinates[1] === 0);

      if (hasReqLoc && hasDonorLoc) {
        const [reqLng, reqLat] = request.location.coordinates;
        const [donorLng, donorLat] = donor.location.coordinates;
        trueDistanceMeters = calculateHaversineDistance(reqLat, reqLng, donorLat, donorLng);
        if (trueDistanceMeters <= 50000) {
          proximityScore = 40 * (1 - trueDistanceMeters / 50000);
        }
      }

      // 5. Urgency Score (urgency priority)
      let urgencyScore = 5;
      if (request.urgency === 'critical') urgencyScore = 35;
      else if (request.urgency === 'high') urgencyScore = 25;
      else if (request.urgency === 'medium') urgencyScore = 15;

      // 6. Biological Matching / Compatibility Score
      let compatibilityScore = 15;
      if (request.type === 'Blood' && request.bloodGroup && donor.bloodType) {
        if (donor.bloodType.toUpperCase() === request.bloodGroup.toUpperCase()) {
          compatibilityScore = 25;
        }
      } else if (request.type === 'Organ') {
        compatibilityScore = 25;
      }

      const matchPercentage = Math.min(Math.max(Math.round(proximityScore + urgencyScore + compatibilityScore), 0), 100);

      // Compute total ranking score. We subtract distance to prioritize closer matches as tie-breaker
      const score = availScore + emergencyScore + eligibilityScore + matchPercentage - (trueDistanceMeters / 1000);

      return {
        donor,
        score,
      };
    });

    // Sort descending by computed ranking score
    evaluatedDonors.sort((a, b) => b.score - a.score);

    // Return the top donor
    return evaluatedDonors[0].donor;
  } catch (error) {
    logger.error('Error finding best compatible donor:', error);
    return null;
  }
};