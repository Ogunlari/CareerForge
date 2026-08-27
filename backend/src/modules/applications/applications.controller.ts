import type { Request, Response } from 'express';
import { ok, okList, okMessage, param, queryString } from '../../utils/http.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import { AppError } from '../../utils/errors.js';
import * as service from './applications.service.js';
import { createApplicationSchema } from './applications.schemas.js';

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = createApplicationSchema.parse(req.body);
  const application = await service.createApplication(user, input);
  ok(res, application, 201);
}

export async function listStudent(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const requested = queryString(req.query.studentId);
  if (requested && requested !== user.id && user.role !== 'admin') {
    throw AppError.forbidden('You can only view your own applications.');
  }
  // Ownership is forced server-side; admins may inspect another student via ?studentId=.
  const studentId = requested && user.role === 'admin' ? requested : user.id;
  const result = await service.listStudentApplications({ ...req.query, studentId });
  res.status(200).json(result);
}

export async function listRecruiter(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const recruiterId = queryString(req.query.recruiterId) || user.id;
  if (recruiterId !== user.id && user.role !== 'admin') {
    throw AppError.forbidden('You can only view your own applicants.');
  }
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const applications = await service.listRecruiterApplications(recruiterId, cursor);
  ok(res, applications);
}

export async function jobApplications(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const applications = await service.listJobApplications(user, param(req, 'jobId'));
  ok(res, applications);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const application = await service.getApplicationById(param(req, 'applicationId'));
  await service.assertCanView(user, { student_id: application.student_id, recruiter_id: application.recruiter_id });
  ok(res, application);
}

export async function checkExisting(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const studentId = user.role === 'admin' ? queryString(req.query.studentId) : user.id;
  if (!studentId) {
    throw AppError.badRequest('studentId is required.');
  }
  const exists = await service.checkExisting(studentId, queryString(req.query.jobId));
  ok(res, { exists });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const application = await service.updateStatus(
    user,
    param(req, 'applicationId'),
    req.body.status as 'reviewing' | 'accepted' | 'rejected' | 'pending',
  );
  ok(res, application);
}

export async function withdraw(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  await service.withdraw(user, param(req, 'applicationId'));
  okMessage(res, 'Application withdrawn.');
}
