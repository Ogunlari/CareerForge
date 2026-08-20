import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  // const [stats, setStats] = useState({

  const [stats,] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0,
  });

  useEffect(() => {
    // Fetch statistics
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Jobs</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalJobs}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Applications</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Companies</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalCompanies}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt>Database</dt>
            <dd className="text-green-600 font-semibold">Connected</dd>
          </div>
          <div className="flex justify-between">
            <dt>API Server</dt>
            <dd className="text-green-600 font-semibold">Online</dd>
          </div>
          <div className="flex justify-between">
            <dt>Cache</dt>
            <dd className="text-green-600 font-semibold">Active</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
