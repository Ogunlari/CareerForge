import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().default('mongodb://127.0.0.1:27017/careerforge'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  APP_BASE_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('CareerForge <noreply@careerforge.dev>'),
  SENDGRID_API_KEY: z.string().optional().default(''),
  SENDGRID_FROM: z.string().email().optional().default(''),
  SENTRY_DSN: z.string().optional().default(''),
  UPLOAD_DIR: z.string().default('uploads'),
  FILE_URL_SIGNING_SECRET: z.string().min(32).default('change-me-file-url-signing-secret'),
  FILE_URL_TTL_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`Environment validation failed:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === 'production' && (env.JWT_SECRET.includes('change-me') || env.JWT_SECRET.includes('dev-only'))) {
  console.error('Refusing to start: JWT_SECRET looks like a development placeholder.');
  process.exit(1);
}

export const isProduction = env.NODE_ENV === 'production';
