import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const passwordResetTokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token_hash: { type: String, required: true },
    expires_at: { type: Date, required: true },
    used_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

passwordResetTokenSchema.index({ token_hash: 1 }, { unique: true });
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetToken = InferSchemaType<typeof passwordResetTokenSchema>;
export const PasswordResetTokenModel = model<PasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
