import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const savedJobSchema = new Schema(
  {
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  },
  { timestamps: { createdAt: 'saved_at', updatedAt: 'saved_at' } },
);

savedJobSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

export type SavedJob = InferSchemaType<typeof savedJobSchema>;
export const SavedJobModel = model<SavedJob>('SavedJob', savedJobSchema);
