import { baseApi } from '@/features/api/baseApi';
import { clearCredentials, setCredentials } from './authSlice';
import type { LoginFormData, Profile, RegisterFormData } from '@/types';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Profile;
}

export interface SessionInfo {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  is_current: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthResponse, RegisterFormData>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      transformResponse: (raw: AuthResponse) => raw,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
        } catch {
          /* error surfaced to the component */
        }
      },
    }),

    login: builder.mutation<AuthResponse, LoginFormData>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
        } catch {
          /* error surfaced to the component */
        }
      },
    }),

    googleAuth: builder.mutation<AuthResponse & { isNewUser?: boolean }, { credential: string; role?: 'student' | 'recruiter' }>({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }));
        } catch {
          /* error surfaced to the component */
        }
      },
    }),

    googleCheck: builder.mutation<{ exists: boolean }, { credential: string }>({
      query: (body) => ({ url: '/auth/google/check', method: 'POST', body }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    getMe: builder.query<{ user: Profile }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    requestPasswordReset: builder.mutation<{ message: string; devResetToken?: string }, { email: string }>({
      query: (body) => ({ url: '/auth/reset-password-request', method: 'POST', body }),
    }),

    verifyToken: builder.query<{ valid: boolean }, void>({
      query: () => '/auth/verify-token',
    }),

    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),

    updatePassword: builder.mutation<{ message: string }, { password: string }>({
      query: (body) => ({ url: '/auth/update-password', method: 'POST', body }),
    }),

    getSessions: builder.query<SessionInfo[], void>({
      query: () => '/auth/sessions',
      transformResponse: (raw: { data: SessionInfo[] }) => raw.data,
      providesTags: ['User'],
    }),

    revokeSession: builder.mutation<{ message: string }, string>({
      query: (jti) => ({ url: `/auth/sessions/${jti}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    logoutAll: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useGoogleAuthMutation,
  useGoogleCheckMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRequestPasswordResetMutation,
  useVerifyTokenQuery,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useLogoutAllMutation,
} = authApi;
