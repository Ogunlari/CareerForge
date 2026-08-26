import { baseApi } from '@/features/api/baseApi';
import type { Job, JobDetails, JobFilterParams } from '@/types';

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type CreateJobPayload = Partial<Omit<Job, 'id' | 'company' | 'company_id' | 'recruiter_id' | 'posted_at' | 'applicants_count' | 'created_at' | 'updated_at'>> & {
  title?: string;
  description?: string;
};

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Paginated<Job>, JobFilterParams | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.location) query.append('location', params.location);
        if (params?.job_type) query.append('job_type', params.job_type);
        if (params?.experience_level) query.append('experience_level', params.experience_level);
        if (params?.salary_min != null) query.append('salary_min', String(params.salary_min));
        if (params?.salary_max != null) query.append('salary_max', String(params.salary_max));
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit));
        return `/jobs?${query.toString()}`;
      },
      providesTags: ['Job'],
    }),

    getJobById: builder.query<JobDetails, string>({
      query: (jobId) => `/jobs/${jobId}`,
      transformResponse: (raw: { data: JobDetails }) => raw.data,
      providesTags: (_result, _error, jobId) => [{ type: 'Job', id: jobId }],
    }),

    getRecommendedJobs: builder.query<Job[], string | void>({
      query: (studentId) => {
        if (studentId) return `/jobs/recommended?studentId=${encodeURIComponent(studentId)}`;
        return '/jobs/recommended';
      },
      transformResponse: (raw: { data: Job[] }) => raw.data,
      providesTags: ['Job'],
    }),

    getMyJobs: builder.query<
      Paginated<Job>,
      { page?: number; limit?: number; status?: 'active' | 'closed' | 'draft' } | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit));
        return `/jobs/mine?${query.toString()}`;
      },
      providesTags: ['Job'],
    }),

    createJob: builder.mutation<{ data: Job }, CreateJobPayload>({
      query: (body) => ({ url: '/jobs', method: 'POST', body }),
      invalidatesTags: ['Job'],
    }),

    updateJob: builder.mutation<{ data: Job }, { jobId: string; updates: CreateJobPayload }>({
      query: ({ jobId, updates }) => ({ url: `/jobs/${jobId}`, method: 'PATCH', body: updates }),
      invalidatesTags: (_result, _error, { jobId }) => [{ type: 'Job', id: jobId }, 'Job'],
    }),

    deleteJob: builder.mutation<void, string>({
      query: (jobId) => ({ url: `/jobs/${jobId}`, method: 'DELETE' }),
      invalidatesTags: ['Job'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useLazyGetJobsQuery,
  useGetJobByIdQuery,
  useGetRecommendedJobsQuery,
  useGetMyJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobsApi;
