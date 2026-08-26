import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyJobsQuery, useDeleteJobMutation, useUpdateJobMutation } from '@/features/jobs/jobsApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/utilities/constants';
import type { Job, JobType } from '@/types';

const splitList = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.join(', ') : (value || '');

export default function ManageJobs() {
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading: loading, error } = useGetMyJobsQuery();
  const jobs = data?.data ?? [];
  const [deleteJob] = useDeleteJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const [editingJob, setEditingJob] = useState<Job | null>(null);
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

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        description: editingJob.description || '',
        location: editingJob.location || '',
        job_type: (editingJob.job_type as JobType) || 'full-time',
        salary_min: editingJob.salary_min?.toString() || '',
        salary_max: editingJob.salary_max?.toString() || '',
        experience_level: editingJob.experience_level || '',
        requirements: splitList(editingJob.requirements),
        benefits: splitList(editingJob.benefits),
      });
    }
  }, [editingJob]);

  const handleDelete = async (jobId: string) => {
    setActionError(null);
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      await deleteJob(jobId).unwrap();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setActionError(null);
    try {
      const toNumber = (v: string) => (v === '' ? undefined : Number(v));
      const toList = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);
      await updateJob({
        jobId: editingJob.id,
        updates: {
          title: formData.title,
          description: formData.description,
          location: formData.location || undefined,
          job_type: formData.job_type,
          experience_level: formData.experience_level || undefined,
          salary_min: toNumber(formData.salary_min),
          salary_max: toNumber(formData.salary_max),
          requirements: toList(formData.requirements),
          benefits: toList(formData.benefits),
        },
      }).unwrap();
      setEditingJob(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link to="/recruiter/create-job" className="bg-blue-600 text-white px-6 py-2 rounded">
          Post New Job
        </Link>
      </div>

      {(error || actionError) && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {actionError ?? extractErrorMessage(error)}
        </div>
      )}

      {editingJob && (
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Job</h2>
            <button onClick={() => setEditingJob(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Job Title *</label>
              <input type="text" name="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description *</label>
              <textarea name="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Location *</label>
                <input type="text" name="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} required className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={(e) => setFormData((p) => ({ ...p, job_type: e.target.value as JobType }))} className="w-full px-4 py-2 border border-gray-300 rounded">
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Salary Min</label>
                <input type="number" name="salary_min" value={formData.salary_min} onChange={(e) => setFormData((p) => ({ ...p, salary_min: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Salary Max</label>
                <input type="number" name="salary_max" value={formData.salary_max} onChange={(e) => setFormData((p) => ({ ...p, salary_max: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Experience Level</label>
              <select name="experience_level" value={formData.experience_level} onChange={(e) => setFormData((p) => ({ ...p, experience_level: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded">
                <option value="">Select level...</option>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Requirements (comma-separated)</label>
              <textarea name="requirements" value={formData.requirements} onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Benefits (comma-separated)</label>
              <textarea name="benefits" value={formData.benefits} onChange={(e) => setFormData((p) => ({ ...p, benefits: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" disabled={isUpdating} className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applications</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Posted</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">Loading...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">No jobs posted yet</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-6 py-4">
                    {job.title}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4">{job.job_type}</td>
                  <td className="px-6 py-4">{job.applicants_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(job.posted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => setEditingJob(job)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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
