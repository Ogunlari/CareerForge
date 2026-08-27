import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { ok, okMessage, queryString } from '../../utils/http.js';
import { AppError } from '../../utils/errors.js';
import { objectId } from '../../utils/validation.js';
import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.types.js';
import * as savedJobsService from './saved-jobs.service.js';

const saveSchema = z.object({
  studentId: objectId,
  jobId: objectId,
});

async function assertIsSelf(user: AuthUser, studentId: string): Promise<void> {
  if (user.role !== 'student' || user.id !== studentId) {
    throw AppError.forbidden('You can only manage your own saved jobs.');
  }
}

async function save(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = saveSchema.parse(req.body);
  await assertIsSelf(user, input.studentId);

  await savedJobsService.saveJob(input.studentId, input.jobId);
  okMessage(res, 'Job saved.', 201);
}

async function unsave(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = saveSchema.parse(req.body);
  await assertIsSelf(user, input.studentId);

  await savedJobsService.unsaveJob(input.studentId, input.jobId);
  okMessage(res, 'Job removed from saved.');
}

async function checkSaved(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  if (user.role !== 'student') {
    throw AppError.forbidden('Only students can check saved jobs.');
  }
  const saved = await savedJobsService.checkSaved(
    user.id,
    queryString(req.query.jobId),
  );
  ok(res, { saved });
}

async function listSaved(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  if (user.role !== 'student') {
    throw AppError.forbidden('Only students can list saved jobs.');
  }
  const data = await savedJobsService.listSavedJobs(user.id);
  ok(res, data);
}

export const savedJobsRouter = Router();

savedJobsRouter.post('/saved-jobs', requireAuth, validateBody(saveSchema), save);
savedJobsRouter.post('/saved-jobs/unsave', requireAuth, validateBody(saveSchema), unsave);
savedJobsRouter.get('/saved-jobs/check', requireAuth, checkSaved);
savedJobsRouter.get('/saved-jobs', requireAuth, listSaved);
