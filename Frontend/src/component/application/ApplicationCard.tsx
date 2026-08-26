import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Building2 } from 'lucide-react';
import type { Application } from '@/types';
import { formatDate } from '../../utilities/formatDate';
import ApplicationStatus from './ApplicationStatus';

export default function ApplicationCard({ application }: { application: Application }) {
  const job = application.job;

  return (
    <Link
      to={`/student/applications`}
      className="card p-5 hover:shadow-md hover:border-primary-200 transition-all block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
            {job?.company?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{job?.title || 'Unknown Position'}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5" /> {job?.company?.name}
            </p>
          </div>
        </div>
        <ApplicationStatus status={application.status} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
        {job?.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </span>
        )}
        {job?.job_type && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> {job.job_type}
          </span>
        )}
        <span>Applied {formatDate(application.applied_at, 'relative')}</span>
      </div>
    </Link>
  );
}
