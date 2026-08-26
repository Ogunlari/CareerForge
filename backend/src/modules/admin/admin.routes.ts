import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { JOB_STATUSES } from '../../models/job.model.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { ok, okList } from '../../utils/http.js';
import * as adminService from './admin.service.js';

const auditSchema = z.object({
  action: z.string().min(1).max(120),
  targetType: z.string().min(1).max(60),
  targetId: z.string().min(1).max(100),
  changes: z.record(z.string(), z.unknown()).default({}),
});

const adminListJobsSchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function listUsersHandler(req: Request, res: Response): Promise<void> {
  const filter = req.query.role ? String(req.query.role) : undefined;
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const result = await adminService.listUsers(filter, cursor);
  ok(res, result.data);
}

async function blockUserHandler(req: Request, res: Response): Promise<void> {
  const userId = String(req.params.userId);
  const user = req.user as { id: string };
  const result = await adminService.blockUser(userId, user.id, userId, req.ip, req.headers['user-agent']);
  ok(res, result.data);
}

async function unblockUserHandler(req: Request, res: Response): Promise<void> {
  const userId = String(req.params.userId);
  const user = req.user as { id: string };
  const result = await adminService.unblockUser(userId, user.id, userId, req.ip, req.headers['user-agent']);
  ok(res, result.data);
}

async function createAuditLogHandler(req: Request, res: Response): Promise<void> {
  const input = auditSchema.parse(req.body);
  const user = req.user as { id: string };
  await adminService.createAuditLog(
    user.id,
    input.action,
    input.targetType,
    input.targetId,
    input.changes,
    req.ip,
    req.headers['user-agent'],
  );
  res.status(201).json({ message: 'Audit log recorded.' });
}

async function listAuditLogsHandler(req: Request, res: Response): Promise<void> {
  const limit = Math.min(200, Number.parseInt(String(req.query.limit ?? '50'), 10) || 50);
  const result = await adminService.listAuditLogs(limit);
  okList(res, result);
}

async function userReportHandler(_req: Request, res: Response): Promise<void> {
  const result = await adminService.userReport();
  ok(res, result);
}

async function applicationReportHandler(_req: Request, res: Response): Promise<void> {
  const result = await adminService.applicationReport();
  ok(res, result);
}

async function platformStatsHandler(_req: Request, res: Response): Promise<void> {
  const result = await adminService.platformStats();
  ok(res, result);
}

async function listAllJobsHandler(req: Request, res: Response): Promise<void> {
  const input = adminListJobsSchema.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.search) {
    const rx = new RegExp(input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }
  const result = await adminService.listAllJobs(filter, input.page, input.limit);
  okList(res, result);
}

export const adminRouter = Router();

adminRouter.use('/admin', requireAuth, requireRole('admin'));

adminRouter.get('/admin/users', listUsersHandler);
adminRouter.patch('/admin/users/:userId/block', blockUserHandler);
adminRouter.patch('/admin/users/:userId/unblock', unblockUserHandler);
adminRouter.post('/admin/audit-logs', validateBody(auditSchema), createAuditLogHandler);
adminRouter.get('/admin/audit-logs', listAuditLogsHandler);
adminRouter.get('/admin/reports/users', userReportHandler);
adminRouter.get('/admin/reports/applications', applicationReportHandler);
adminRouter.get('/admin/stats', platformStatsHandler);
adminRouter.get('/admin/jobs', listAllJobsHandler);
