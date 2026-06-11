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
  type: 'Organ' | 'Blood';
  matchedDonors: IMatchedDonor[];
  acceptedDonorId?: Schema.Types.ObjectId | null;
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
      ref: 'User',
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
      default: null, // Left optional so legacy Admin-created requests don't break
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
      type: Date, // Changed from String to Date to match standard JS Date instances smoothly
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
    // --- NEW: DONOR MATCHING & DEEP LINKING ---
    matchedDonors: {
      type: [matchedDonorSchema],
      default: [],
    },
    acceptedDonorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // GeoJSON location for spatial queries (e.g., $near)
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
    // ----------------------------------------
  },
  {
    timestamps: true,
  }
);

// Create indexes for fast queries on common operations
requestSchema.index({ userId: 1, createdAt: -1 });
requestSchema.index({ status: 1 });
requestSchema.index({ 'matchedDonors.inviteToken': 1 });
requestSchema.index({ 'matchedDonors.tokenExpiresAt': 1 });
// 2dsphere index on location for geo queries
requestSchema.index({ location: '2dsphere' });

export const Request = model<IRequest>('Request', requestSchema);