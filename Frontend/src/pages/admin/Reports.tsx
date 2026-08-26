import { useGetUserReportQuery, useGetApplicationReportQuery } from '@/features/admin/adminApi';
import { useGetJobsQuery } from '@/features/jobs/jobsApi';
import { extractErrorMessage } from '@/features/api/baseApi';

type GroupedCount = { _id?: string; count?: number };

const sumByRole = (byRole: unknown) =>
  Array.isArray(byRole)
    ? (byRole as GroupedCount[]).reduce((sum, entry) => sum + (entry.count ?? 0), 0)
    : 0;

export default function Reports() {
  const {
    data: userReport,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUserReportQuery();
  const {
    data: applicationReport,
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useGetApplicationReportQuery();
  const { data: jobsPage } = useGetJobsQuery({ limit: 1 });

  const totalUsers = sumByRole(userReport?.data.byRole);
  const totalApplications =
    typeof applicationReport?.data.total === 'number' ? applicationReport.data.total : 0;
  const totalJobs = jobsPage?.total ?? 0;

  const loading = usersLoading || applicationsLoading;
  const error = usersError ?? applicationsError;

  const handleGenerate = () => {
    void refetchUsers();
    void refetchApplications();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {extractErrorMessage(error)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">User Statistics</h3>
          <p className="text-2xl font-bold mt-2">{loading ? '...' : totalUsers}</p>
          {userReport && (
            <p className="text-xs text-gray-400 mt-2">
              Generated {new Date(userReport.generated_at).toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Job Statistics</h3>
          <p className="text-2xl font-bold mt-2">{jobsPage ? totalJobs : '...'}</p>
          <p className="text-xs text-gray-400 mt-2">Active job posts</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Application Statistics</h3>
          <p className="text-2xl font-bold mt-2">{loading ? '...' : totalApplications}</p>
          {applicationReport && (
            <p className="text-xs text-gray-400 mt-2">
              Generated {new Date(applicationReport.generated_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Latest Report Details</h2>
        {!userReport && !applicationReport ? (
          <p className="text-gray-600">No reports generated yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userReport && (
              <div className="border-l-4 border-blue-600 pl-4 py-3">
                <h3 className="font-semibold">Users by role</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {(userReport.data.byRole as GroupedCount[] | undefined)?.map((entry) => (
                    <li key={entry._id ?? 'unknown'}>
                      {entry._id ?? 'unknown'}: <span className="font-semibold">{entry.count ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {applicationReport && (
              <div className="border-l-4 border-blue-600 pl-4 py-3">
                <h3 className="font-semibold">Applications by status</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {(applicationReport.data.byStatus as GroupedCount[] | undefined)?.map((entry) => (
                    <li key={entry._id ?? 'unknown'}>
                      {entry._id ?? 'unknown'}: <span className="font-semibold">{entry.count ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
