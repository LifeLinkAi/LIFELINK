import { Schema, model } from 'mongoose';

/**
 * Records a completed or pending donation event for a donor.
 * Serves as the source of truth for the donor's history page
 * and stats (lives impacted, total volume, frequency).
 */
const donationRecordSchema = new Schema(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional link to the originating request (may be null for manually added records)
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      default: null,
    },
    donationType: {
      type: String,
      enum: ['Blood', 'Platelet', 'Plasma', 'Organ'],
      required: true,
    },
    bloodType: {
      type: String,
      trim: true,
      default: '',
    },
    facility: {
      type: String,
      trim: true,
      default: '',
    },
    donationDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Pending',
      required: true,
    },
    // Volume in millilitres (450 = standard whole blood unit)
    volumeMl: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

donationRecordSchema.index({ donorId: 1, donationDate: -1 });

export const DonationRecord = model('DonationRecord', donationRecordSchema);
