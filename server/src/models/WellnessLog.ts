import { Schema, model } from 'mongoose';

const wellnessLogSchema = new Schema(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    organType: {
      type: String,
      required: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      creatinine: { type: Number, default: null },
      gfr: { type: Number, default: null },
      alt: { type: Number, default: null },
      ast: { type: Number, default: null },
      bilirubin: { type: Number, default: null },
      systolicBP: { type: Number, default: null },
      diastolicBP: { type: Number, default: null },
      energyLevel: { type: Number, default: null },
    },
    notes: {
      type: String,
      default: '',
    },
    reportUrl: {
      type: String,
      default: '',
    },
    reportName: {
      type: String,
      default: '',
    },
    milestone: {
      type: String,
      enum: ['1_MONTH', '6_MONTH', '1_YEAR', '2_YEAR', 'UNSCHEDULED'],
      default: 'UNSCHEDULED',
    },
    status: {
      type: String,
      enum: ['Logged', 'Hospital_Verified', 'Flagged'],
      default: 'Logged',
    },
  },
  {
    timestamps: true,
  }
);

export const WellnessLog = model('WellnessLog', wellnessLogSchema);
