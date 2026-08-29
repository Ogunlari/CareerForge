import type { AuthUser } from '../../middleware/auth.types.js';
import { FileRecordModel } from '../../models/file-record.model.js';
import { AppError } from '../../utils/errors.js';
import {
  hashFileBuffer,
  persistBuffer,
  readStoredFile,
  removeStorageFile,
  signUrl,
  verifySignature,
} from '../../services/storage/storage.service.js';
import { env } from '../../config/env.js';

export interface UploadedFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export async function uploadResume(user: AuthUser, file: UploadedFileInput) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw AppError.badRequest('No file was provided.');
  }

  const sha256 = hashFileBuffer(file.buffer);

  const existing = await FileRecordModel.findOne({ owner_id: user.id, sha256 })
    .sort({ created_at: -1 })
    .maxTimeMS(2000);
  if (existing) {
    const expiresAt = Date.now() + env.FILE_URL_TTL_MS;
    return {
      file_id: String(existing._id),
      url: signUrl(existing.storage_key, expiresAt),
      expires_at: new Date(expiresAt).toISOString(),
      duplicate: true,
    };
  }

  const { storageKey } = await persistBuffer(file.buffer);

  let record;
  try {
    record = await FileRecordModel.create({
      owner_id: user.id,
      storage_key: storageKey,
      original_name: file.originalname,
      mimetype: file.mimetype,
      size: file.buffer.length,
      sha256,
      scanned: false,
    });
  } catch (err) {
    await removeStorageFile(storageKey);
    throw err;
  }

  const expiresAt = Date.now() + env.FILE_URL_TTL_MS;
  return {
    file_id: String(record._id),
    url: signUrl(storageKey, expiresAt),
    expires_at: new Date(expiresAt).toISOString(),
    duplicate: false,
  };
}

export async function serveSignedFile(
  storageKey: string,
  expiresAt: number,
  signature: string,
): Promise<{ buffer: Buffer; mimetype: string; originalName: string }> {
  if (!verifySignature(storageKey, expiresAt, signature)) {
    throw AppError.forbidden('Invalid or expired file link.');
  }

  const record = await FileRecordModel.findOne({ storage_key: storageKey }).maxTimeMS(2000);
  if (!record) throw AppError.notFound('File not found.');

  const buffer = await readStoredFile(storageKey);
  if (!buffer) throw AppError.notFound('File not found.');

  return {
    buffer,
    mimetype: record.mimetype,
    originalName: record.original_name,
  };
}
