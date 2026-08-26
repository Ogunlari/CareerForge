import { baseApi } from '@/features/api/baseApi';
import type { Paginated } from '@/features/jobs/jobsApi';
import type { Notification, NotificationType } from '@/types';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Paginated<Notification>, { userId: string; page?: number; limit?: number }>({
      query: ({ userId, page = 1, limit = 20 }) =>
        `/notifications?userId=${encodeURIComponent(userId)}&page=${page}&limit=${limit}`,
      providesTags: ['Notification'],
    }),

    createNotification: builder.mutation<
      { data: Notification },
      { userId: string; type: NotificationType; title: string; message: string; relatedId?: string }
    >({
      query: (body) => ({ url: '/notifications', method: 'POST', body }),
      invalidatesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<{ message: string }, { userId: string }>({
      query: (body) => ({ url: '/notifications/read-all', method: 'PATCH', body }),
      invalidatesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<number, { userId: string }>({
      query: ({ userId }) => `/notifications/unread-count?userId=${encodeURIComponent(userId)}`,
      transformResponse: (raw: { data: { count: number } }) => raw.data.count,
      providesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({ url: `/notifications/${notificationId}`, method: 'DELETE' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetUnreadCountQuery,
  useDeleteNotificationMutation,
} = notificationsApi;
