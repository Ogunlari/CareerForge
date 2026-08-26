import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { ok, queryString } from '../../utils/http.js';
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
  res.status(201).json({ message: 'Job saved.' });
}

async function unsave(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = saveSchema.parse(req.body);
  await assertIsSelf(user, input.studentId);

  await savedJobsService.unsaveJob(input.studentId, input.jobId);
  res.status(200).json({ message: 'Job removed from saved.' });
}

async function checkSaved(req: Request, res: Response): Promise<void> {
  const saved = await savedJobsService.checkSaved(
    queryString(req.query.studentId),
    queryString(req.query.jobId),
  );
  ok(res, { saved });
}

async function listSaved(req: Request, res: Response): Promise<void> {
  const data = await savedJobsService.listSavedJobs(queryString(req.query.studentId));
  ok(res, data);
}

export const savedJobsRouter = Router();

savedJobsRouter.post('/saved-jobs', requireAuth, validateBody(saveSchema), save);
savedJobsRouter.delete('/saved-jobs', requireAuth, validateBody(saveSchema), unsave);
savedJobsRouter.get('/saved-jobs/check', requireAuth, checkSaved);
savedJobsRouter.get('/saved-jobs', requireAuth, listSaved);
