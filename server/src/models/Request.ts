import { Schema, model, Document } from 'mongoose';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface IMatchedDonor {
  donorId: Schema.Types.ObjectId;
  status: 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  inviteToken: string;
  tokenExpiresAt: Date;
  respondedAt?: Date;
}

export interface IRequest extends Document {
  userId: Schema.Types.ObjectId | null;
  requestedBy: Schema.Types.ObjectId;
  patientName?: string;
  facility?: string;
  age?: number;
  gender?: string;
  location?: { type: 'Point'; coordinates: number[] } | null;
  organType?: string;
  bloodGroup: string;
  units?: number;
  urgency: string;
  status: string;
  matchPercentage?: number;
  registeredDate: Date;
  distance?: string;
  facilityType?: string;
  time?: string;
  notes?: string;
  contactPhone?: string; // Added to interface
  type: 'Organ' | 'Blood';
  matchedDonors: IMatchedDonor[];
  notifiedDonors: Schema.Types.ObjectId[];
  assignedDonorId?: Schema.Types.ObjectId | null;
  acceptedDonorId?: Schema.Types.ObjectId | null;
  targetDonorId?: Schema.Types.ObjectId | null;
  hospitalId?: Schema.Types.ObjectId | null;
  timeline?: Array<{ event: string; timestamp: Date }>;
  clinicalEvaluation?: {
    bloodCrossmatch: 'COMPATIBLE_NEGATIVE' | 'INCOMPATIBLE_POSITIVE' | 'PENDING';
    hlaMatchScore: number;
    serologyClear: boolean;
    organFunctionStatus?: 'OPTIMAL' | 'MARGINAL' | 'UNSATISFACTORY';
    notes?: string;
    labReportUrl?: string;
    evaluatedAt?: Date;
    evaluatedBy?: Schema.Types.ObjectId;
    scheduledTestDate?: Date;
    testingFacility?: string;
    donorInstructions?: string;
  };
  surgicalOutcome?: {
    surgeryStartedAt?: Date;
    surgeryCompletedAt?: Date;
    outcome?: 'SUCCESS' | 'FAILED';
    complications?: string;
    patientDischargeDate?: Date;
  };
  legalAgreement?: {
    donorSigned: boolean;
    donorSignatureName?: string;
    donorSignatureDate?: Date;
    donorSignatureData?: string;
    recipientSigned: boolean;
    recipientSignatureName?: string;
    recipientSignatureDate?: Date;
    recipientSignatureData?: string;
    hospitalSigned: boolean;
    hospitalSignatureName?: string;
    hospitalSignedAt?: Date;
    ethicsCommitteeCleared: boolean;
    ethicsCommitteeClearedAt?: Date;
  };
  acceptedBy?: string | null;
  acceptedAt?: Date | null;
  donorId?: Schema.Types.ObjectId | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorBloodType?: string | null;
  rejectedBy: Schema.Types.ObjectId[];
  rejectedAt?: Date | null;
  waitlistId?: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// SCHEMA DEFINITION
// ==========================================

const matchedDonorSchema = new Schema<IMatchedDonor>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['NOTIFIED', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'NOTIFIED',
    },
    inviteToken: {
      type: String,
      required: true,
    },
    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const requestSchema = new Schema<IRequest>(
  {
    // --- CONNECTS THE REQUEST TO A SPECIFIC USER ACCOUNT ---
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // -----------------------------------------------------
    patientName: {
      type: String,
      trim: true,
    },
    facility: {
      type: String,
      trim: true,
    },
    contactPhone: { // Added to schema
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
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredDate: {
      type: Date,
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
    matchedDonors: {
      type: [matchedDonorSchema],
      default: [],
    },
    notifiedDonors: {
      type: [Schema.Types.ObjectId],
      ref: 'DonorProfile',
      default: [],
    },
    assignedDonorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      default: null,
    },
    acceptedDonorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      default: null,
    },
    targetDonorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedBy: {
      type: String,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    waitlistId: {
      type: Schema.Types.ObjectId,
      ref: 'OrganWaitlist',
      default: null,
      index: true,
    },
    timeline: {
      type: [{
        event: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }],
      default: []
    },
    clinicalEvaluation: {
      bloodCrossmatch: { type: String, enum: ['COMPATIBLE_NEGATIVE', 'INCOMPATIBLE_POSITIVE', 'PENDING'], default: 'PENDING' },
      hlaMatchScore: { type: Number, min: 0, max: 6 },
      serologyClear: { type: Boolean, default: false },
      organFunctionStatus: { type: String, enum: ['OPTIMAL', 'MARGINAL', 'UNSATISFACTORY'] },
      notes: { type: String },
      labReportUrl: { type: String },
      evaluatedAt: { type: Date },
      evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      scheduledTestDate: { type: Date },
      testingFacility: { type: String },
      donorInstructions: { type: String }
    },
    surgicalOutcome: {
      surgeryStartedAt: { type: Date },
      surgeryCompletedAt: { type: Date },
      outcome: { type: String, enum: ['SUCCESS', 'FAILED'] },
      complications: { type: String },
      patientDischargeDate: { type: Date }
    },
    legalAgreement: {
      donorSigned: { type: Boolean, default: false },
      donorSignatureName: { type: String },
      donorSignatureDate: { type: Date },
      donorSignatureData: { type: String },
      recipientSigned: { type: Boolean, default: false },
      recipientSignatureName: { type: String },
      recipientSignatureDate: { type: Date },
      recipientSignatureData: { type: String },
      hospitalSigned: { type: Boolean, default: false },
      hospitalSignatureName: { type: String },
      hospitalSignedAt: { type: Date },
      ethicsCommitteeCleared: { type: Boolean, default: false },
      ethicsCommitteeClearedAt: { type: Date }
    },
    donorName: {
      type: String,
      default: null,
    },
    donorEmail: {
      type: String,
      default: null,
    },
    donorBloodType: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'DonorProfile',
      default: [],
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ userId: 1, createdAt: -1 });
requestSchema.index({ status: 1 });
requestSchema.index({ notifiedDonors: 1 });
requestSchema.index({ 'matchedDonors.inviteToken': 1 });
requestSchema.index({ 'matchedDonors.tokenExpiresAt': 1 });
requestSchema.index({ location: '2dsphere' });

export const Request = model<IRequest>('Request', requestSchema);
