import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ExternalLink } from 'lucide-react';

import { useGetCompaniesQuery } from '@/features/companies/companiesApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import Loader from '@/component/common/Loader';

export default function Companies() {
  const { data: companies = [], isLoading: loading, error } = useGetCompaniesQuery();
  const [search, setSearch] = useState('');

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="pt-16"><Loader fullPage label="Loading companies..." /></div>;

  return (
    <div className="pt-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-1">{filtered.length} companies hiring</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="input max-w-md"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {extractErrorMessage(error)}
          </div>
        )}

        {filtered.length === 0 && !error ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400 text-lg">No companies found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((company) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="card p-6 hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {company.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{company.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{company.industry || 'Industry not specified'}</p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-slate-600 mt-4 line-clamp-2 leading-relaxed">{company.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-500">
                  {company.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {company.location}</span>}
                  {company.size && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {company.size}</span>}
                  {company.website && <span className="flex items-center gap-1 text-primary-500"><ExternalLink className="w-3.5 h-3.5" /> Website</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}