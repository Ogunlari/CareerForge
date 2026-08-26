import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'] as const;
export const JOB_STATUSES = ['active', 'closed', 'draft'] as const;
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead'] as const;

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    job_type: { type: String, enum: JOB_TYPES, required: true },
    salary_min: { type: Number },
    salary_max: { type: Number },
    currency: { type: String, default: 'USD' },
    experience_level: { type: String, enum: EXPERIENCE_LEVELS, default: 'entry' },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    recruiter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: JOB_STATUSES, default: 'active' },
    posted_at: { type: Date, default: Date.now },
    deadline: { type: Date },
    applicants_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

jobSchema.index({ status: 1, posted_at: -1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ company_id: 1 });
jobSchema.index({ recruiter_id: 1 });
jobSchema.index({ location: 1 });

export type Job = InferSchemaType<typeof jobSchema>;
export const JobModel = model<Job>('Job', jobSchema);
