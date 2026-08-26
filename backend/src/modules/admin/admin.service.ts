import { UserModel } from '../../models/user.model.js';
import { AuditLogModel } from '../../models/audit-log.model.js';
import { ApplicationModel } from '../../models/application.model.js';
import { CompanyModel } from '../../models/company.model.js';
import { JobModel } from '../../models/job.model.js';
import { AppError } from '../../utils/errors.js';
import type mongoose from 'mongoose';
import { serializeJob } from '../jobs/jobs.service.js';

type JobDoc = mongoose.Document & Record<string, unknown>;

export interface ListUsersResult {
  data: Array<Record<string, unknown>>;
}

export interface BlockUserResult {
  data: Record<string, unknown>;
}

export interface ListAuditLogsResult {
  data: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UserReportResult {
  id: string;
  type: string;
  data: { total: number; byRole: Array<{ _id: string; count: number }> };
  generated_at: string;
}

export interface ApplicationReportResult {
  id: string;
  type: string;
  data: { total: number; byStatus: Array<{ _id: string; count: number }> };
  generated_at: string;
}

export interface PlatformStatsResult {
  users: { total: number; byRole: Array<{ _id: string; count: number }> };
  jobs: { total: number; active: number };
  applications: { total: number; byStatus: Array<{ _id: string; count: number }> };
  companies: { total: number };
}

export interface ListAllJobsResult {
  data: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function listUsers(filter?: string, cursor?: string): Promise<ListUsersResult> {
  const query: Record<string, unknown> = filter ? { role: filter } : {};
  if (cursor) query._id = { $gt: cursor };
  const q = UserModel.find(query).select('-password_hash').sort({ created_at: -1 }).maxTimeMS(5000);
  if (cursor) q.limit(500);
  const users = await q;
  return {
    data: users.map((u) => ({ ...u.toObject(), id: String(u._id), _id: undefined })),
  };
}

export async function writeAudit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  changes: unknown,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  await AuditLogModel.create({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    changes,
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function blockUser(
  userId: string,
  adminId: string,
  requestId: string,
  ip?: string,
  userAgent?: string,
): Promise<BlockUserResult> {
  const user = await UserModel.findByIdAndUpdate(userId, { is_blocked: true }, { new: true }).select('-password_hash');
  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found.');
  }
  await writeAudit(adminId, 'block_user', 'user', userId, { is_blocked: true }, ip, userAgent);
  return { data: user.toObject() };
}

export async function unblockUser(
  userId: string,
  adminId: string,
  requestId: string,
  ip?: string,
  userAgent?: string,
): Promise<BlockUserResult> {
  const user = await UserModel.findByIdAndUpdate(userId, { is_blocked: false }, { new: true }).select('-password_hash');
  if (!user) {
    throw new AppError('NOT_FOUND', 404, 'User not found.');
  }
  await writeAudit(adminId, 'unblock_user', 'user', userId, { is_blocked: false }, ip, userAgent);
  return { data: user.toObject() };
}

export async function createAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  changes: Record<string, unknown>,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  await writeAudit(adminId, action, targetType, targetId, changes, ip, userAgent);
}

export async function listAuditLogs(limit: number): Promise<ListAuditLogsResult> {
  const cappedLimit = Math.min(200, limit);
  const logs = await AuditLogModel.find().sort({ created_at: -1 }).limit(cappedLimit).populate('admin_id', 'full_name email');
  return {
    data: logs.map((l) => ({ ...l.toObject(), id: String(l._id), _id: undefined })),
    total: logs.length,
    page: 1,
    limit: cappedLimit,
    pages: 1,
  };
}

export async function userReport(): Promise<UserReportResult> {
  const [total, byRole] = await Promise.all([
    UserModel.countDocuments().maxTimeMS(5000),
    UserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]).option({ maxTimeMS: 5000 }),
  ]);
  return { id: `report_users_${Date.now()}`, type: 'users', data: { total, byRole }, generated_at: new Date().toISOString() };
}

export async function applicationReport(): Promise<ApplicationReportResult> {
  const [byStatus, total] = await Promise.all([
    ApplicationModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).option({ maxTimeMS: 5000 }),
    ApplicationModel.countDocuments().maxTimeMS(5000),
  ]);
  return { id: `report_applications_${Date.now()}`, type: 'applications', data: { total, byStatus }, generated_at: new Date().toISOString() };
}

export async function platformStats(): Promise<PlatformStatsResult> {
  const [usersByRole, usersTotal, jobsTotal, jobsActive, appsByStatus, appsTotal, companiesTotal] =
    await Promise.all([
      UserModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]).option({ maxTimeMS: 5000 }),
      UserModel.countDocuments().maxTimeMS(5000),
      JobModel.countDocuments().maxTimeMS(5000),
      JobModel.countDocuments({ status: 'active' }).maxTimeMS(5000),
      ApplicationModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).option({ maxTimeMS: 5000 }),
      ApplicationModel.countDocuments().maxTimeMS(5000),
      CompanyModel.countDocuments().maxTimeMS(5000),
    ]);

  return {
    users: { total: usersTotal, byRole: usersByRole },
    jobs: { total: jobsTotal, active: jobsActive },
    applications: { total: appsTotal, byStatus: appsByStatus },
    companies: { total: companiesTotal },
  };
}

export async function listAllJobs(
  filter: Record<string, unknown>,
  page: number,
  limit: number,
): Promise<ListAllJobsResult> {
  const [jobs, total] = await Promise.all([
    JobModel.find(filter)
      .sort({ posted_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .maxTimeMS(5000)
      .populate('company_id', '-__v')
      .exec(),
    JobModel.countDocuments(filter).maxTimeMS(5000),
  ]);

  return {
    data: jobs.map((job) => serializeJob(job as unknown as JobDoc)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}
