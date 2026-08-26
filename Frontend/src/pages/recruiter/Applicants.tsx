import { useAuth } from '@/context/AuthContext';
import { useGetRecruiterApplicationsQuery } from '@/features/applications/applicationsApi';

export default function Applicants() {
  const { user } = useAuth();
  const {
    data: applications = [],
    isLoading: loading,
  } = useGetRecruiterApplicationsQuery(user?.id ?? '', { skip: !user });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Applicants</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Job Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applied</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  No applicants yet
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="border-t">
                  <td className="px-6 py-4">{app.student?.full_name || 'Unknown'}</td>
                  <td className="px-6 py-4">{app.job.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        app.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : app.status === 'reviewing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/recruiter/applicants/${app.id}`} className="text-blue-600 hover:underline text-sm">
                      View
                    </a>
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
