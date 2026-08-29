import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useGetJobsQuery } from '@/features/jobs/jobsApi';
import { PAGE_SIZE } from '@/utilities/constants';
import type { JobType } from '@/types';
import JobCard from '@/component/jobs/JobCard';
import JobFilters from '@/component/jobs/JobFilters';
import Loader from '@/component/common/Loader';
import Pagination from '@/component/common/Pagination';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [applied, setApplied] = useState({
    search: searchParams.get('search') || '',
    job_type: '' as string,
    experience_level: '',
    location: '',
  });

  const { data, isLoading, error } = useGetJobsQuery({
    search: applied.search || undefined,
    job_type: (applied.job_type as JobType) || undefined,
    experience_level: applied.experience_level || undefined,
    location: applied.location || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const jobs = data?.data ?? [];
  const total = typeof data?.total === 'number' ? data.total : jobs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleApply = () => {
    setApplied({ search, job_type: jobType, experience_level: experienceLevel, location });
    setCurrentPage(1);
    if (search) setSearchParams({ search });
  };

  const handleReset = () => {
    setSearch('');
    setJobType('');
    setExperienceLevel('');
    setLocation('');
    setApplied({ search: '', job_type: '', experience_level: '', location: '' });
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="pt-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-slate-900">Browse Jobs</h1>
          <p className="text-slate-500 mt-1">{total} opportunities available</p>
        </div>

        <div className="flex gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <JobFilters
                search={search}
                setSearch={setSearch}
                jobType={jobType}
                setJobType={setJobType}
                experienceLevel={experienceLevel}
                setExperienceLevel={setExperienceLevel}
                location={location}
                setLocation={setLocation}
                onReset={handleReset}
                onApply={handleApply}
              />
            </div>
          </div>

          {/* Job List */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <button
                onClick={() => setShowFilters(true)}
                className="btn-secondary text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <span className="text-sm text-slate-500">{total} jobs</span>
            </div>

            {isLoading ? (
              <Loader fullPage label="Loading jobs..." />
            ) : error ? (
              <div className="card p-12 text-center">
                <p className="text-red-600 text-lg">Failed to load jobs. Please try again later.</p>
                <button onClick={handleReset} className="btn-ghost mt-4 text-sm">
                  Clear filters
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-slate-400 text-lg">No jobs found matching your criteria.</p>
                <button onClick={handleReset} className="btn-ghost mt-4 text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  pages={Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10)}
                  canPrev={currentPage > 1}
                  canNext={currentPage < totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-50 overflow-y-auto animate-slide-down p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <JobFilters
                search={search}
                setSearch={setSearch}
                jobType={jobType}
                setJobType={setJobType}
                experienceLevel={experienceLevel}
                setExperienceLevel={setExperienceLevel}
                location={location}
                setLocation={setLocation}
                onReset={handleReset}
                onApply={handleApply}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}