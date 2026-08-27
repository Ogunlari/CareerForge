import type { Request, Response } from 'express';
import { ok, okList, param, queryString } from '../../utils/http.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import * as service from './jobs.service.js';
import { createJobSchema, listJobsQuerySchema, listMyJobsQuerySchema, updateJobSchema } from './jobs.schemas.js';

export async function listJobs(req: Request, res: Response): Promise<void> {
  const query = listJobsQuerySchema.parse(req.query);
  const result = await service.listJobs(query);
  okList(res, result);
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const job = await service.getJobById(param(req, 'jobId'));
  ok(res, job);
}

export async function getRecommended(req: Request, res: Response): Promise<void> {
  const jobs = await service.getRecommendedJobs(queryString(req.query.studentId) || (req.user as AuthUser)?.id || '');
  ok(res, jobs);
}

export async function getMyJobs(req: Request, res: Response): Promise<void> {
  const query = listMyJobsQuerySchema.parse(req.query);
  const result = await service.listMyJobs(req.user as AuthUser, query);
  okList(res, result);
}

export async function postJob(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = createJobSchema.parse(req.body);
  const job = await service.createJob(user, input);
  ok(res, job, 201);
}

export async function patchJob(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const updates = updateJobSchema.parse(req.body);
  const job = await service.updateJob(user, param(req, 'jobId'), updates);
  ok(res, job);
}

export async function removeJob(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  await service.deleteJob(user, param(req, 'jobId'));
  res.status(204).send();
}
