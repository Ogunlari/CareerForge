import { CompanyModel } from '../../models/company.model.js';
import { UserModel } from '../../models/user.model.js';
import { JobModel } from '../../models/job.model.js';
import { AppError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.types.js';

function serialize(doc: Record<string, unknown>) {
  return { ...doc, id: String(doc._id), _id: undefined };
}

export async function listCompanies() {
  const companies = await CompanyModel.find().sort({ name: 1 }).limit(500).maxTimeMS(5000);
  return companies.map((c) => serialize(c.toObject() as unknown as Record<string, unknown>));
}

export async function getCompanyById(companyId: string) {
  const company = await CompanyModel.findById(companyId).maxTimeMS(2000);
  if (!company) throw AppError.notFound('Company not found.');
  return serialize(company.toObject() as unknown as Record<string, unknown>);
}

export async function createCompany(
  data: Record<string, unknown>,
  user?: AuthUser,
) {
  const company = await CompanyModel.create(data);
  if (user && user.role === 'recruiter') {
    await UserModel.updateOne(
      { _id: user.id, company_id: { $exists: false } },
      { company_id: company._id },
    );
  }
  return serialize(company.toObject() as unknown as Record<string, unknown>);
}

export async function updateCompany(companyId: string, updates: Record<string, unknown>, user?: AuthUser) {
  if (user && user.role !== 'admin') {
    const companyUser = await UserModel.findById(user.id).select('company_id').maxTimeMS(2000);
    if (!companyUser || String(companyUser.company_id) !== companyId) {
      throw AppError.forbidden('You can only update your own company.');
    }
  }
  const company = await CompanyModel.findByIdAndUpdate(companyId, updates, {
    new: true,
    runValidators: true,
  }).maxTimeMS(2000);
  if (!company) throw AppError.notFound('Company not found.');
  return serialize(company.toObject() as unknown as Record<string, unknown>);
}

export async function deleteCompany(companyId: string, user?: AuthUser) {
  if (user && user.role !== 'admin') {
    const companyUser = await UserModel.findById(user.id).select('company_id').maxTimeMS(2000);
    if (!companyUser || String(companyUser.company_id) !== companyId) {
      throw AppError.forbidden('You can only delete your own company.');
    }
  }
  const company = await CompanyModel.findByIdAndDelete(companyId).maxTimeMS(2000);
  if (!company) throw AppError.notFound('Company not found.');
  await UserModel.updateMany({ company_id: companyId }, { $unset: { company_id: '' } }).maxTimeMS(2000);
  await JobModel.updateMany({ company_id: companyId }, { $set: { status: 'closed' } }).maxTimeMS(2000);
}
