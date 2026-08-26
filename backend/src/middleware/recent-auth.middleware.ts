import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import type { Request, Response, NextFunction } from 'express';

const REAUTH_MAX_AGE_SECONDS = 5 * 60; // 5 minutes

export function requireRecentAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication required');
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    if (decoded.iat == null) {
      throw AppError.unauthorized('Invalid token');
    }

    const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
    if (tokenAge > REAUTH_MAX_AGE_SECONDS) {
      throw AppError.forbidden('Please re-authenticate to perform this action');
    }

    next();
  } catch (err) {
    next(err);
  }
}
