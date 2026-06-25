import { Schema, model } from 'mongoose';

const ORGAN_OPTIONS = ['Kidney', 'Liver', 'Liver Segment', 'Cornea', 'Pancreas', 'Bone Marrow', 'Heart', 'Lung'] as const;

const donorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ── Location fields (donor branch) ───────────────────────────────────────
    // `location` is a proper GeoJSON Point for geospatial query matching.
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },

    // ── Profile fields (both branches) ──────────────────────────────────────
    bloodType: {
      type: String,
      default: 'O-',
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Gold', 'Silver', 'Platinum', 'Bronze'],
      default: 'Bronze',
    },
    status: {
      type: String,
      enum: ['Verified', 'Pending', 'Available', 'Blocked'],
      default: 'Pending',
    },
    // Donor self-controlled availability (separate from admin-managed status)
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isEmergencyMode: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    lastDonation: {
      type: String,
      default: 'N/A',
    },
    totalDonated: {
      type: String,
      default: '0 Liters',
    },
    details: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isSetupComplete: {
      type: Boolean,
      default: false,
    },
    organsWillingToDonate: {
      type: [String],
      enum: ORGAN_OPTIONS,
      default: [],
    },
    inviteToken: {
      type: String,
      default: null,
    },
    inviteTokenExpires: {
      type: Date,
      default: null,
    },
    sentWellnessReminders: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to ensure coordinates are always populated (prevents validation failures on legacy data)
donorProfileSchema.pre('validate', function (next) {
  if (this.location !== undefined) {
    if (!this.location || typeof this.location !== 'object') {
      this.location = {
        type: 'Point',
        coordinates: [0, 0]
      };
    } else if (!this.location.coordinates || !Array.isArray(this.location.coordinates) || this.location.coordinates.length === 0) {
      this.location.coordinates = [0, 0];
    }
  }
  next();
});

// CRITICAL: Tells MongoDB to create the geospatial index
donorProfileSchema.index({ location: '2dsphere' });

export const DONOR_ORGAN_OPTIONS = ORGAN_OPTIONS;
export const DonorProfile = model('DonorProfile', donorProfileSchema);
