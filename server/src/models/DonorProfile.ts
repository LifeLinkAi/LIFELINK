import { Schema, model } from 'mongoose';

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
  },
  {
    timestamps: true,
  }
);

export const DonorProfile = model('DonorProfile', donorProfileSchema);
