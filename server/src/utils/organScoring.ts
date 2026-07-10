export function calculateHaversineDistance(coords1: [number, number], coords2: [number, number]): number {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) return 9999;
  
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Radius of the Earth in km
  
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export function getUrgencyScore(urgency: string): number {
  switch(urgency) {
    case 'Critical': return 100;
    case 'High': return 75;
    case 'Medium': return 50;
    case 'Low': return 25;
    default: return 50;
  }
}

/**
 * Calculates a unified match score based on organ-specific strategies.
 * @param patient The lean OrganWaitlist document
 * @param donor The donor profile document
 * @param patientLocation Coordinates of the patient's hospital [lon, lat]
 */
export function calculateMatchScore(patient: any, donor: any, patientLocation?: [number, number]): number {
  const urgencyScore = getUrgencyScore(patient.urgency);
  const organType = patient.requiredOrgan;
  
  switch(organType) {
    case 'Kidney': {
      // Age-longevity factor (favoring younger recipients)
      // Base score is urgency, with a negative modifier for higher age
      const agePenalty = (patient.age || 50) * 0.5;
      return Math.max(0, urgencyScore + 50 - agePenalty);
    }
    
    case 'Liver':
    case 'Liver Segment': {
      // Simulated logarithmic MELD scale
      // e.g. Critical (100) -> log10(110) * 50 = ~102
      return Math.log10(urgencyScore + 10) * 50;
    }
    
    case 'Heart':
    case 'Lung': {
      // Prioritize heavily by minimal Haversine distance (ischemic tolerances)
      let distanceScore = 0;
      if (patientLocation && donor.location?.coordinates) {
        const distKm = calculateHaversineDistance(
          [donor.location.coordinates[0], donor.location.coordinates[1]],
          [patientLocation[0], patientLocation[1]]
        );
        // Distance score drops as distance increases. Max 100 points.
        distanceScore = Math.max(0, 100 - (distKm * 0.1));
      }
      return urgencyScore * 0.6 + distanceScore * 0.4;
    }
    
    case 'Bone Marrow': {
      // HLA simulated (ABO already matched). High baseline priority.
      return urgencyScore + 100;
    }
    
    case 'Cornea': {
      // Wait-time linear priority
      const waitDays = (Date.now() - new Date(patient.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
      return urgencyScore + waitDays;
    }
    
    case 'Pancreas':
    default: {
      return urgencyScore;
    }
  }
}
