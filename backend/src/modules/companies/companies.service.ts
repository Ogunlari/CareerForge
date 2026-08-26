import { CompanyModel } from '../../models/company.model.js';
import { UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.types.js';

function serialize(doc: Record<string, unknown>) {
  return { ...doc, id: String(doc._id), _id: undefined };
}

export async function listCompanies() {
  const companies = await CompanyModel.find().sort({ name: 1 }).limit(500);
  return companies.map((c) => serialize(c.toObject() as unknown as Record<string, unknown>));
}

export async function getCompanyById(companyId: string) {
  const company = await CompanyModel.findById(companyId);
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

export async function updateCompany(companyId: string, updates: Record<string, unknown>) {
  const company = await CompanyModel.findByIdAndUpdate(companyId, updates, {
    new: true,
    runValidators: true,
  });
  if (!company) throw AppError.notFound('Company not found.');
  return serialize(company.toObject() as unknown as Record<string, unknown>);
}

export async function deleteCompany(companyId: string) {
  const company = await CompanyModel.findByIdAndDelete(companyId);
  if (!company) throw AppError.notFound('Company not found.');
}
