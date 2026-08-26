import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initSentry } from './config/sentry.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  initSentry();
  await connectDatabase();
  logger.info('Database connected', { url: env.DATABASE_URL.replace(/\/\/.*@/, '//[REDACTED]@') });

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`CareerForge API listening on port ${env.PORT}`, { env: env.NODE_ENV });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Fatal startup error', { error });
  process.exit(1);
});
