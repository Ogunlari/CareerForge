import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

export const NOTIFICATION_TYPES = ['application', 'message', 'job', 'profile', 'system'] as const;

const notificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    related_id: { type: String },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

notificationSchema.index({ user_id: 1, is_read: 1 });

export type Notification = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model<Notification>('Notification', notificationSchema);
