import { Link } from 'react-router-dom';
import { useGetMyJobsQuery } from '@/features/jobs/jobsApi';
import { useGetRecruiterApplicationsQuery } from '@/features/applications/applicationsApi';
import { useAuth } from '@/context/AuthContext';
import type { ApplicationStatus } from '@/types';

const countByStatus = (statuses: (ApplicationStatus | undefined)[], targets: ApplicationStatus[]) =>
  statuses.filter((status) => status !== undefined && targets.includes(status)).length;

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: jobsData, isLoading: loading, error: jobsError } = useGetMyJobsQuery({ limit: 5 });
  const {
    data: applications = [],
    isLoading: appsLoading,
  } = useGetRecruiterApplicationsQuery(user?.id ?? '', { skip: !user });

  const jobs = jobsData?.data ?? [];
  const statuses = applications.map((app) => app.status);
  const activeJobs = jobs.filter((job) => job.status === 'active').length;
  const pendingReviews = countByStatus(statuses, ['pending', 'reviewing']);
  const accepted = countByStatus(statuses, ['accepted']);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/recruiter/create-job" className="bg-blue-600 text-white px-6 py-2 rounded">
          Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Active Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">{jobsData ? activeJobs : '...'}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Applications</h3>
          <p className="text-3xl font-bold text-green-600">{appsLoading ? '...' : applications.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Pending Reviews</h3>
          <p className="text-3xl font-bold text-yellow-600">{appsLoading ? '...' : pendingReviews}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Accepted</h3>
          <p className="text-3xl font-bold text-purple-600">{appsLoading ? '...' : accepted}</p>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>
        {jobsError ? (
          <p className="text-red-600">Failed to load jobs. Please try again.</p>
        ) : loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border-l-4 border-blue-600 pl-4 py-3">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
