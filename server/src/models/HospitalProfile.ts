import { Schema, model } from 'mongoose';

const hospitalProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseId: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    specialties: {
      type: [String],
      default: ['General'],
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended', 'Verified'],
      default: 'Pending',
    },
    patientCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Schema.Types.Mixed,
      default: '--',
    },
    bloodHealthStatus: {
      type: String,
      enum: ['Optimal', 'Stable', 'Critical'],
      default: 'Stable',
    },
  },
  {
    timestamps: true,
  }
);

export const HospitalProfile = model('HospitalProfile', hospitalProfileSchema);
