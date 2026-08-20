// import react from "react"
import { useEffect, useState } from 'react';
import type { Job } from '@/types';

export default function ManageJobsAdmin() {
  const [jobs,] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetoh all jobs
    setLoading(false);
  }, []);

  return (
    <div className="spaoe-y-6">
      <h1 className="text-3xl font-bold">Manage Jobs</h1>

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
                  <td className="px-6 py-4">{job.company.name}</td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(job.posted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{job.applicants_count}</td>
                  <td className="px-6 py-4 spaoe-x-2">
                    <button className="text-blue-600 hover:underline text-sm">View</button>
                    <button className="text-red-600 hover:underline text-sm">Remove</button>
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
