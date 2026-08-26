import { useGetAdminStatsQuery, useGetHealthStatusQuery } from '@/features/admin/adminApi';
import type { GroupedCount } from '@/features/admin/adminApi';
import { extractErrorMessage } from '@/features/api/baseApi';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useGetAdminStatsQuery();
  const { data: health } = useGetHealthStatusQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {extractErrorMessage(error)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{isLoading ? '...' : stats?.users.total ?? 0}</p>
          <p className="text-xs text-gray-400 mt-2">
            {(stats?.users.byRole as GroupedCount[] | undefined)
              ?.map((entry) => `${entry._id}: ${entry.count}`)
              .join(' · ')}
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Jobs</h3>
          <p className="text-3xl font-bold text-green-600">{isLoading ? '...' : stats?.jobs.total ?? 0}</p>
          <p className="text-xs text-gray-400 mt-2">{stats?.jobs.active ?? 0} active</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Applications</h3>
          <p className="text-3xl font-bold text-yellow-600">{isLoading ? '...' : stats?.applications.total ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Companies</h3>
          <p className="text-3xl font-bold text-purple-600">{isLoading ? '...' : stats?.companies.total ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt>API Server</dt>
            <dd className={`font-semibold ${health?.status === 'ready' ? 'text-green-600' : 'text-red-600'}`}>
              {health?.status === 'ready' ? 'Online' : 'Offline'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Database</dt>
            <dd className={`font-semibold ${health?.status === 'ready' ? 'text-green-600' : 'text-yellow-600'}`}>
              {health?.status === 'ready' ? 'Connected' : 'Unavailable'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
