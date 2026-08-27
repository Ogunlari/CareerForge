import { FilterQuery } from 'mongoose';
import { ApplicationModel, type Application } from '../../models/application.model.js';
import { JobModel } from '../../models/job.model.js';
import { AppError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import { canTransition, listStudentApplicationsQuery } from './applications.schemas.js';
import { createNotification } from '../notifications/notifications.repository.js';

const POPULATE = [
  { path: 'job_id', populate: { path: 'company_id', select: '-__v' } },
  { path: 'student_id', select: '-password_hash -__v' },
];

function serializeApplication(doc: Application & { _id: unknown; toObject(): Record<string, unknown> }) {
  const raw = doc.toObject() as Record<string, unknown>;
  const job = raw.job_id as Record<string, unknown> | null;
  const student = raw.student_id as Record<string, unknown> | null;
  const recruiterId = raw.recruiter_id ? String(raw.recruiter_id) : null;

  return {
    ...raw,
    id: String(raw._id),
    student_id: student ? String(student._id) : String(raw.student_id ?? ''),
    job_id: job ? String(job._id) : null,
    recruiter_id: recruiterId,
    job,
    student,
    _id: undefined,
  };
}

export async function assertCanView(user: AuthUser, app: { student_id?: unknown; recruiter_id?: unknown }): Promise<void> {
  if (user.role === 'admin') return;
  const isStudent = user.role === 'student' && String(app.student_id) === user.id;
  const isRecruiter = user.role === 'recruiter' && (!app.recruiter_id || String(app.recruiter_id) === user.id);
  if (!isStudent && !isRecruiter) {
    throw AppError.forbidden('You cannot view this application.');
  }
}

export async function createApplication(
  user: AuthUser,
  input: { studentId: string; jobId: string; coverLetter?: string; resumeUrl?: string },
) {
  if (user.role !== 'student' || user.id !== input.studentId) {
    throw AppError.forbidden('You can only submit applications as yourself.');
  }

  const job = await JobModel.findById(input.jobId).maxTimeMS(2000);
  if (!job) throw AppError.notFound('Job not found.');
  if (job.status !== 'active') throw AppError.conflict('This job is no longer accepting applications.');

  const existing = await ApplicationModel.findOne({ student_id: input.studentId, job_id: input.jobId }).maxTimeMS(2000);
  if (existing && existing.status !== 'withdrawn') {
    throw AppError.conflict('You have already applied to this job.');
  }
  if (existing && existing.status === 'withdrawn') {
    // Re-apply after withdrawal: reset the same record.
    existing.set({
      status: 'pending',
      cover_letter: input.coverLetter,
      resume_url: input.resumeUrl,
      timeline: [{ status: 'pending', message: 'Re-applied', at: new Date() }],
    });
    await existing.save();
    return serializeApplication(existing as never);
  }

  // Defense-in-depth for the race window between the findOne and the insert.
  // The unconditional unique index on (student_id, job_id) is the authoritative guard;
  // this catch translates the Mongo E11000 error into a clean 409 response.
  let created;
  try {
    created = await ApplicationModel.create({
      student_id: input.studentId,
      job_id: input.jobId,
      recruiter_id: job.recruiter_id,
      cover_letter: input.coverLetter,
      resume_url: input.resumeUrl,
      timeline: [{ status: 'pending', message: 'Application submitted', at: new Date() }],
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      throw AppError.conflict('You have already applied to this job.');
    }
    throw err;
  }

  await JobModel.updateOne({ _id: job._id }, { $inc: { applicants_count: 1 } });

  await createNotification({
    userId: String(job.recruiter_id),
    type: 'application',
    title: 'New application received',
    message: `A new application was submitted for "${job.title}".`,
    relatedId: String(created._id),
  });

  return serializeApplication(created as never);
}

export async function listStudentApplications(query: unknown) {
  const q = listStudentApplicationsQuery.parse(query);
  const filter: FilterQuery<Application> = { student_id: q.studentId };
  if (q.status) filter.status = q.status;
  if (q.date_from || q.date_to) {
    filter.applied_at = {};
    if (q.date_from) (filter.applied_at as Record<string, Date>).$gte = q.date_from;
    if (q.date_to) (filter.applied_at as Record<string, Date>).$lte = q.date_to;
  }

  if (q.cursor) {
    filter._id = { $gt: q.cursor };
    const apps = await ApplicationModel.find(filter)
      .sort({ applied_at: -1 })
      .limit(q.limit)
      .maxTimeMS(3000)
      .populate(POPULATE)
      .exec();
    const total = await ApplicationModel.countDocuments(filter).maxTimeMS(3000);
    const last = apps[apps.length - 1];
    const nextCursor = apps.length === q.limit && last ? String(last._id) : null;
    return {
      data: apps.map((a) => serializeApplication(a as never)),
      nextCursor,
      total,
      limit: q.limit,
    };
  }

  const [apps, total] = await Promise.all([
    ApplicationModel.find(filter)
      .sort({ applied_at: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .maxTimeMS(3000)
      .populate(POPULATE)
      .exec(),
    ApplicationModel.countDocuments(filter).maxTimeMS(3000),
  ]);

  return {
    data: apps.map((a) => serializeApplication(a as never)),
    total,
    page: q.page,
    limit: q.limit,
    pages: Math.ceil(total / q.limit),
  };
}

export async function listRecruiterApplications(recruiterId: string, cursor?: string) {
  const filter: FilterQuery<Application> = { recruiter_id: recruiterId };
  if (cursor) filter._id = { $gt: cursor };
  const query = ApplicationModel.find(filter)
    .sort({ applied_at: -1 })
    .maxTimeMS(3000)
    .populate(POPULATE);
  if (cursor) query.limit(20);
  const apps = await query.exec();
  return apps.map((a) => serializeApplication(a as never));
}

export async function listJobApplications(user: AuthUser, jobId: string) {
  const job = await JobModel.findById(jobId);
  if (!job) throw AppError.notFound('Job not found.');
  if (user.role !== 'admin' && String(job.recruiter_id) !== user.id) {
    throw AppError.forbidden('You can only view applicants for your own jobs.');
  }
  const apps = await ApplicationModel.find({ job_id: jobId }).sort({ applied_at: -1 }).maxTimeMS(3000).populate(POPULATE).exec();
  return apps.map((a) => serializeApplication(a as never));
}

export async function getApplicationById(id: string) {
  const app = await ApplicationModel.findById(id).populate(POPULATE).maxTimeMS(2000);
  if (!app) throw AppError.notFound('Application not found.');
  return serializeApplication(app as never);
}

export async function checkExisting(studentId: string, jobId: string): Promise<boolean> {
  const existing = await ApplicationModel.findOne({
    student_id: studentId,
    job_id: jobId,
    status: { $ne: 'withdrawn' },
  }).maxTimeMS(2000);
  return Boolean(existing);
}

export async function updateStatus(
  user: AuthUser,
  applicationId: string,
  nextStatus: 'reviewing' | 'accepted' | 'rejected' | 'pending',
) {
  if (user.role !== 'recruiter' && user.role !== 'admin') {
    throw AppError.forbidden('Only recruiters can change application status.');
  }

  const app = await ApplicationModel.findById(applicationId).maxTimeMS(2000);
  if (!app) throw AppError.notFound('Application not found.');

  if (user.role === 'recruiter' && String(app.recruiter_id) !== user.id) {
    throw AppError.forbidden('You can only manage applications for your own jobs.');
  }

  if (!canTransition(app.status, nextStatus)) {
    throw new AppError(
      'INVALID_STATE_TRANSITION',
      422,
      `Cannot move application from "${app.status}" to "${nextStatus}".`,
    );
  }

  const previous = app.status;
  app.set('status', nextStatus);
  app.timeline.push({ status: nextStatus, message: `Status changed from ${previous} to ${nextStatus}`, at: new Date() });
  await app.save();

  await createNotification({
    userId: String(app.student_id),
    type: 'application',
    title: 'Application update',
    message: `Your application status changed to "${nextStatus}".`,
    relatedId: String(app._id),
  });

  return getApplicationById(String(app._id));
}

export async function withdraw(user: AuthUser, applicationId: string) {
  const app = await ApplicationModel.findById(applicationId).maxTimeMS(2000);
  if (!app) throw AppError.notFound('Application not found.');

  if (!(user.role === 'student' && String(app.student_id) === user.id) && user.role !== 'admin') {
    throw AppError.forbidden('You can only withdraw your own applications.');
  }
  if (!canTransition(app.status, 'withdrawn')) {
    throw new AppError('INVALID_STATE_TRANSITION', 422, `Cannot withdraw an application in "${app.status}" state.`);
  }

  const previous = app.status;
  app.set('status', 'withdrawn');
  app.timeline.push({ status: 'withdrawn', message: `Withdrawn from ${previous}`, at: new Date() });
  await app.save();

  await JobModel.updateOne({ _id: app.job_id, applicants_count: { $gt: 0 } }, { $inc: { applicants_count: -1 } });
}
