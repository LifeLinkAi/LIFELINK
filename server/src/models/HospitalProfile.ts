import { Schema, model } from 'mongoose';

const hospitalProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseId: {
      type: String,
      default: '',
      trim: true,
    },
    governmentLicenseId: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    accreditation: {
      type: String,
      default: '',
      trim: true,
    },
    hospitalLicenseUrl: {
      type: String,
      default: '',
    },
    kidneyTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    liverTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    heartTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    lungTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    contactPerson: {
      name: { type: String, default: '' },
      designation: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    logo: {
      type: String,
      default: '',
    },
    specialties: {
      type: [String],
      default: ['General'],
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended', 'Verified'],
      default: 'Pending',
    },
    isSetupComplete: {
      type: Boolean,
      default: false,
    },
    inviteToken: {
      type: String,
      default: null,
    },
    inviteTokenExpires: {
      type: Date,
      default: null,
    },
    patientCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Schema.Types.Mixed,
      default: '--',
    },
    bloodHealthStatus: {
      type: String,
      enum: ['Optimal', 'Stable', 'Critical'],
      default: 'Stable',
    },
    // --- NEW FIELDS FOR UI INTEGRATION ---
    bloodInventory: [
      {
        bloodGroup: {
          type: String,
          enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          required: true,
        },
        units: { type: Number, default: 0 },
        maxCapacity: { type: Number, default: 100 },
        status: {
          type: String,
          enum: ['critical', 'low', 'adequate', 'optimal'],
          default: 'adequate',
        },
      },
    ],
    liveStats: {
      icuCapacityPct: { type: Number, default: 0, min: 0, max: 100 },
      erWaitTimeMins: { type: Number, default: 0 },
      onCallStaff: { type: Number, default: 0 },
    },
    // --------------------------------------
  },
  {
    timestamps: true,
  }
);

// Middleware to automatically initialize a default blood inventory for new hospitals
// Middleware to automatically initialize a default blood inventory for new hospitals
hospitalProfileSchema.pre('save', function (next) {
  // Mongoose automatically initializes arrays to an empty [], so it's safe to check length and push
  if (this.isNew && this.bloodInventory.length === 0) {
    // 'as const' tells TypeScript these are exact literal strings, not just any strings
    const defaultBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
    
    defaultBloodGroups.forEach((group) => {
      this.bloodInventory.push({
        bloodGroup: group,
        units: 0,
        maxCapacity: 100,
        status: 'critical',
      });
    });
  }
  next();
});

hospitalProfileSchema.index({ location: '2dsphere' });

export const HospitalProfile = model('HospitalProfile', hospitalProfileSchema);