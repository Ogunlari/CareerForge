import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import * as controller from './jobs.controller.js';
import { createJobSchema, updateJobSchema } from './jobs.schemas.js';

export const jobsRouter = Router();

jobsRouter.get('/jobs', controller.listJobs);
jobsRouter.get('/jobs/recommended', requireAuth, controller.getRecommended);
jobsRouter.get('/jobs/mine', requireAuth, requireRole('recruiter', 'admin'), controller.getMyJobs);
jobsRouter.post('/jobs', requireAuth, requireRole('recruiter', 'admin'), validateBody(createJobSchema), controller.postJob);
jobsRouter.get('/jobs/:jobId', controller.getJob);
jobsRouter.patch(
  '/jobs/:jobId',
  requireAuth,
  requireRole('recruiter', 'admin'),
  validateBody(updateJobSchema),
  controller.patchJob,
);
jobsRouter.delete('/jobs/:jobId', requireAuth, requireRole('recruiter', 'admin'), controller.removeJob);
