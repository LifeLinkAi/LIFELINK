import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientRole: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: any;
  isRead: boolean;
  readAt: Date | null;
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['Donor', 'Hospital', 'Admin', 'User', 'Patient', 'Driver'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'organ_interest_received',
        'clinical_test_scheduled',
        'organ_interest_declined',
        'surgery_approved',
        'clinical_match_failed',
        'legal_deed_ready',
        'donor_deed_signed',
        'surgery_scheduled',
        'transplant_outcome',
        'blood_request_match',
        'donor_pledge_response',
        'blood_donation_complete',
        'wellness_reminder',
        'wellness_log_received',
        'hospital_registration',
        'hospital_status_changed',
        'emergency_broadcast',
        'new_login_alert',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actionUrl: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    delivered: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for the standard inbox query
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

// TTL index: auto-delete read notifications after 30 days
NotificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isRead: true } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
