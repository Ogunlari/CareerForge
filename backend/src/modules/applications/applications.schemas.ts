import { z } from 'zod';
import { APPLICATION_STATUSES } from '../../models/application.model.js';
import { objectId } from '../../utils/validation.js';

export const createApplicationSchema = z.object({
  studentId: objectId,
  jobId: objectId,
  coverLetter: z.string().max(20000).optional(),
  resumeUrl: z.string().url().max(500).optional(),
});

export const listStudentApplicationsQuery = z.object({
  studentId: objectId,
  status: z.enum(APPLICATION_STATUSES).optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['reviewing', 'accepted', 'rejected', 'pending']),
});

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewing', 'rejected', 'withdrawn'],
  reviewing: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  withdrawn: ['pending'],
};

export function canTransition(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
