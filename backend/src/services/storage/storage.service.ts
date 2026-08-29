import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from '../../config/env.js';

const ALGORITHM = 'sha256';
const SIGNATURE_BYTES = 32;

export function resolveUploadDir(): string {
  return path.resolve(env.UPLOAD_DIR);
}

function publicPath(storageKey: string): string {
  return path.join(resolveUploadDir(), storageKey);
}

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(resolveUploadDir(), { recursive: true });
}

export function hashFileBuffer(buf: Buffer): string {
  return createHash(ALGORITHM).update(buf).digest('hex');
}

export async function persistBuffer(buf: Buffer): Promise<{ storageKey: string; sha256: string }> {
  await ensureUploadDir();
  const sha256 = hashFileBuffer(buf);
  const storageKey = `${Date.now().toString(36)}-${randomBytes(16).toString('hex')}`;
  await fs.writeFile(publicPath(storageKey), buf);
  return { storageKey, sha256 };
}

export async function removeStorageFile(storageKey: string): Promise<void> {
  try {
    await fs.unlink(publicPath(storageKey));
  } catch {
    // Best-effort cleanup; the metadata record may still reference it.
  }
}

export async function readStoredFile(storageKey: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(publicPath(storageKey));
  } catch {
    return null;
  }
}

export function signUrl(storageKey: string, expiresAt: number): string {
  const payload = `${storageKey}.${expiresAt}`;
  const sig = createHmac(ALGORITHM, env.FILE_URL_SIGNING_SECRET).update(payload).digest('hex');
  return `/api/files/${storageKey}?exp=${expiresAt}&sig=${sig}`;
}

export function verifySignature(storageKey: string, expiresAt: number, signature: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return false;
  if (Date.now() > expiresAt) return false;

  const expected = createHmac(ALGORITHM, env.FILE_URL_SIGNING_SECRET)
    .update(`${storageKey}.${expiresAt}`)
    .digest('hex');

  const actual = Buffer.from(signature, 'hex');
  const exp = Buffer.from(expected, 'hex');
  return actual.length === SIGNATURE_BYTES && timingSafeEqual(actual, exp);
}
