import type { AuditLog, SystemReport, Profile } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to attach authorization headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic request wrapper
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

// User Management
export async function fetchAllUsers(): Promise<{ data?: Profile[]; error?: string }> {
  return request<Profile[]>(`${API_BASE}/admin/users`);
}

export async function fetchUsersByRole(role: string): Promise<{ data?: Profile[]; error?: string }> {
  return request<Profile[]>(`${API_BASE}/admin/users?role=${encodeURIComponent(role)}`);
}

export async function blockUser(userId: string): Promise<{ error?: string }> {
  const res = await request(`${API_BASE}/admin/users/${userId}/block`, {
    method: 'PATCH',
  });

  if (!res.error) {
    await logAuditEvent('block_user', 'user', userId, { action: 'block' });
  }

  return res;
}

export async function unblockUser(userId: string): Promise<{ error?: string }> {
  const res = await request(`${API_BASE}/admin/users/${userId}/unblock`, {
    method: 'PATCH',
  });

  if (!res.error) {
    await logAuditEvent('unblock_user', 'user', userId, { action: 'unblock' });
  }

  return res;
}

// Audit Logging
export async function logAuditEvent(
  action: string,
  targetType: string,
  targetId: string,
  changes: Record<string, unknown>
): Promise<{ error?: string }> {
  return request(`${API_BASE}/admin/audit-logs`, {
    method: 'POST',
    body: JSON.stringify({
      action,
      targetType,
      targetId,
      changes,
    }),
  });
}

export async function fetchAuditLogs(limit = 50): Promise<{ data?: AuditLog[]; error?: string }> {
  return request<AuditLog[]>(`${API_BASE}/admin/audit-logs?limit=${limit}`);
}

// Reports
export async function generateUserReport(): Promise<{ data?: SystemReport; error?: string }> {
  return request<SystemReport>(`${API_BASE}/admin/reports/users`);
}

export async function generateApplicationReport(): Promise<{ data?: SystemReport; error?: string }> {
  return request<SystemReport>(`${API_BASE}/admin/reports/applications`);
}