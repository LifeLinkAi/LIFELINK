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
    // 1. Hard Constraints: Location Validation
    if (!request.location || !Array.isArray(request.location.coordinates) || request.location.coordinates.length !== 2) {
      logger.warn('Matching skipped: Request missing valid GeoJSON location coordinates.');
      return [];
    }

    const [reqLng, reqLat] = request.location.coordinates;

    // 2. Base Database Query Setup
    const query: any = {
      status: { $in: ['Available', 'Verified'] },
      isSetupComplete: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [reqLng, reqLat],
          },
          $maxDistance: 500000, // Strict 500km boundary metric
        },
      },
    };

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
      if (!donor.location || !donor.location.coordinates) return null;
      const [donorLng, donorLat] = donor.location.coordinates;

      // Calculate True Structural Distance
      const trueDistanceMeters = calculateHaversineDistance(reqLat, reqLng, donorLat, donorLng);
      
      // Secondary absolute protection barrier for manual geo calculations
      if (trueDistanceMeters > 500000) return null;

      // Component A: Proximity Linear Decay Score (Max 40)
      const proximityScore = 40 * (1 - trueDistanceMeters / 50000);

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
        distance: `${(trueDistanceMeters / 1000).toFixed(1)} km`,
        distanceInMeters: trueDistanceMeters,
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