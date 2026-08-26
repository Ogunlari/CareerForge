import { Link } from 'react-router-dom';
import { FileText, Bookmark, CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetStudentApplicationsQuery } from '@/features/applications/applicationsApi';
import { useGetSavedJobsQuery } from '@/features/savedJobs/savedJobsApi';
import { useGetRecommendedJobsQuery } from '@/features/jobs/jobsApi';
import StatCard from '@/component/dashboard/StatCard';
import ApplicationChart from '@/component/dashboard/ApplicationChart';
import ActivityFeed, { type ActivityItem } from '@/component/dashboard/ActivityFeed';
import ApplicationCard from '@/component/application/ApplicationCard';
import JobCard from '@/component/jobs/JobCard';
import Loader from '@/component/common/Loader';
import type { ApplicationStatus } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const skip = !user;

  const { data: appsData, isLoading: appsLoading, error: appsError } = useGetStudentApplicationsQuery(
    { studentId: user?.id ?? '', limit: 50 },
    { skip },
  );
  const { data: savedData, isLoading: savedLoading, error: savedError } = useGetSavedJobsQuery(user?.id ?? '', { skip });
  const { data: recommended = [], isLoading: recLoading, error: recError } = useGetRecommendedJobsQuery(
    user?.id ?? undefined,
    { skip },
  );

  const hasError = appsError || savedError || recError;

  if (appsLoading || savedLoading || recLoading) return <Loader fullPage label="Loading dashboard..." />;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Here&apos;s your job search overview</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">Failed to load dashboard data</p>
          <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const applications = appsData?.data ?? [];
  const savedJobs = (savedData ?? []).map((savedJob) => savedJob.job);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const activities: ActivityItem[] = applications.slice(0, 5).map((app) => ({
    id: app.id,
    type: 'application' as const,
    title: `Applied to ${app.job?.title || 'a job'}`,
    description: `at ${app.job?.company?.name || 'Unknown'}`,
    date: app.applied_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-1">Here's your job search overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="w-5 h-5" />} label="Applications" value={applications.length} color="primary" />
        <StatCard icon={<Bookmark className="w-5 h-5" />} label="Saved Jobs" value={savedJobs.length} color="accent" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Accepted" value={statusCounts.accepted || 0} color="success" />
        <StatCard icon={<Eye className="w-5 h-5" />} label="Under Review" value={statusCounts.reviewing || 0} color="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <Link to="/student/applications" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {applications.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-400">No applications yet. <Link to="/jobs" className="text-primary-600 font-semibold">Browse jobs</Link></p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => <ApplicationCard key={app.id} application={app} />)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
              <Link to="/student/recommended-jobs" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recommended.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-400">No recommendations yet. Add skills to your profile for better matches.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recommended.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ApplicationChart data={statusCounts} />
          <ActivityFeed items={activities} />
        </div>
      </div>
    </div>
  );
}
