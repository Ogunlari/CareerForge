import type { Logger } from './logger.types.js';
import { env } from '../config/env.js';

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

const REDACT_KEYS = new Set(['password', 'token', 'authorization', 'secret', 'passwordHash', 'tokenHash']);

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    out[key] = REDACT_KEYS.has(key) ? '[REDACTED]' : serialize(value);
  }
  return out;
}

function emit(level: string, message: string, meta?: Record<string, unknown>): void {
  const entry = { time: new Date().toISOString(), level, message, ...(meta ? redact(meta) : {}) };
  const line = JSON.stringify(entry);
  if (level === 'error') process.stderr.write(line + '\n');
  else process.stdout.write(line + '\n');
}

export const logger: Logger = {
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
  debug: (message, meta) => {
    if (env.NODE_ENV !== 'production') emit('debug', message, meta);
  },
};
