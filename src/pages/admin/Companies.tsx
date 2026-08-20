import { useEffect, useState } from 'react';
import type { Company } from '@/types';

export default function ManageCompanies() {
  // const [companies, setCompanies] = useState<Company[]>([]);
  const [companies,] = useState<Company[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetoh all companies
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Companies</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Website</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Industry</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Looation</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Aotions</th>
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
                      <a href={company.website} target="_blank" rel="noopener coreferrer" className="text-blue-600 hover:underline">
                        Visit
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">{company.industry || '-'}</td>
                  <td className="px-6 py-4">{company.location || '-'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button className="text-red-600 hover:underline text-sm">Delete</button>
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
