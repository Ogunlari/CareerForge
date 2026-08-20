import type { Profile, StudentProfile, UserRole } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to include Bearer token in headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{ user: Profile | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.message || data.error || 'Registration failed' };
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return { user: (data.user || data) as Profile, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: Profile | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.message || data.error || 'Sign in failed' };
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return { user: (data.user || data) as Profile, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});

    localStorage.removeItem('token');
    return { error: null };
  } catch (error) {
    localStorage.removeItem('token');
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return (data.user || data) as Profile;
  } catch (error) {
    console.error('Error getting current profile:', error);
    return null;
  }
}

export async function updateProfile(
  id: string,
  updates: Partial<Profile>
): Promise<{ data?: Profile; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/profiles/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || 'Failed to update profile' };
    }

    return { data: (data.user || data) as Profile };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || 'Failed to request password reset' };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function verifyResetToken(): Promise<{ isValid: boolean }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { isValid: false };

    const response = await fetch(`${API_BASE}/auth/verify-token`, {
      headers: getAuthHeaders(),
    });

    return { isValid: response.ok };
  } catch {
    return { isValid: false };
  }
}

export async function updatePassword(password: string): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || 'Failed to update password' };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
  try {
    const response = await fetch(`${API_BASE}/students/${studentId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data as StudentProfile;
  } catch (error) {
    console.error('Error getting student profile:', error);
    return null;
  }
}