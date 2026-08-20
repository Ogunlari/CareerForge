import { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchRecommendedJobs, saveJob, unsaveJob, isJobSaved } from '@/services/jobs.service';
import JobCard from '@/component/jobs/JobCard';
import Loader from '@/component/common/Loader';
import type { Job } from '@/types';

export default function RecommendedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: recs = [] } = await fetchRecommendedJobs(user.id, 20);
      setJobs(recs);
      const saved = new Set<string>();
      for (const job of recs) {
        if (await isJobSaved(user.id, job.id)) saved.add(job.id);
      }
      setSavedIds(saved);
      setLoading(false);
    })();
  }, [user]);

  const handleToggleSave = async (jobId: string) => {
    if (!user) return;
    if (savedIds.has(jobId)) {
      await unsaveJob(user.id, jobId);
      setSavedIds(new Set([...savedIds].filter((id) => id !== jobId)));
    } else {
      await saveJob(user.id, jobId);
      setSavedIds(new Set([...savedIds, jobId]));
    }
  };

  if (loading) return <Loader fullPage label="Finding jobs for you..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" /> Recommended Jobs
        </h1>
        <p className="text-slate-500 mt-1">Jobs matched to your skills and profile</p>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 mt-4 text-lg">No recommendations yet.</p>
          <p className="text-sm text-slate-400 mt-2">Add skills to your profile for better job matches.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} saved={savedIds.has(job.id)} onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
