import { Types } from 'mongoose';
import { BloodBag } from '../models/BloodBag';
import { logger } from './logger';

export const seedInitialHospitalBags = async (hospitalId: Types.ObjectId) => {
  try {
    const existing = await BloodBag.countDocuments({ hospitalId });
    if (existing > 0) {
      logger.info(`Hospital ${hospitalId} already has ${existing} blood bags. Skipping seed.`);
      return;
    }

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    const componentTypes = ['WHOLE_BLOOD', 'RBC', 'PLASMA', 'PLATELETS'] as const;

    const bags = [];
    for (let i = 0; i < 25; i++) {
      const bg = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
      const ct = componentTypes[Math.floor(Math.random() * componentTypes.length)];
      
      const collectionDate = new Date();
      // subtract up to 3 days to simulate existing stock
      collectionDate.setDate(collectionDate.getDate() - Math.floor(Math.random() * 3));

      bags.push({
        bagId: `BAG-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${i}`,
        hospitalId,
        bloodGroup: bg,
        componentType: ct,
        volumeMl: 450,
        collectionDate,
        status: 'AVAILABLE',
      });
    }

    // By using .create(), the pre('save') hook in BloodBag.ts will fire 
    // for each document, correctly calculating the expirationDate.
    await BloodBag.create(bags);
    logger.info(`Successfully seeded 25 blood bags for hospital ${hospitalId}`);

  } catch (err: any) {
    logger.error(`Error seeding blood bags: ${err.message}`);
  }
};
