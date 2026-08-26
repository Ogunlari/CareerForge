import mongoose from 'mongoose';
import { JobModel } from '../../models/job.model.js';
import { UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import {
  buildJobFilter,
  countJobs,
  findByRecruiter,
  findActiveJobsForRecommendation,
  searchJobs,
  findJobById,
} from './jobs.repository.js';
import type { CreateJobInput, ListJobsQuery, ListMyJobsQuery } from './jobs.schemas.js';

type JobDoc = mongoose.Document & Record<string, unknown>;

export function serializeJob(job: JobDoc) {
  const raw = job.toObject({ virtuals: false }) as Record<string, unknown>;
  const company = raw.company_id as Record<string, unknown> | null;

  return {
    ...raw,
    id: String(raw._id),
    company_id: company ? String(company._id) : null,
    company,
    recruiter_id: raw.recruiter_id ? String(raw.recruiter_id) : null,
    _id: undefined,
  };
}

function assertCanManage(job: { recruiter_id?: string }, user: AuthUser): void {
  const owns = job.recruiter_id && String(job.recruiter_id) === user.id;
  if (!owns && user.role !== 'admin') {
    throw AppError.forbidden('You can only manage your own job postings.');
  }
}

export async function listJobs(query: ListJobsQuery) {
  const filter = await buildJobFilter(query);
  const [jobs, total] = await Promise.all([searchJobs(filter, query.page, query.limit), countJobs(filter)]);

  return {
    data: jobs.map((job) => serializeJob(job as JobDoc)),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
  };
}

export async function getJobById(id: string) {
  if (!mongoose.isValidObjectId(id)) throw AppError.notFound('Job not found.');
  const job = await findJobById(id);
  if (!job) throw AppError.notFound('Job not found.');
  return serializeJob(job as JobDoc);
}

export async function getRecommendedJobs(studentId: string) {
  let studentSkills: string[] = [];
  if (studentId) {
    const student = await UserModel.findById(studentId).select('skills location').lean().exec();
    if (student?.skills?.length) {
      studentSkills = student.skills.map((s: string) => s.toLowerCase());
    }
  }

  const jobs = await findActiveJobsForRecommendation(200);

  if (!studentSkills.length) {
    return jobs.slice(0, 10).map((job) => serializeJob(job as JobDoc));
  }

  const scored = jobs.map((job) => {
    const raw = job.toObject({ virtuals: false }) as Record<string, unknown>;
    const tags = (raw.tags as string[]) || [];
    const requirements = (raw.requirements as string[]) || [];
    const jobTerms = [...tags, ...requirements].map((t: string) => t.toLowerCase());

    let score = 0;
    for (const skill of studentSkills) {
      for (const term of jobTerms) {
        if (term === skill || term.includes(skill) || skill.includes(term)) {
          score += 1;
          break;
        }
      }
    }

    return { job, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = (a.job as JobDoc).posted_at as unknown as string | undefined;
    const bDate = (b.job as JobDoc).posted_at as unknown as string | undefined;
    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
  });

  return scored.slice(0, 10).map(({ job }) => serializeJob(job as JobDoc));
}

export async function listMyJobs(user: AuthUser, query: ListMyJobsQuery) {
  if (user.role !== 'recruiter' && user.role !== 'admin') {
    throw AppError.forbidden('Only recruiters can list their job postings.');
  }

  const { jobs, total } = await findByRecruiter(user.id, query.status, query.page, query.limit);

  return {
    data: jobs.map((job) => serializeJob(job as JobDoc)),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
  };
}

export async function createJob(user: AuthUser, input: CreateJobInput) {
  if (user.role !== 'recruiter' && user.role !== 'admin') {
    throw AppError.forbidden('Only recruiters can post jobs.');
  }

  const recruiter = await UserModel.findById(user.id);
  if (!recruiter?.company_id) {
    throw AppError.badRequest(
      'Your account has no linked company. Create one first (POST /companies), then link it via PATCH /profiles/:id.',
    );
  }

  const job = await JobModel.create({
    ...input,
    company_id: recruiter.company_id,
    recruiter_id: user.id,
    status: 'active',
  });

  return getJobById(String(job._id));
}

export async function updateJob(user: AuthUser, jobId: string, updates: Record<string, unknown>) {
  const job = await JobModel.findById(jobId);
  if (!job) throw AppError.notFound('Job not found.');
  assertCanManage({ recruiter_id: job.recruiter_id ? String(job.recruiter_id) : undefined }, user);

  const allowed = [
    'title',
    'description',
    'location',
    'job_type',
    'salary_min',
    'salary_max',
    'currency',
    'experience_level',
    'requirements',
    'benefits',
    'tags',
    'responsibilities',
    'deadline',
    'status',
  ];

  for (const key of allowed) {
    if (updates[key] !== undefined) (job as unknown as Record<string, unknown>)[key] = updates[key];
  }
  await job.save();
  return getJobById(jobId);
}

export async function deleteJob(user: AuthUser, jobId: string) {
  const job = await JobModel.findById(jobId);
  if (!job) throw AppError.notFound('Job not found.');
  assertCanManage({ recruiter_id: job.recruiter_id ? String(job.recruiter_id) : undefined }, user);
  await job.deleteOne();
}
