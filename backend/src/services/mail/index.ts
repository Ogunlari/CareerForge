import type { MailProvider } from './mail.provider.js';
import { env } from '../../config/env.js';
import { NodemailerMailProvider } from './mail.nodemailer.js';
import { DevMailProvider } from './mail.dev.js';

let provider: MailProvider | undefined;

export function getMailProvider(): MailProvider {
  if (!provider) {
    provider = env.SMTP_HOST ? new NodemailerMailProvider() : new DevMailProvider();
  }
  return provider;
}

export type { MailMessage, MailProvider } from './mail.provider.js';
