import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials, clearCredentials } from '@/features/auth/authSlice';
import type { Profile } from '@/types';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
  requestId?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Profile;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  failedQueue = [];
}

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      api.dispatch(clearCredentials());
      return result;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => baseQueryWithAuth(args, api, extraOptions));
    }

    isRefreshing = true;

    try {
      const refreshResult = await baseQueryWithAuth(
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions,
      );

      if (refreshResult.error) {
        processQueue(refreshResult.error);
        api.dispatch(clearCredentials());
        return refreshResult;
      }

      const data = refreshResult.data as TokenResponse;
      api.dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      processQueue(null);

      return baseQueryWithAuth(args, api, extraOptions);
    } catch (err) {
      processQueue(err);
      api.dispatch(clearCredentials());
      return { error: { status: 401, data: { message: 'Session expired.' } } as FetchBaseQueryError };
    } finally {
      isRefreshing = false;
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'StudentProfile', 'Job', 'SavedJob', 'Application', 'Company', 'Notification', 'AuditLog'],
  endpoints: () => ({}),
});

export function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong.';
  const err = error as { error?: string; data?: unknown };
  if (typeof err.error === 'string') return err.error;
  if (err.data && typeof err.data === 'object' && 'message' in err.data) {
    return String((err.data as { message: unknown }).message);
  }
  return 'Server request failed';
}
