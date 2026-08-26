import { baseApi } from '@/features/api/baseApi';
import type { Company } from '@/types';

export type CreateCompanyPayload = Partial<Omit<Company, 'id' | 'created_at'>> & { name: string };

export const companiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<Company[], void>({
      query: () => '/companies',
      transformResponse: (raw: { data: Company[] }) => raw.data,
      providesTags: ['Company'],
    }),

    getCompanyById: builder.query<Company, string>({
      query: (companyId) => `/companies/${companyId}`,
      transformResponse: (raw: { data: Company }) => raw.data,
      providesTags: (_result, _error, companyId) => [{ type: 'Company', id: companyId }],
    }),

    createCompany: builder.mutation<{ data: Company }, CreateCompanyPayload>({
      query: (body) => ({ url: '/companies', method: 'POST', body }),
      invalidatesTags: ['Company'],
    }),

    updateCompany: builder.mutation<{ data: Company }, { companyId: string; updates: Partial<CreateCompanyPayload> }>({
      query: ({ companyId, updates }) => ({ url: `/companies/${companyId}`, method: 'PATCH', body: updates }),
      invalidatesTags: (_result, _error, { companyId }) => [{ type: 'Company', id: companyId }, 'Company'],
    }),

    deleteCompany: builder.mutation<void, string>({
      query: (companyId) => ({ url: `/companies/${companyId}`, method: 'DELETE' }),
      invalidatesTags: ['Company'],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi;
