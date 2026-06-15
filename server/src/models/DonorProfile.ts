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
    location: {
      type: String,
      default: '',
      trim: true,
    },
    // [longitude, latitude] — only stored when donor provides GPS/manual coords
    // Uses a sparse 2dsphere index so documents without coordinates are skipped.
    // IMPORTANT: default must be `undefined` (not []) so Mongoose does NOT insert
    // an empty array. An empty array fails the 2dsphere index validation.
    coordinates: {
      type: [Number],
      default: undefined, // prevents Mongoose from inserting [] on new documents
      // No default — field is absent on documents that have no location set.
    },
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

// Sparse 2dsphere index kept off intentionally.
// Add via Atlas only after ensuring no documents have coordinates: []
// donorProfileSchema.index({ coordinates: '2dsphere' }, { sparse: true });

export const DONOR_ORGAN_OPTIONS = ORGAN_OPTIONS;
export const DonorProfile = model('DonorProfile', donorProfileSchema);

