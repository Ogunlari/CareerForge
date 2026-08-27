import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import * as controller from './users.controller.js';
import { updateProfileSchema } from './users.schemas.js';

export const usersRouter = Router();

usersRouter.get('/profiles/:id', requireAuth, controller.getProfile);
usersRouter.patch('/profiles/:id', requireAuth, validateBody(updateProfileSchema), controller.patchProfile);
usersRouter.get('/students/:studentId', requireAuth, requireRole('recruiter', 'admin'), controller.getStudentProfile);
