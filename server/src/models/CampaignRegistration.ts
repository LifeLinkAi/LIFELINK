import { Schema, model } from 'mongoose';

const campaignRegistrationSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'ATTENDED', 'ABSENT', 'DEFERRED'],
      default: 'REGISTERED',
    },
    donationUnits: {
      type: Number,
      default: 0, // In units/pints (e.g. 1 unit = ~450ml)
    },
    donatedAt: {
      type: Date,
    },
    staffNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double registration for the same campaign
campaignRegistrationSchema.index({ campaignId: 1, donorId: 1 }, { unique: true });

export const CampaignRegistration = model('CampaignRegistration', campaignRegistrationSchema);
