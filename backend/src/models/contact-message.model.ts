import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

export const CONTACT_STATUSES = ['new', 'read'] as const;

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, maxlength: 200, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: CONTACT_STATUSES, default: 'new' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

contactMessageSchema.index({ status: 1, created_at: -1 });

export type ContactMessage = InferSchemaType<typeof contactMessageSchema>;
export const ContactMessageModel = model<ContactMessage>('ContactMessage', contactMessageSchema);
