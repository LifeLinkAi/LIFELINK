import { Schema, model } from 'mongoose';

const ORGAN_OPTIONS = ['Kidney', 'Liver', 'Cornea', 'Pancreas', 'Bone Marrow', 'Heart', 'Lung'] as const;

const donorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ── Location fields (donor branch) ───────────────────────────────────────
    // `location` is a plain string (city/address) shown in the UI.
    // `coordinates` is [longitude, latitude] stored only when the donor provides
    // GPS or manual map coords. default:undefined prevents Mongoose from
    // inserting [] which would fail any 2dsphere index.
    location: {
      type: String,
      default: '',
      trim: true,
    },
    coordinates: {
      type: [Number],
      default: undefined, // keeps field absent on new documents — avoids geo-index errors
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
  },
  {
    timestamps: true,
  }
);

// NOTE: No 2dsphere index is registered here.
// The startup migration in server.ts explicitly drops any stale 2dsphere indexes
// (coordinates_2dsphere, location_2dsphere) from Atlas on every boot, so
// adding one here would immediately re-create the problem.
// Re-enable only after full GeoJSON migration is complete.
// donorProfileSchema.index({ coordinates: '2dsphere' }, { sparse: true });

export const DONOR_ORGAN_OPTIONS = ORGAN_OPTIONS;
export const DonorProfile = model('DonorProfile', donorProfileSchema);
