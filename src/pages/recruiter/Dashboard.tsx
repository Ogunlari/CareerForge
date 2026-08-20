import { useEffect, useState } from 'react';
import type { Job } from '@/types';

export default function RecruiterDashboard() {
  const [jobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recruiter's jobs
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <a href="/recruiter/create-job" className="bg-blue-600 text-white px-6 py-2 rounded">
          Post New Job
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Active Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Applications</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Pending Reviews</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Accepted</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>
        {loading ? (
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
