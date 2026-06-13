import { Schema, model } from 'mongoose';

const campaignSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['EMERGENCY DRIVE', 'ROUTINE DRIVE', 'AWARENESS'],
      default: 'ROUTINE DRIVE',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'UPCOMING', 'DRAFT', 'ENDED'],
      default: 'DRAFT',
    },
    hospital: {
      type: String,
      trim: true,
    },
    venueType: {
      type: String,
      enum: ['HOSPITAL', 'SCHOOL', 'PUBLIC_PLACE', 'OFFICE', 'COMMUNITY_CENTER'],
      default: 'HOSPITAL',
    },
    venueName: {
      type: String,
      trim: true,
      default: '',
    },
    venueAddress: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    bloodGroups: {
      type: [String],
      default: ['ANY'],
    },
    donorsRegistered: {
      type: Number,
      default: 0,
    },
    donorsTarget: {
      type: Number,
      default: 100,
    },
    donationsCollected: {
      type: Number,
      default: 0,
    },
    engagement: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Campaign = model('Campaign', campaignSchema);
