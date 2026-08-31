import type { Request, Response } from 'express';
import { ok, okMessage } from '../../utils/http.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import * as authService from './auth.service.js';
import {
  googleAuthSchema,
  loginSchema,
  refreshSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signupSchema,
  updatePasswordSchema,
} from './auth.schemas.js';

export async function signup(req: Request, res: Response): Promise<void> {
  const input = signupSchema.parse(req.body);
  const result = await authService.signup(input, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.status(201).json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.status(200).json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  const input = googleAuthSchema.parse(req.body);
  const result = await authService.googleAuth(input.credential, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.status(200).json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const input = refreshSchema.parse(req.body);
  const result = await authService.refreshSession(input.refreshToken, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  res.status(200).json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser & { jti?: string };
  if (user.jti) {
    await authService.logout(user.jti);
  }
  okMessage(res, 'Logged out.');
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const profile = await authService.getMe(user.id);
  res.status(200).json({ user: profile });
}

export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  const input = resetPasswordRequestSchema.parse(req.body);
  const result = await authService.requestPasswordReset(input.email);
  res.status(200).json({
    message: 'If an account with that email exists, a password reset link has been sent.',
    ...(result.devResetToken ? { devResetToken: result.devResetToken } : {}),
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const input = resetPasswordSchema.parse(req.body);
  await authService.completePasswordReset(input.token, input.password);
  okMessage(res, 'Password has been reset. You can now sign in with your new password.');
}

export async function verifyToken(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: { valid: true } });
}

export async function updatePassword(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const input = updatePasswordSchema.parse(req.body);
  await authService.updatePassword(user.id, input.password);
  okMessage(res, 'Password updated.');
}

export async function listSessions(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const sessions = await authService.listSessions(user.id, user.jti || '');
  ok(res, sessions);
}

export async function revokeSession(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const targetJti = req.params.jti as string;
  await authService.revokeSession(user.id, targetJti);
  okMessage(res, 'Session revoked.');
}

export async function logoutAll(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  await authService.logoutAll(user.id);
  okMessage(res, 'All sessions revoked.');
}
