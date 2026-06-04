import { Schema, model } from 'mongoose';

const requestSchema = new Schema(
  {
    patientName: {
      type: String,
      trim: true,
    },
    facility: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    organType: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      trim: true,
    },
    units: {
      type: Number,
    },
    urgency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    matchPercentage: {
      type: Number,
      default: null,
    },
    registeredDate: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      default: '',
    },
    facilityType: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['Organ', 'Blood'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Request = model('Request', requestSchema);

