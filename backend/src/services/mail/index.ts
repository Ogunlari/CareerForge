import type { MailProvider } from './mail.provider.js';
import { env } from '../../config/env.js';
import { NodemailerMailProvider } from './mail.nodemailer.js';
import { SendGridMailProvider } from './mail.sendgrid.js';
import { DevMailProvider } from './mail.dev.js';

let provider: MailProvider | undefined;

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

export type { MailMessage, MailProvider } from './mail.provider.js';
