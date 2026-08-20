import { useState, useEffect, useCallback } from 'react';
import { fetchJobs } from '@/services/jobs.service';
import type { Job, JobType } from '@/types'; // Imported JobType

interface UseJobsParams {
  search?: string;
  job_type?: JobType; // Updated from string to JobType
  experience_level?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export function useJobs(params: UseJobsParams) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const offset = ((params.page || 1) - 1) * (params.pageSize || 10);
    const response = await fetchJobs({
      search: params.search,
      job_type: params.job_type,
      experience_level: params.experience_level,
      location: params.location,
      limit: params.pageSize || 10,
      page: params.page || 1,
      offset,
    });

    const nextJobs = Array.isArray(response?.data) ? response.data : [];
    const nextTotal = typeof response?.total === 'number' ? response.total : nextJobs.length;

    setJobs(nextJobs);
    setTotal(nextTotal);
    setError(response?.error ?? null);
    setLoading(false);
  }, [params.search, params.job_type, params.experience_level, params.location, params.page, params.pageSize]);

  useEffect(() => { load(); }, [load]);

  return { jobs, total, loading, error, reload: load };
}