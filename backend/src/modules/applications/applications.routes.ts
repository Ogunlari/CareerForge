import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import * as controller from './applications.controller.js';
import { createApplicationSchema, updateApplicationStatusSchema } from './applications.schemas.js';

export const applicationsRouter = Router();

applicationsRouter.post(
  '/applications',
  requireAuth,
  validateBody(createApplicationSchema),
  controller.create,
);
applicationsRouter.get('/applications/recruiter', requireAuth, controller.listRecruiter);
applicationsRouter.get('/applications/check', requireAuth, controller.checkExisting);
applicationsRouter.get('/applications/student', requireAuth, controller.listStudent);
applicationsRouter.patch(
  '/applications/:applicationId/status',
  requireAuth,
  validateBody(updateApplicationStatusSchema),
  controller.updateStatus,
);
applicationsRouter.patch('/applications/:applicationId/withdraw', requireAuth, controller.withdraw);
applicationsRouter.get('/applications/:applicationId', requireAuth, controller.getById);
applicationsRouter.get('/jobs/:jobId/applications', requireAuth, controller.jobApplications);
