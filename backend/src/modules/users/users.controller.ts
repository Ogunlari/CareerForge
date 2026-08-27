import type { Request, Response } from 'express';
import { ok, param } from '../../utils/http.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import * as service from './users.service.js';
import { updateProfileSchema } from './users.schemas.js';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const requester = req.user as AuthUser;
  const profile = await service.getProfile(requester, param(req, 'id'));
  ok(res, profile);
}

export async function patchProfile(req: Request, res: Response): Promise<void> {
  const requester = req.user as AuthUser;
  const updates = updateProfileSchema.parse(req.body);
  const profile = await service.patchProfile(requester, param(req, 'id'), updates);
  ok(res, profile);
}

export async function getStudentProfile(req: Request, res: Response): Promise<void> {
  const requester = req.user as AuthUser;
  const student = await service.getStudentProfile(requester, param(req, 'studentId'));
  res.status(200).json(student);
}
