import { Schema, model } from 'mongoose';

/**
 * Tracks a donor's response to a specific blood/organ request.
 * Kept separate from the Request model to avoid coupling donor
 * acknowledgements to the hospital-facing request lifecycle.
 */
const donorResponseSchema = new Schema(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING',
      required: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each donor can only have one response per request
donorResponseSchema.index({ donorId: 1, requestId: 1 }, { unique: true });

export const DonorResponse = model('DonorResponse', donorResponseSchema);
