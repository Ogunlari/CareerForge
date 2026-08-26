import { baseApi } from '@/features/api/baseApi';
import type { Profile, StudentProfile } from '@/types';

export interface UpdateProfilePayload {
  full_name?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  education?: Profile['education'];
  experience?: Profile['experience'];
  resume_url?: string;
  position?: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, string>({
      query: (id) => `/profiles/${id}`,
      transformResponse: (raw: { data: Profile }) => raw.data,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation<Profile, { id: string; updates: UpdateProfilePayload }>({
      query: ({ id, updates }) => ({ url: `/profiles/${id}`, method: 'PATCH', body: updates }),
      transformResponse: (raw: { data: Profile }) => raw.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, 'StudentProfile'],
    }),

    getStudentProfile: builder.query<StudentProfile, string>({
      query: (studentId) => `/students/${studentId}`,
      providesTags: (_result, _error, studentId) => [{ type: 'StudentProfile', id: studentId }],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useGetStudentProfileQuery } = usersApi;
