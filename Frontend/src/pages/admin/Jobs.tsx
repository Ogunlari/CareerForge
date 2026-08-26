import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminJobsQuery, useGetAdminStatsQuery } from '@/features/admin/adminApi';
import { useDeleteJobMutation } from '@/features/jobs/jobsApi';
import { extractErrorMessage } from '@/features/api/baseApi';

export default function ManageJobsAdmin() {
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteJob] = useDeleteJobMutation();
  const { data: stats } = useGetAdminStatsQuery();

  const {
    data,
    isLoading: loading,
    error,
  } = useGetAdminJobsQuery(search ? { search, limit: 50 } : { limit: 50 });
  const jobs = data?.data ?? [];

  const handleDelete = async (jobId: string) => {
    setActionError(null);
    if (!window.confirm('Remove this job posting permanently?')) return;
    try {
      await deleteJob(jobId).unwrap();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {(error || actionError) && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {actionError ?? extractErrorMessage(error)}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Showing {jobs.length} of {stats?.jobs.total ?? data?.total ?? 0} jobs
      </p>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Posted</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applications</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-6 py-4 font-semibold">{job.title}</td>
                  <td className="px-6 py-4">{job.company?.name ?? '-'}</td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(job.posted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{job.applicants_count}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link to={`/jobs/${job.id}`} className="text-blue-600 hover:underline text-sm">
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
