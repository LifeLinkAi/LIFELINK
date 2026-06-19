import { Schema, model, Document } from 'mongoose';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type OrganType =
  | 'Kidney'
  | 'Liver Segment'
  | 'Cornea'
  | 'Heart'
  | 'Lung'
  | 'Pancreas'
  | 'Bone Marrow';

export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type WaitlistStatus =
  | 'Waitlisted'
  | 'Match Found'
  | 'Surgery Scheduled'
  | 'Completed'
  | 'Withdrawn';

export interface IOrganWaitlist extends Document {
  // Links
  hospitalId: Schema.Types.ObjectId;       // ref: 'User' (Hospital)

  // Patient Profile
  fullName:    string;
  age:         number;
  gender:      'Male' | 'Female' | 'Other';
  contact:     string;

  // Clinical
  requiredOrgan: OrganType;
  bloodGroup:    string;
  urgency:       UrgencyLevel;

  // Medical Documentation
  medicalCertificateUrl: string;
  medicalHistory:        string;
  comorbidities:         string;

  // Lifecycle
  status: WaitlistStatus;

  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// SCHEMA DEFINITION
// ==========================================

const organWaitlistSchema = new Schema<IOrganWaitlist>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // --- Patient Profile ---
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },

    // --- Clinical Data ---
    requiredOrgan: {
      type: String,
      enum: ['Kidney', 'Liver Segment', 'Cornea', 'Heart', 'Lung', 'Pancreas', 'Bone Marrow'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
      default: 'Medium',
    },

    // --- Medical Documentation ---
    medicalCertificateUrl: {
      type: String,
      required: true,
      trim: true,
    },
    medicalHistory: {
      type: String,
      default: '',
      trim: true,
    },
    comorbidities: {
      type: String,
      default: '',
      trim: true,
    },

    // --- Lifecycle ---
    status: {
      type: String,
      enum: ['Waitlisted', 'Match Found', 'Surgery Scheduled', 'Completed', 'Withdrawn'],
      default: 'Waitlisted',
    },
  },
  {
    timestamps: true,
  }
);

organWaitlistSchema.index({ hospitalId: 1, createdAt: -1 });
organWaitlistSchema.index({ requiredOrgan: 1, bloodGroup: 1, status: 1 });

export const OrganWaitlist = model<IOrganWaitlist>('OrganWaitlist', organWaitlistSchema);
