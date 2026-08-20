import type { Job, JobDetails, SavedJob, JobFilterParams } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle standard JSON requests
async function request<T>(url: string, options?: RequestInit): Promise<{ data?: T; total?: number; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.message || result.error || 'Server request failed' };
    }

    return result;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error occurred' };
  }
}

export async function fetchJobs(
  params?: JobFilterParams
): Promise<{ data?: Job[]; total?: number; error?: string }> {
  const query = new URLSearchParams();

  if (params?.search) query.append('search', params.search);
  if (params?.location) query.append('location', params.location);
  if (params?.job_type) query.append('job_type', params.job_type);
  if (params?.experience_level) query.append('experience_level', params.experience_level);
  if (params?.salary_min) query.append('salary_min', String(params.salary_min));
  if (params?.salary_max) query.append('salary_max', String(params.salary_max));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.page) query.append('page', String(params.page));

  return request<Job[]>(`${API_BASE}/jobs?${query.toString()}`);
}

export async function fetchJobById(jobId: string): Promise<{ data?: JobDetails; error?: string }> {
  return request<JobDetails>(`${API_BASE}/jobs/${jobId}`);
}

export async function fetchAllCompanies(): Promise<{ data?: any[]; error?: string }> {
  return request<any[]>(`${API_BASE}/companies`);
}

export async function saveJob(studentId: string, jobId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/saved-jobs`, {
    method: 'POST',
    body: JSON.stringify({ studentId, jobId }),
  });
}

export async function unsaveJob(studentId: string, jobId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/saved-jobs`, {
    method: 'DELETE',
    body: JSON.stringify({ studentId, jobId }),
  });
}

export async function isJobSaved(studentId: string, jobId: string): Promise<boolean> {
  try {
    const res = await request<{ saved: boolean }>(
      `${API_BASE}/saved-jobs/check?studentId=${encodeURIComponent(studentId)}&jobId=${encodeURIComponent(jobId)}`
    );
    return Boolean(res.data?.saved);
  } catch {
    return false;
  }
}

export async function fetchSavedJobs(studentId: string): Promise<{ data?: SavedJob[]; error?: string }> {
  return request<SavedJob[]>(`${API_BASE}/saved-jobs?studentId=${encodeURIComponent(studentId)}`);
}

export async function fetchRecommendedJobs(studentId: string): Promise<{ data?: Job[]; error?: string }> {
  return request<Job[]>(`${API_BASE}/jobs/recommended?studentId=${encodeURIComponent(studentId)}`);
}