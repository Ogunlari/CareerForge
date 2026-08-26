import { UserModel } from '../../models/user.model.js';
import type { UserDocument } from '../../models/user.model.js';

export type PublicUser = Record<string, unknown>;

export function toPublicUser(user: UserDocument | Record<string, unknown>): PublicUser {
  const raw = typeof user.toObject === 'function'
    ? (user.toObject() as Record<string, unknown>)
    : { ...user } as Record<string, unknown>;
  delete raw.password_hash;
  delete raw.__v;
  return { ...raw, id: String(user._id) };
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return UserModel.findOne({ email: email.toLowerCase() }) as Promise<UserDocument | null>;
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  return UserModel.findById(id) as Promise<UserDocument | null>;
}

export async function insertUser(data: {
  email: string;
  password_hash: string;
  full_name: string;
  role: 'student' | 'recruiter' | 'admin';
}): Promise<UserDocument> {
  return UserModel.create(data) as Promise<UserDocument>;
}
