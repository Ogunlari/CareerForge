import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    admin_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    target_type: { type: String, required: true },
    target_id: { type: String, required: true },
    changes: { type: Schema.Types.Mixed, default: {} },
    ip_address: { type: String },
    user_agent: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

auditLogSchema.index({ created_at: -1 });
auditLogSchema.index({ admin_id: 1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema>;
export const AuditLogModel = model<AuditLog>('AuditLog', auditLogSchema);
