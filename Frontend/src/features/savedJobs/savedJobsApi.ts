import { baseApi } from '@/features/api/baseApi';
import type { SavedJob } from '@/types';

export const savedJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveJob: builder.mutation<{ message: string }, { studentId: string; jobId: string }>({
      query: (body) => ({ url: '/saved-jobs', method: 'POST', body }),
      invalidatesTags: ['SavedJob'],
    }),

    unsaveJob: builder.mutation<{ message: string }, { studentId: string; jobId: string }>({
      query: (body) => ({ url: '/saved-jobs/unsave', method: 'POST', body }),
      invalidatesTags: ['SavedJob'],
    }),

    checkJobSaved: builder.query<boolean, { studentId: string; jobId: string }>({
      query: ({ studentId, jobId }) =>
        `/saved-jobs/check?studentId=${encodeURIComponent(studentId)}&jobId=${encodeURIComponent(jobId)}`,
      transformResponse: (raw: { data: { saved: boolean } }) => raw.data.saved,
      providesTags: ['SavedJob'],
    }),

    getSavedJobs: builder.query<SavedJob[], string>({
      query: (studentId) => `/saved-jobs?studentId=${encodeURIComponent(studentId)}`,
      transformResponse: (raw: { data: SavedJob[] }) => raw.data,
      providesTags: ['SavedJob'],
    }),
  }),
});

export const {
  useSaveJobMutation,
  useUnsaveJobMutation,
  useCheckJobSavedQuery,
  useGetSavedJobsQuery,
} = savedJobsApi;
