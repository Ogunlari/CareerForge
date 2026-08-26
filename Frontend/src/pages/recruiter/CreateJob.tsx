import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateJobMutation } from '@/features/jobs/jobsApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/utilities/constants';
import { CreateJobSchema } from '@/utilities/schemas';
import type { JobType } from '@/types';

const splitList = (value: string | undefined) =>
  (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);

export default function CreateJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time' as JobType,
    salary_min: '',
    salary_max: '',
    experience_level: '',
    requirements: '',
    benefits: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createJob, { isLoading: loading }] = useCreateJobMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toNumber = (value: string) => (value === '' ? undefined : Number(value));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = CreateJobSchema.safeParse(formData);
    if (!result.success) {
      const { fieldErrors: fe } = result.error.flatten();
      setFieldErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }

    const data = result.data;
    try {
      await createJob({
        title: data.title,
        description: data.description,
        location: data.location || undefined,
        job_type: data.job_type,
        experience_level: data.experience_level || undefined,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        requirements: splitList(data.requirements),
        benefits: splitList(data.benefits),
      }).unwrap();
      navigate('/recruiter/manage-jobs');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Senior Frontend Developer"
            />
            {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Job description"
            />
            {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="City, Country"
              />
              {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Job Type *</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.job_type ? 'border-red-500' : 'border-gray-300'}`}
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {fieldErrors.job_type && <p className="text-red-500 text-xs mt-1">{fieldErrors.job_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Salary Min</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.salary_min ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
              {fieldErrors.salary_min && <p className="text-red-500 text-xs mt-1">{fieldErrors.salary_min}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Salary Max</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 ${fieldErrors.salary_max ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
              {fieldErrors.salary_max && <p className="text-red-500 text-xs mt-1">{fieldErrors.salary_max}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Experience Level *</label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Select level...</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Requirements (comma-separated)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="React, TypeScript, 3+ years experience"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Benefits (comma-separated)</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Health insurance, Flexible schedule, Remote work"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
