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

    // Reverted to plain string location (city/address)
    location: {
      type: String,
      default: '',
      trim: true,
    },

    // ── Profile fields ──────────────────────────────────────
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
    // Donor self-controlled availability
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
  },
  {
    timestamps: true,
  }
);

export const DONOR_ORGAN_OPTIONS = ORGAN_OPTIONS;
export const DonorProfile = model('DonorProfile', donorProfileSchema);