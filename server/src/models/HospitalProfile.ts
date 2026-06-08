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
    governmentLicenseId: {
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
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    accreditation: {
      type: String,
      default: '',
      trim: true,
    },
    hospitalLicenseUrl: {
      type: String,
      default: '',
    },
    kidneyTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    liverTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    heartTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    lungTransplantLicenseUrl: {
      type: String,
      default: '',
    },
    contactPerson: {
      name: { type: String, default: '' },
      designation: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
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
