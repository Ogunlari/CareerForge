import type { Company } from '@/types';

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

export async function fetchCompanies(): Promise<{ data?: Company[]; error?: string }> {
  return request<Company[]>(`${API_BASE}/companies`);
}

export async function fetchCompanyById(companyId: string): Promise<{ data?: Company; error?: string }> {
  return request<Company>(`${API_BASE}/companies/${companyId}`);
}

export async function createCompany(company: Partial<Company>): Promise<{ data?: Company; error?: string }> {
  return request<Company>(`${API_BASE}/companies`, {
    method: 'POST',
    body: JSON.stringify(company),
  });
}

export async function updateCompany(
  companyId: string,
  updates: Partial<Company>
): Promise<{ data?: Company; error?: string }> {
  return request<Company>(`${API_BASE}/companies/${companyId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteCompany(companyId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/companies/${companyId}`, {
    method: 'DELETE',
  });
}