import { UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/errors.js';

export async function findProfileById(id: string) {
  const user = await UserModel.findById(id).maxTimeMS(2000);
  if (!user) throw AppError.notFound('Profile not found.');
  return user;
}

export async function updateProfile(id: string, updates: Record<string, unknown>) {
  const allowed = [
    'full_name',
    'avatar',
    'title',
    'bio',
    'phone',
    'location',
    'skills',
    'education',
    'experience',
    'resume_url',
    'position',
    'company_id',
  ];

  const $set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) $set[key] = updates[key];
  }

  return UserModel.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).maxTimeMS(2000);
}
