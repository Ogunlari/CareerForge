import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { UserModel } from '../models/user.model.js';
import { SessionModel } from '../models/session.model.js';
import type { AuthUser } from './auth.types.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing bearer token.');
  }

  const payload = verifyAccessToken(header.slice(7));
  if (!payload) {
    throw AppError.unauthorized('Invalid or expired token.');
  }

  // Verify the session still exists and has not been revoked.
  const jti = payload.jti;
  if (!jti) {
    throw AppError.unauthorized('Invalid token.');
  }

  SessionModel.findOne({ access_token_jti: jti, revoked_at: { $exists: false } })
    .maxTimeMS(2000)
    .lean()
    .then((session) => {
      if (!session) {
        next(AppError.unauthorized('Session has been revoked.'));
        return;
      }
      return UserModel.findById(payload.id)
        .select('is_blocked')
        .maxTimeMS(2000)
        .lean()
        .then((doc) => {
          if (!doc) {
            next(AppError.unauthorized('Account no longer exists.'));
            return;
          }
          if (doc.is_blocked) {
            next(
              new AppError(
                'ACCOUNT_BLOCKED',
                403,
                'This account has been suspended. Contact support.'
              )
            );
            return;
          }
          req.user = { id: payload.id, role: payload.role, jti };
          next();
        });
    })
    .catch(next);
}

export function requireRole(...roles: AuthUser['role'][]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  };
}
