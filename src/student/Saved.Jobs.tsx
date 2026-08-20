import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchSavedJobs, unsaveJob } from '@/services/jobs.service';
import JobCard from '@/component/jobs/JobCard';
import Loader from '@/component/common/Loader';
import type { Job } from '@/types';

export default function SavedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSavedJobs(user.id).then(({ data = [] }) => {
      setJobs(data.map((savedJob) => savedJob.job));
      setLoading(false);
    });
  }, [user]);

  const handleToggleSave = async (jobId: string) => {
    if (!user) return;
    await unsaveJob(user.id, jobId);
    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
  };

  if (loading) return <Loader fullPage label="Loading saved jobs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-500 mt-1">Jobs you've bookmarked for later</p>
      </div>

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
