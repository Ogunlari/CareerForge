import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const fileRecordSchema = new Schema(
  {
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storage_key: { type: String, required: true, unique: true },
    original_name: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    sha256: { type: String, required: true, index: true },
    scanned: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

fileRecordSchema.index({ owner_id: 1, created_at: -1 });
fileRecordSchema.index({ sha256: 1, owner_id: 1 });

export type FileRecord = InferSchemaType<typeof fileRecordSchema>;
export const FileRecordModel = model<FileRecord>('FileRecord', fileRecordSchema);
