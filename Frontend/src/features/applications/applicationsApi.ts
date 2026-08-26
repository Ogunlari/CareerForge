import { baseApi } from '@/features/api/baseApi';
import type { Paginated } from '@/features/jobs/jobsApi';
import type { Application, ApplicationFilterParams, ApplicationStatus } from '@/types';

export interface CreateApplicationPayload {
  studentId: string;
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

const populateApplication = {
  type: 'Application' as const,
  id: 'LIST',
};

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createApplication: builder.mutation<{ data: Application }, CreateApplicationPayload>({
      query: (body) => ({ url: '/applications', method: 'POST', body }),
      invalidatesTags: ['Application', 'Job'],
    }),

    getStudentApplications: builder.query<Paginated<Application>, ApplicationFilterParams & { studentId: string }>({
      query: ({ studentId, ...params }) => {
        const query = new URLSearchParams({ studentId });
        if (params.status) query.append('status', params.status);
        if (params.date_from) query.append('date_from', params.date_from);
        if (params.date_to) query.append('date_to', params.date_to);
        if (params.limit != null) query.append('limit', String(params.limit));
        if (params.page != null) query.append('page', String(params.page));
        return `/applications/student?${query.toString()}`;
      },
      providesTags: [populateApplication],
    }),

    getRecruiterApplications: builder.query<Application[], string>({
      query: (recruiterId) => `/applications/recruiter?recruiterId=${encodeURIComponent(recruiterId)}`,
      transformResponse: (raw: { data: Application[] }) => raw.data,
      providesTags: [populateApplication],
    }),

    getJobApplications: builder.query<Application[], { jobId: string; recruiterId?: string }>({
      query: ({ jobId, recruiterId }) => {
        const query = new URLSearchParams();
        if (recruiterId) query.append('recruiterId', recruiterId);
        return `/jobs/${jobId}/applications?${query.toString()}`;
      },
      transformResponse: (raw: { data: Application[] }) => raw.data,
      providesTags: (_result, _error, { jobId }) => [{ type: 'Application', id: `job-${jobId}` }],
    }),

    getApplicationById: builder.query<Application, string>({
      query: (applicationId) => `/applications/${applicationId}`,
      transformResponse: (raw: { data: Application }) => raw.data,
      providesTags: (_result, _error, applicationId) => [{ type: 'Application', id: applicationId }],
    }),

    checkExistingApplication: builder.query<boolean, { studentId: string; jobId: string }>({
      query: ({ studentId, jobId }) =>
        `/applications/check?studentId=${encodeURIComponent(studentId)}&jobId=${encodeURIComponent(jobId)}`,
      transformResponse: (raw: { data: { exists: boolean } }) => raw.data.exists,
      providesTags: (_result, _error, { jobId }) => [{ type: 'Application', id: `check-${jobId}` }],
    }),

    updateApplicationStatus: builder.mutation<
      { data: Application },
      { applicationId: string; status: Exclude<ApplicationStatus, 'withdrawn'> }
    >({
      query: ({ applicationId, status }) => ({
        url: `/applications/${applicationId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { applicationId }) => [
        populateApplication,
        { type: 'Application', id: applicationId },
        'Notification',
      ],
    }),

    withdrawApplication: builder.mutation<{ message: string }, string>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}/withdraw`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'Job', 'Notification'],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useGetStudentApplicationsQuery,
  useGetRecruiterApplicationsQuery,
  useGetJobApplicationsQuery,
  useGetApplicationByIdQuery,
  useCheckExistingApplicationQuery,
  useLazyCheckExistingApplicationQuery,
  useUpdateApplicationStatusMutation,
  useWithdrawApplicationMutation,
} = applicationsApi;
