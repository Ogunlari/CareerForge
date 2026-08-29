import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { env, isProduction } from '../../config/env.js';
import { PasswordResetTokenModel } from '../../models/password-reset-token.model.js';
import { SessionModel } from '../../models/session.model.js';
import { UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/errors.js';
import { signAccessToken } from '../../utils/jwt.js';
import { sendMailSafe } from '../../services/mail/index.js';
import {
  findUserByEmail,
  findUserById,
  insertUser,
  toPublicUser,
  type PublicUser,
} from './auth.repository.js';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

function assertNotBlocked(user: { is_blocked?: boolean }): void {
  if (user.is_blocked) {
    throw new AppError('ACCOUNT_BLOCKED', 403, 'This account has been suspended. Contact support.');
  }
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

async function createSession(
  userId: string,
  family?: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<{ accessToken: string; refreshToken: string; jti: string }> {
  const jti = randomBytes(16).toString('hex');
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const tokenFamily = family || randomBytes(16).toString('hex');

  await SessionModel.create({
    user_id: userId,
    token_family: tokenFamily,
    refresh_token_hash: refreshTokenHash,
    access_token_jti: jti,
    user_agent: userAgent || '',
    ip_address: ipAddress || '',
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  const user = await UserModel.findById(userId).lean().maxTimeMS(2000).exec();
  const role = user?.role || 'student';
  const accessToken = signAccessToken({ id: userId, role }, jti);

  return { accessToken, refreshToken, jti };
}

async function revokeSessionByJti(jti: string): Promise<void> {
  await SessionModel.updateOne({ access_token_jti: jti }, { revoked_at: new Date() });
}

export async function signup(
  input: { email: string; password: string; name: string; role: 'student' | 'recruiter' | 'admin' },
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw AppError.conflict('An account with this email already exists.');
  if (input.role === 'admin') throw AppError.forbidden('Admin accounts cannot be self-registered.');

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await insertUser({
    email: input.email,
    password_hash,
    full_name: input.name,
    role: input.role,
  });

  const userId = String(user._id);
  const { accessToken, refreshToken } = await createSession(userId, undefined, meta?.userAgent, meta?.ipAddress);

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function login(
  input: { email: string; password: string },
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user) throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password.');

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordMatches) throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password.');

  assertNotBlocked(user);

  const userId = String(user._id);
  const { accessToken, refreshToken } = await createSession(userId, undefined, meta?.userAgent, meta?.ipAddress);

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refreshSession(
  refreshToken: string,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthResult> {
  const tokenHash = hashToken(refreshToken);
  const session = await SessionModel.findOne({ refresh_token_hash: tokenHash }).maxTimeMS(2000);

  if (!session) throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Invalid or expired refresh token.');

  // Token reuse detection: if this refresh token was already replaced, the entire
  // family has been compromised. Revoke all sessions for this user.
  if (session.replaced_by_token_hash) {
    await SessionModel.updateMany(
      { user_id: session.user_id, revoked_at: { $exists: false } },
      { revoked_at: new Date() },
    );
    throw new AppError('TOKEN_REUSE_DETECTED', 401, 'Session revoked due to suspicious activity. Please log in again.');
  }

  if (session.revoked_at) {
    throw new AppError('INVALID_REFRESH_TOKEN', 401, 'This refresh token has been revoked.');
  }

  if (session.expires_at.getTime() < Date.now()) {
    throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token has expired. Please log in again.');
  }

  // Check the user still exists and is not blocked.
  const user = await UserModel.findById(session.user_id).lean().maxTimeMS(2000).exec();
  if (!user) throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Account no longer exists.');
  if (user.is_blocked) throw new AppError('ACCOUNT_BLOCKED', 403, 'This account has been suspended. Contact support.');

  // Rotate: mark old session as replaced, create new session in same family.
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);
  const newJti = randomBytes(16).toString('hex');

  session.replaced_by_token_hash = newRefreshTokenHash;
  await session.save();

  await SessionModel.create({
    user_id: session.user_id,
    token_family: session.token_family,
    refresh_token_hash: newRefreshTokenHash,
    access_token_jti: newJti,
    user_agent: meta?.userAgent || session.user_agent,
    ip_address: meta?.ipAddress || session.ip_address,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  const accessToken = signAccessToken({ id: String(user._id), role: user.role }, newJti);

  return { accessToken, refreshToken: newRefreshToken, user: toPublicUser(user as never) };
}

export async function logout(jti: string): Promise<void> {
  await revokeSessionByJti(jti);
}

export async function logoutAll(userId: string): Promise<void> {
  await SessionModel.updateMany({ user_id: userId, revoked_at: { $exists: false } }, { revoked_at: new Date() });
}

export interface SessionInfo {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: Date;
  is_current: boolean;
}

export async function listSessions(userId: string, currentJti: string): Promise<SessionInfo[]> {
  const sessions = await SessionModel.find({
    user_id: userId,
    revoked_at: { $exists: false },
    expires_at: { $gt: new Date() },
  })
    .sort({ created_at: -1 })
    .maxTimeMS(2000)
    .lean()
    .exec();

  return sessions.map((s: Record<string, unknown>) => ({
    id: String(s.access_token_jti),
    user_agent: String(s.user_agent || ''),
    ip_address: String(s.ip_address || ''),
    created_at: s.created_at as Date,
    is_current: s.access_token_jti === currentJti,
  }));
}

export async function revokeSession(userId: string, targetJti: string): Promise<void> {
  const result = await SessionModel.updateOne(
    { user_id: userId, access_token_jti: targetJti, revoked_at: { $exists: false } },
    { revoked_at: new Date() },
  );
  if (result.modifiedCount === 0) {
    throw AppError.notFound('Session not found or already revoked.');
  }
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) throw AppError.unauthorized();
  assertNotBlocked(user);
  return toPublicUser(user);
}

export async function requestPasswordReset(email: string): Promise<{ devResetToken?: string }> {
  const user = await findUserByEmail(email);

  if (user) {
    const rawToken = randomBytes(32).toString('hex');
    const token_hash = createHash('sha256').update(rawToken).digest('hex');

    await PasswordResetTokenModel.create({
      user_id: user._id,
      token_hash,
      expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${env.APP_BASE_URL}/auth/reset-password?token=${rawToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, ignore this email.</p>
    `;

    await sendMailSafe({
      to: user.email,
      subject: 'CareerForge - Reset Your Password',
      html,
    });

    if (!isProduction && !process.env.SMTP_HOST) {
      return { devResetToken: rawToken };
    }
  }
  return {};
}

export async function completePasswordReset(rawToken: string, newPassword: string): Promise<void> {
  const token_hash = createHash('sha256').update(rawToken).digest('hex');
  const record = await PasswordResetTokenModel.findOne({ token_hash }).maxTimeMS(2000);

  if (!record || record.used_at || record.expires_at.getTime() < Date.now()) {
    throw new AppError('INVALID_RESET_TOKEN', 400, 'This reset link is invalid or has expired. Please request a new one.');
  }

  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const user = await UserModel.findByIdAndUpdate(record.user_id, { password_hash }).maxTimeMS(2000);
  if (!user) {
    throw new AppError('INVALID_RESET_TOKEN', 400, 'This reset link is invalid or has expired. Please request a new one.');
  }

  // Invalidate all sessions for this user on password reset.
  await SessionModel.updateMany({ user_id: record.user_id, revoked_at: { $exists: false } }, { revoked_at: new Date() });

  record.used_at = new Date();
  await record.save();
}

export async function updatePassword(userId: string, newPassword: string): Promise<PublicUser> {
  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const user = await UserModel.findByIdAndUpdate(userId, { password_hash }, { new: true }).maxTimeMS(2000);
  if (!user) throw AppError.unauthorized();

  // Invalidate all sessions except the current one (caller should pass their jti).
  await SessionModel.updateMany({ user_id: userId, revoked_at: { $exists: false } }, { revoked_at: new Date() });

  return toPublicUser(user);
}
