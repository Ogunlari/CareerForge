import { AppError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import { findProfileById, updateProfile } from './users.repository.js';

function stripPrivate(user: { toObject?: () => Record<string, unknown> }) {
  const raw = (user.toObject?.() ?? user) as Record<string, unknown>;
  delete raw.password_hash;
  delete raw.__v;
  return raw;
}

export async function getProfile(requester: AuthUser, profileId: string) {
  const user = await findProfileById(profileId);

  if (requester.id === String(user._id) || requester.role === 'admin') {
    return stripPrivate(user);
  }

  if (requester.role === 'recruiter' && user.role === 'student') {
    return stripPrivate(user);
  }

  throw AppError.forbidden('You cannot view this profile.');
}

export async function patchProfile(requester: AuthUser, profileId: string, updates: Record<string, unknown>) {
  if (requester.id !== profileId && requester.role !== 'admin') {
    throw AppError.forbidden('You can only update your own profile.');
  }
  const updated = await updateProfile(profileId, updates);
  if (!updated) throw AppError.notFound('Profile not found.');
  return stripPrivate(updated);
}

export async function getStudentProfile(requester: AuthUser, studentId: string) {
  const user = await findProfileById(studentId);
  if (user.role !== 'student') {
    throw AppError.notFound('Student not found.');
  }
  if (requester.id === String(user._id) || requester.role === 'admin' || requester.role === 'recruiter') {
    return stripPrivate(user);
  }
  throw AppError.forbidden('You cannot view this profile.');
}
