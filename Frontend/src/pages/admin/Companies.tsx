import { useState } from 'react';
import { useGetCompaniesQuery, useDeleteCompanyMutation } from '@/features/companies/companiesApi';
import { extractErrorMessage } from '@/features/api/baseApi';

export default function ManageCompanies() {
  const { data: companies = [], isLoading: loading, error } = useGetCompaniesQuery();
  const [deleteCompany] = useDeleteCompanyMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    setActionError(null);
    try {
      await deleteCompany(companyId).unwrap();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Companies</h1>

      {(error || actionError) && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {actionError ?? extractErrorMessage(error)}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Website</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Industry</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  No companies found
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-t">
                  <td className="px-6 py-4 font-semibold">{company.name}</td>
                  <td className="px-6 py-4">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">{company.industry || '-'}</td>
                  <td className="px-6 py-4">{company.location || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
