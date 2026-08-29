import { baseApi } from '@/features/api/baseApi';
import type { Paginated } from '@/features/jobs/jobsApi';
import type { AuditLog, Job, Profile, SystemReport } from '@/types';

export interface GroupedCount {
  _id?: string;
  count: number;
}

export interface AdminStats {
  users: { total: number; byRole: GroupedCount[] };
  jobs: { total: number; active: number };
  applications: { total: number; byStatus: GroupedCount[] };
  companies: { total: number };
}

export interface AdminJobsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read';
  created_at?: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<Profile[], string | void>({
      query: (role) => (role ? `/admin/users?role=${encodeURIComponent(role)}` : '/admin/users'),
      transformResponse: (raw: { data: Profile[] }) =>
        raw.data.map((u) => ({ ...u, id: String((u as unknown as { _id?: string })._id ?? u.id) })),
      providesTags: ['User'],
    }),

    blockUser: builder.mutation<Profile, string>({
      query: (userId) => ({ url: `/admin/users/${userId}/block`, method: 'PATCH' }),
      invalidatesTags: (_result, error, userId) =>
        error ? [] : [{ type: 'User', id: userId }, 'User'],
    }),

    unblockUser: builder.mutation<Profile, string>({
      query: (userId) => ({ url: `/admin/users/${userId}/unblock`, method: 'PATCH' }),
      invalidatesTags: (_result, error, userId) =>
        error ? [] : [{ type: 'User', id: userId }, 'User'],
    }),

    createAuditLog: builder.mutation<
      { message: string },
      { action: string; targetType: string; targetId: string; changes: Record<string, unknown> }
    >({
      query: (body) => ({ url: '/admin/audit-logs', method: 'POST', body }),
      invalidatesTags: ['AuditLog'],
    }),

    getAuditLogs: builder.query<Paginated<AuditLog>, number | void>({
      query: (limit) => `/admin/audit-logs?limit=${limit ?? 50}`,
      providesTags: ['AuditLog'],
    }),

    getUserReport: builder.query<SystemReport, void>({
      query: () => '/admin/reports/users',
      transformResponse: (raw: { data: SystemReport }) => raw.data,
    }),

    getApplicationReport: builder.query<SystemReport, void>({
      query: () => '/admin/reports/applications',
      transformResponse: (raw: { data: SystemReport }) => raw.data,
    }),

    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      transformResponse: (raw: { data: AdminStats }) => raw.data,
      providesTags: ['User', 'Job', 'Application', 'Company'],
    }),

    getAdminJobs: builder.query<Paginated<Job>, AdminJobsParams | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        if (params?.search) query.append('search', params.search);
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit));
        return `/admin/jobs?${query.toString()}`;
      },
      providesTags: ['Job'],
    }),

    getHealthStatus: builder.query<{ status: string }, void>({
      query: () => '/health/ready',
    }),

    getContactMessages: builder.query<Paginated<ContactMessage>, number | void>({
      query: (page) => `/contact?page=${page ?? 1}`,
      transformResponse: (raw: Paginated<{ _id?: string; id?: string } & ContactMessage>) => ({
        ...raw,
        data: raw.data.map((m) => ({ ...m, id: String(m._id ?? m.id) })),
      }),
      providesTags: ['ContactMessage'],
    }),

    markContactRead: builder.mutation<{ message: string }, string>({
      query: (contactId) => ({ url: `/contact/${contactId}/read`, method: 'PATCH' }),
      invalidatesTags: ['ContactMessage'],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useCreateAuditLogMutation,
  useGetAuditLogsQuery,
  useGetUserReportQuery,
  useGetApplicationReportQuery,
  useGetAdminStatsQuery,
  useGetAdminJobsQuery,
  useGetHealthStatusQuery,
  useGetContactMessagesQuery,
  useMarkContactReadMutation,
} = adminApi;
