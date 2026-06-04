import { Schema, model, Types } from 'mongoose';

const donationHistorySchema = new Schema(
  {
    donor: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donationType: {
      type: String,
      enum: ['Whole Blood', 'Platelet', 'Plasma', 'Organ'],
      required: true,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    volumeMl: {
      type: Number,
      default: 450,
    },
    donationDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Cancelled', 'Pending'],
      default: 'Completed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const DonationHistory = model('DonationHistory', donationHistorySchema);
