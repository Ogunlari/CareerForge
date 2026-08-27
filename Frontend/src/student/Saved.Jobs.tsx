import { Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetSavedJobsQuery, useUnsaveJobMutation } from '@/features/savedJobs/savedJobsApi';
import JobCard from '@/component/jobs/JobCard';
import Loader from '@/component/common/Loader';

export default function SavedJobs() {
  const { user } = useAuth();

  const { data: savedData, isLoading } = useGetSavedJobsQuery(user?.id ?? '', { skip: !user });
  const [unsaveJob, { error: unsaveError }] = useUnsaveJobMutation();

  if (isLoading) return <Loader fullPage label="Loading saved jobs..." />;

  const jobs = (savedData ?? []).map((savedJob) => savedJob.job);

  const handleToggleSave = (jobId: string) => {
    if (!user) return;
    void unsaveJob({ studentId: user.id, jobId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-500 mt-1">Jobs you've bookmarked for later</p>
      </div>

      {unsaveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          Failed to remove job. Please try again.
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 mt-4 text-lg">No saved jobs yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} saved onToggleSave={handleToggleSave} />)}
        </div>
      )}
    </div>
  );
}
