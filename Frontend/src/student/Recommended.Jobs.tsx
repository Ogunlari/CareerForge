import { useMemo } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetRecommendedJobsQuery } from '@/features/jobs/jobsApi';
import { useGetSavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from '@/features/savedJobs/savedJobsApi';
import JobCard from '@/component/jobs/JobCard';
import Loader from '@/component/common/Loader';

export default function RecommendedJobs() {
  const { user } = useAuth();
  const skip = !user;

  const { data: recommended = [], isLoading: recLoading } = useGetRecommendedJobsQuery(
    user?.id ?? undefined,
    { skip },
  );
  const { data: savedData, isLoading: savedLoading } = useGetSavedJobsQuery(user?.id ?? '', { skip });
  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();

  const savedIds = useMemo(
    () => new Set((savedData ?? []).map((savedJob) => savedJob.job_id ?? savedJob.job?.id).filter(Boolean) as string[]),
    [savedData],
  );

  if (recLoading || savedLoading) return <Loader fullPage label="Finding jobs for you..." />;

  const handleToggleSave = (jobId: string) => {
    if (!user) return;
    if (savedIds.has(jobId)) {
      void unsaveJob({ studentId: user.id, jobId });
    } else {
      void saveJob({ studentId: user.id, jobId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" /> Recommended Jobs
        </h1>
        <p className="text-slate-500 mt-1">Jobs matched to your skills and profile</p>
      </div>

      {recommended.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 mt-4 text-lg">No recommendations yet.</p>
          <p className="text-sm text-slate-400 mt-2">Add skills to your profile for better job matches.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recommended.map((job) => (
            <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
