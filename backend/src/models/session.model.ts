import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const sessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token_family: { type: String, required: true },
    refresh_token_hash: { type: String, required: true },
    access_token_jti: { type: String, required: true },
    user_agent: { type: String, default: '' },
    ip_address: { type: String, default: '' },
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date },
    replaced_by_token_hash: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

sessionSchema.index({ user_id: 1 });
sessionSchema.index({ refresh_token_hash: 1 }, { unique: true });
sessionSchema.index({ token_family: 1 });
sessionSchema.index({ access_token_jti: 1 }, { unique: true });
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export type Session = InferSchemaType<typeof sessionSchema>;
export const SessionModel = model<Session>('Session', sessionSchema);
