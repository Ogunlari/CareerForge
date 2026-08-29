import type { MailMessage, MailProvider } from './mail.provider.js';
import { env } from '../../config/env.js';
import { NodemailerMailProvider } from './mail.nodemailer.js';
import { SendGridMailProvider } from './mail.sendgrid.js';
import { DevMailProvider } from './mail.dev.js';
import { logger } from '../../utils/logger.js';

let provider: MailProvider | undefined;
const SEND_TIMEOUT_MS = 10_000;

export function getMailProvider(): MailProvider {
  if (!provider) {
    if (env.SENDGRID_API_KEY) {
      provider = new SendGridMailProvider();
    } else if (env.SMTP_HOST) {
      provider = new NodemailerMailProvider();
    } else {
      provider = new DevMailProvider();
    }
  }
  return provider;
}

export function sendMailSafe(message: MailMessage): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (): void => {
      if (!done) {
        done = true;
        resolve();
      }
    };

    const timer = setTimeout(() => {
      logger.warn('Mail send timed out; giving up wait.', { to: message.to, subject: message.subject });
      finish();
    }, SEND_TIMEOUT_MS);

    getMailProvider()
      .send(message)
      .catch((err) => {
        logger.error('Mail send failed (non-fatal).', {
          to: message.to,
          subject: message.subject,
          err: err instanceof Error ? err.message : err,
        });
      })
      .finally(() => {
        clearTimeout(timer);
        finish();
      });
  });
}

export type { MailMessage, MailProvider } from './mail.provider.js';
