import { Schema, model, Types } from 'mongoose';

const donorProfileSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isEmergencyMode: {
      type: Boolean,
      default: false,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    livesImpacted: {
      type: Number,
      default: 0,
    },
    availabilityRadius: {
      type: Number,
      default: 10, // miles
    },
    bloodDonationEnabled: {
      type: Boolean,
      default: true,
    },
    organDonationEnabled: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const DonorProfile = model('DonorProfile', donorProfileSchema);
