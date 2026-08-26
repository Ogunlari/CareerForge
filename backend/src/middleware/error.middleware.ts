import * as Sentry from '@sentry/node';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    code: ErrorCodes.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = res.locals.requestId ?? req.headers['x-request-id'] ?? undefined;

  if (err instanceof AppError) {
    logger.warn(err.message, { code: err.code, path: req.originalUrl });
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
      requestId,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed.',
      details: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
      requestId,
    });
    return;
  }

  if (err instanceof mongoose.Error && 'code' in err && (err as { code?: number }).code === 11000) {
    res.status(409).json({
      code: ErrorCodes.CONFLICT,
      message: 'A record with these unique values already exists.',
      requestId,
    });
    return;
  }

  logger.error('Unhandled error', {
    method: req.method,
    path: req.originalUrl,
    error: err,
  });

  Sentry.captureException(err);

  res.status(500).json({
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'Something went wrong on our end. Please try again later.',
    requestId,
  });
}
