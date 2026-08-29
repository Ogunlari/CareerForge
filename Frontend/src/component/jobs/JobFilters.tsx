import { Search, MapPin, Briefcase, BarChart3, X } from 'lucide-react';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/utilities/constants';

interface JobFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  jobType: string;
  setJobType: (v: string) => void;
  experienceLevel: string;
  setExperienceLevel: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export default function JobFilters({
  search, setSearch, jobType, setJobType,
  experienceLevel, setExperienceLevel, location, setLocation, onReset, onApply,
}: JobFiltersProps) {
  const hasFilters = search || jobType || experienceLevel || location;

  return (
    <form
      className="card p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-primary-500" /> Filters
        </h3>
        {hasFilters && (
          <button onClick={onReset} className="text-xs text-slate-500 hover:text-error-500 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, keyword..."
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or country..."
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" /> Job Type
        </label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input">
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5" /> Experience
        </label>
        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input">
          <option value="">All levels</option>
          {EXPERIENCE_LEVELS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" /> Search Jobs
      </button>
    </form>
  );
}
