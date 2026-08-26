import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGetCompanyByIdQuery, useUpdateCompanyMutation, useCreateCompanyMutation } from '@/features/companies/companiesApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import { CompanySchema } from '@/utilities/schemas';
import type { Company } from '@/types';

const emptyForm = {
  name: '',
  description: '',
  website: '',
  location: '',
  industry: '',
  size: '',
};

export default function CompanyProfile() {
  const { user, refreshUser } = useAuth();
  const companyId = user?.company_id;

  const { data: company, isLoading, error } = useGetCompanyByIdQuery(companyId!, { skip: !companyId });
  const [updateCompany, { isLoading: isSaving }] = useUpdateCompanyMutation();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        location: company.location || '',
        industry: company.industry || '',
        size: company.size || '',
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setFormError(null);
    setFieldErrors({});

    const result = CompanySchema.safeParse(formData);
    if (!result.success) {
      const { fieldErrors: fe } = result.error.flatten();
      setFieldErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }

    try {
      await updateCompany({ companyId, updates: result.data }).unwrap();
      setIsEditing(false);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const result = CompanySchema.safeParse(formData);
    if (!result.success) {
      const { fieldErrors: fe } = result.error.flatten();
      setFieldErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }

    try {
      await createCompany(result.data as { name: string }).unwrap();
      await refreshUser();
      setIsCreatingCompany(false);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  };

  const resetForm = () => setFormData(emptyForm);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded shadow p-6 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded shadow p-6 text-center text-red-600">
          Failed to load company profile.
        </div>
      </div>
    );
  }

  if (!companyId || isCreatingCompany) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Create Company</h1>
          <p className="text-gray-600 mb-6">
            Set up your company profile to start posting jobs.
          </p>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.website ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.website && <p className="text-red-500 text-xs mt-1">{fieldErrors.website}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.industry ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.industry && <p className="text-red-500 text-xs mt-1">{fieldErrors.industry}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Company Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.size ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.size && <p className="text-red-500 text-xs mt-1">{fieldErrors.size}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Company'}
              </button>
              {companyId && (
                <button
                  type="button"
                  onClick={() => { setIsCreatingCompany(false); resetForm(); setFormError(null); }}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setFormError(null);
              setFieldErrors({});
              if (company) {
                setFormData({
                  name: company.name || '',
                  description: company.description || '',
                  website: company.website || '',
                  location: company.location || '',
                  industry: company.industry || '',
                  size: company.size || '',
                });
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.website ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.website && <p className="text-red-500 text-xs mt-1">{fieldErrors.website}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.industry ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.industry && <p className="text-red-500 text-xs mt-1">{fieldErrors.industry}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Company Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded ${fieldErrors.size ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.size && <p className="text-red-500 text-xs mt-1">{fieldErrors.size}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Company Name</h3>
              <p className="text-lg">{company?.name || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600">Description</h3>
              <p className="text-lg">{company?.description || 'Not set'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Website</h3>
                <p className="text-lg">{company?.website || 'Not set'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Location</h3>
                <p className="text-lg">{company?.location || 'Not set'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Industry</h3>
                <p className="text-lg">{company?.industry || 'Not set'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Company Size</h3>
                <p className="text-lg">{company?.size || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
