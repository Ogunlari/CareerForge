import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/errors.js';

export function validateBody(schema: ZodTypeAny): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(AppError.badRequest('Invalid request body.', result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(AppError.badRequest('Invalid query parameters.', result.error.flatten()));
      return;
    }
    Object.assign(req.query, result.data);
    next();
  };
}
