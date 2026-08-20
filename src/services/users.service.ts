import type { Notification } from '@/types';

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
async function request<T>(url: string, options?: RequestInit): Promise<{ data?: T; count?: number; error?: string }> {
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

export async function fetchNotifications(userId: string): Promise<{ data?: Notification[]; error?: string }> {
  return request<Notification[]>(`${API_BASE}/notifications?userId=${encodeURIComponent(userId)}`);
}

export async function markNotificationRead(notificationId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(userId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/notifications/read-all`, {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  });
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
): Promise<{ data?: Notification; error?: string }> {
  return request<Notification>(`${API_BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      type,
      title,
      message,
      relatedId,
    }),
  });
}

export async function getUnreadCount(userId: string): Promise<{ count?: number; error?: string }> {
  return request(`${API_BASE}/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
}

export async function deleteNotification(notificationId: string): Promise<{ error?: string }> {
  return request(`${API_BASE}/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}
