import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

export const APPLICATION_STATUSES = ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'] as const;

const timelineEventSchema = new Schema(
  {
    status: { type: String, required: true },
    message: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    recruiter_id: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'pending' },
    cover_letter: { type: String },
    resume_url: { type: String },
    timeline: { type: [timelineEventSchema], default: [] },
  },
  { timestamps: { createdAt: 'applied_at', updatedAt: 'updated_at' } },
);

applicationSchema.index({ student_id: 1, status: 1 });
applicationSchema.index({ job_id: 1 });
applicationSchema.index({ recruiter_id: 1 });
// Unconditional unique pair: the service reuses/resets withdrawn records so there is
// never a legitimate reason to insert a second row for the same student+job.
applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

export type Application = InferSchemaType<typeof applicationSchema>;
export const ApplicationModel = model<Application>('Application', applicationSchema);
