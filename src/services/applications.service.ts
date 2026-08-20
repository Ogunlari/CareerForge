import type { Application, ApplicationFilterParams, ApplicationStatus } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to attach authorization headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic request helper
async function request<T>(url: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
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

export async function createApplication(
  studentId: string,
  jobId: string,
  coverLetter?: string,
  resumeUrl?: string
): Promise<{ data?: Application; error?: string }> {
  return request<Application>(`${API_BASE}/applications`, {
    method: 'POST',
    body: JSON.stringify({
      studentId,
      jobId,
      coverLetter,
      resumeUrl,
    }),
  });
}

export async function fetchStudentApplications(
  studentId: string,
  params?: ApplicationFilterParams
): Promise<{ data?: Application[]; error?: string }> {
  const query = new URLSearchParams({ studentId });

  if (params?.status) query.append('status', params.status);
  if (params?.date_from) query.append('date_from', params.date_from);
  if (params?.date_to) query.append('date_to', params.date_to);
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.page) query.append('page', String(params.page));

  return request<Application[]>(`${API_BASE}/applications/student?${query.toString()}`);
}

export async function fetchJobApplications(
  jobId: string,
  recruiterId: string
): Promise<{ data?: Application[]; error?: string }> {
  const query = new URLSearchParams({ recruiterId });
  return request<Application[]>(`${API_BASE}/jobs/${jobId}/applications?${query.toString()}`);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<{ data?: Application; error?: string }> {
  return request<Application>(`${API_BASE}/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchRecruiterApplications(
  recruiterId: string
): Promise<{ data?: Application[]; error?: string }> {
  return request<Application[]>(
    `${API_BASE}/applications/recruiter?recruiterId=${encodeURIComponent(recruiterId)}`
  );
}

export async function fetchApplicationById(
  applicationId: string
): Promise<{ data?: Application; error?: string }> {
  return request<Application>(`${API_BASE}/applications/${applicationId}`);
}

export async function checkExistingApplication(
  studentId: string,
  jobId: string
): Promise<boolean> {
  try {
    const res = await request<{ exists: boolean }>(
      `${API_BASE}/applications/check?studentId=${encodeURIComponent(studentId)}&jobId=${encodeURIComponent(jobId)}`
    );
    return Boolean(res.data?.exists);
  } catch {
    return false;
  }
}

export async function withdrawApplication(
  applicationId: string
): Promise<{ error?: string }> {
  return request(`${API_BASE}/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
  });
}