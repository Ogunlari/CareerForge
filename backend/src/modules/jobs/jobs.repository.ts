import { JobModel, JOB_STATUSES } from '../../models/job.model.js';
import type { FilterQuery } from 'mongoose';
import type { Job } from '../../models/job.model.js';
import type { ListJobsQuery } from './jobs.schemas.js';

export async function buildJobFilter(query: ListJobsQuery): Promise<FilterQuery<Job>> {
  const filter: FilterQuery<Job> = {};

  filter.status = query.status ?? 'active';

  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }
  if (query.location) {
    filter.location = new RegExp(query.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (query.job_type) filter.job_type = query.job_type;
  if (query.experience_level) filter.experience_level = query.experience_level;
  if (query.salary_min !== undefined || query.salary_max !== undefined) {
    filter.salary_max = { $gte: query.salary_min ?? 0 };
    if (query.salary_max !== undefined) filter.salary_min = { $lte: query.salary_max };
  }
  if (query.recruiter_id) filter.recruiter_id = query.recruiter_id;
  if (query.company_id) filter.company_id = query.company_id;

  return filter;
}

export const POPULATE_COMPANY = { path: 'company_id', select: '-__v' };

export async function searchJobs(filter: FilterQuery<Job>, page: number, limit: number) {
  return (
    JobModel.find(filter)
      .sort({ posted_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ company_id: unknown }>(POPULATE_COMPANY)
      .maxTimeMS(5000)
      .exec()
  );
}

export async function countJobs(filter: FilterQuery<Job>): Promise<number> {
  return JobModel.countDocuments(filter).maxTimeMS(3000);
}

export async function findJobById(id: string) {
  return JobModel.findById(id).populate(POPULATE_COMPANY).maxTimeMS(2000);
}

export async function findActiveJobsForRecommendation(limit: number) {
  return JobModel.find({ status: 'active' })
    .sort({ posted_at: -1 })
    .limit(limit)
    .select('title description tags requirements experience_level location posted_at company_id recruiter_id')
    .populate<{ company_id: unknown }>(POPULATE_COMPANY)
    .maxTimeMS(5000)
    .exec();
}

export async function findByRecruiter(
  recruiterId: string,
  status: (typeof JOB_STATUSES)[number] | undefined,
  page: number,
  limit: number,
) {
  const filter: FilterQuery<Job> = { recruiter_id: recruiterId };
  if (status) filter.status = status;

  const [jobs, total] = await Promise.all([
    JobModel.find(filter)
      .sort({ posted_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ company_id: unknown }>(POPULATE_COMPANY)
      .maxTimeMS(5000)
      .exec(),
    JobModel.countDocuments(filter).maxTimeMS(3000),
  ]);

  return { jobs, total };
}
