import { z } from 'zod';
import { EXPERIENCE_LEVELS, JOB_STATUSES, JOB_TYPES } from '../../models/job.model.js';
import { objectId } from '../../utils/validation.js';

export const listJobsQuerySchema = z.object({
  search: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  job_type: z.enum(JOB_TYPES).optional(),
  experience_level: z.enum(EXPERIENCE_LEVELS).optional(),
  salary_min: z.coerce.number().nonnegative().optional(),
  salary_max: z.coerce.number().nonnegative().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  recruiter_id: objectId.optional(),
  company_id: objectId.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(20000),
  location: z.string().max(200).optional(),
  job_type: z.enum(JOB_TYPES),
  salary_min: z.number().nonnegative().optional(),
  salary_max: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  experience_level: z.enum(EXPERIENCE_LEVELS).default('entry'),
  requirements: z.array(z.string().max(300)).max(30).optional(),
  benefits: z.array(z.string().max(300)).max(30).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  responsibilities: z.array(z.string().max(300)).max(30).optional(),
  deadline: z.coerce.date().optional(),
});

export const updateJobSchema = createJobSchema
  .partial()
  .extend({ status: z.enum(JOB_STATUSES).optional() })
  .strict();

export const listMyJobsQuerySchema = listJobsQuerySchema.pick({ status: true, page: true, limit: true });

export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
export type ListMyJobsQuery = z.infer<typeof listMyJobsQuerySchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
