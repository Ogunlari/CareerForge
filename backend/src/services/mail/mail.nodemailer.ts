import nodemailer from 'nodemailer';
import type { MailMessage, MailProvider } from './mail.provider.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class NodemailerMailProvider implements MailProvider {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    connectionTimeout: 10_000,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  async send(message: MailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.MAIL_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
      });
      logger.info('Email sent', { to: message.to, subject: message.subject });
    } catch (err) {
      logger.error('Failed to send email', { to: message.to, subject: message.subject, err });
      throw err;
    }
  }
}
