import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  res.locals.requestId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('X-Request-Id', String(res.locals.requestId));
  next();
}
