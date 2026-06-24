import { Schema, model, Document } from 'mongoose';

export interface IBloodBag extends Document {
  bagId: string; // Unique serial, e.g. "BAG-2026-A109"
  hospitalId: Schema.Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  componentType: 'WHOLE_BLOOD' | 'RBC' | 'PLASMA' | 'PLATELETS';
  volumeMl: number; // Default ~450
  collectionDate: Date;
  expirationDate: Date;
  status: 'AVAILABLE' | 'RESERVED' | 'TRANSFUSED' | 'EXPIRED' | 'DISCARDED';
  donorId?: Schema.Types.ObjectId; // Optional link to DonorProfile
}

const bloodBagSchema = new Schema<IBloodBag>(
  {
    bagId: { type: String, required: true, unique: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    componentType: {
      type: String,
      enum: ['WHOLE_BLOOD', 'RBC', 'PLASMA', 'PLATELETS'],
      required: true,
    },
    volumeMl: { type: Number, default: 450 },
    collectionDate: { type: Date, default: Date.now },
    expirationDate: { type: Date },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'TRANSFUSED', 'EXPIRED', 'DISCARDED'],
      default: 'AVAILABLE',
    },
    donorId: { type: Schema.Types.ObjectId, ref: 'DonorProfile' },
  },
  {
    timestamps: true,
  }
);

bloodBagSchema.pre('save', function (next) {
  if (!this.expirationDate && this.collectionDate) {
    const colDate = new Date(this.collectionDate);
    if (this.componentType === 'WHOLE_BLOOD' || this.componentType === 'RBC') {
      // 42 days
      colDate.setDate(colDate.getDate() + 42);
    } else if (this.componentType === 'PLATELETS') {
      // 5 days
      colDate.setDate(colDate.getDate() + 5);
    } else if (this.componentType === 'PLASMA') {
      // 365 days
      colDate.setDate(colDate.getDate() + 365);
    }
    this.expirationDate = colDate;
  }
  next();
});

export const BloodBag = model<IBloodBag>('BloodBag', bloodBagSchema);
