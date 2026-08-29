import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.types.js';
import { AppError } from '../../utils/errors.js';
import { ok, param, queryString } from '../../utils/http.js';
import * as service from './files.service.js';

export async function upload(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const file = req.file;
  if (!file) {
    throw AppError.badRequest('No file was provided.');
  }
  const result = await service.uploadResume(user, {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
  });
  ok(res, result, 201);
}

export async function getSigned(req: Request, res: Response): Promise<void> {
  const storageKey = param(req, 'storageKey');
  const exp = queryString(req.query.exp);
  const sig = queryString(req.query.sig);

  const expiresAt = Number.parseInt(exp, 10);
  const { buffer, mimetype, originalName } = await service.serveSignedFile(
    storageKey,
    expiresAt,
    sig,
  );
  res.setHeader('Content-Type', mimetype);
  res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/["\\]/g, '_')}"`);
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).send(buffer);
}
