import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Job } from '@/types';
import { formatSalary, getRelativeTime } from '@/utilities/formatDate';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/utilities/constants';

interface JobCardProps {
  job: Job;
  saved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export default function JobCard({ job, saved, onToggleSave }: JobCardProps) {
  const company = job.company;
  const jobType = JOB_TYPES.find((t) => t.value === job.job_type);
  const expLevel = EXPERIENCE_LEVELS.find((e) => e.value === job.experience_level);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 group block"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {company?.name?.[0]?.toUpperCase() || 'C'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-600 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 truncate">{company?.name || 'Unknown Company'}</p>
            </div>
            {onToggleSave && (
              <button
                onClick={(e) => { e.preventDefault(); onToggleSave(job.id); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                {saved ? (
                  <BookmarkCheck className="w-5 h-5 text-primary-500" />
                ) : (
                  <Bookmark className="w-5 h-5 text-slate-400" />
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            )}
            {jobType && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {jobType.label}
              </span>
            )}
            {expLevel && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {expLevel.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {getRelativeTime(job.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-semibold text-slate-700">
              {formatSalary(job.salary_min ?? 0, job.salary_max ?? 0, 'USD')}
            </span>
            {job.applicants_count > 0 && (
              <span className="text-xs text-slate-400">{job.applicants_count} applicants</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
