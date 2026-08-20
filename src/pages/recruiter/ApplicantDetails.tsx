import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Application, ApplicationStatus } from '@/types';
import { fetchApplicationById, updateApplicationStatus } from '@/services/applications.service';

export default function ApplicantDetails() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      const { data } = await fetchApplicationById(applicationId);
      if (active) {
        setApplication(data ?? null);
        setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [applicationId]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!application) return;
    const { error } = await updateApplicationStatus(application.id, status);
    if (!error) setApplication((currentApplication) => currentApplication ? { ...currentApplication, status } : null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!application) {
    return <div className="text-center py-8">Application not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{application.student?.full_name || 'Applicant'}</h1>
          <p className="text-gray-600">{application.job.title}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            application.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : application.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : application.status === 'reviewing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Cover Letter */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Cover Letter</h2>
            <p className="text-gray-700">{application.cover_letter || 'No cover letter provided'}</p>
          </div>

          {/* Resume */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Resume</h2>
            {application.resume_url ? (
              <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Resume
              </a>
            ) : (
              <p className="text-gray-600">No resume provided</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-bold mb-4">Actions</h3>
            <div className="space-y-3">
              <button onClick={() => handleStatusChange('accepted')} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Accept
              </button>
              <button onClick={() => handleStatusChange('reviewing')} className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                Under Review
              </button>
              <button onClick={() => handleStatusChange('rejected')} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-bold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Applied on</dt>
                <dd className="font-semibold">{new Date(application.applied_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Last updated</dt>
                <dd className="font-semibold">{new Date(application.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
