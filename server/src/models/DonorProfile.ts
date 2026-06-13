import { Schema, model } from 'mongoose';

const donorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
    // ADDED: The required location field for GeoJSON
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0], 
      },
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Tells MongoDB to create the geospatial index
donorProfileSchema.index({ location: '2dsphere' });

export const DonorProfile = model('DonorProfile', donorProfileSchema);