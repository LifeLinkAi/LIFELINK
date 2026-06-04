import { Schema, model, Types } from 'mongoose';

const bloodRequestSchema = new Schema(
  {
    requestedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Standard'],
      default: 'Standard',
    },
    hospitalName: {
      type: String,
      required: true,
    },
    hospitalAddress: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Dismissed'],
      default: 'Pending',
    },
    acceptedBy: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export const BloodRequest = model('BloodRequest', bloodRequestSchema);
