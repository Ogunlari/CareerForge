import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import type { AuthUser } from '../middleware/auth.types.js';

export function signAccessToken(user: Pick<AuthUser, 'id' | 'role'>, jti: string): string {
  return jwt.sign({ role: user.role, jti }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): (AuthUser & { jti?: string }) | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.role !== 'string') return null;
    const role = decoded.role;
    if (role !== 'student' && role !== 'recruiter' && role !== 'admin') return null;
    return { id: String(decoded.sub), role, jti: decoded.jti as string | undefined };
  } catch {
    return null;
  }
}

// Kept for backwards compatibility during migration.
export function signAuthToken(user: Pick<AuthUser, 'id' | 'role'>): string {
  return signAccessToken(user, randomUUID());
}

export function verifyAuthToken(token: string): AuthUser | null {
  return verifyAccessToken(token);
}
