import type { MailMessage, MailProvider } from './mail.provider.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class SendGridMailProvider implements MailProvider {
  private readonly apiKey: string;
  private readonly from: string;

  constructor() {
    this.apiKey = env.SENDGRID_API_KEY;
    this.from = env.SENDGRID_FROM || env.MAIL_FROM;
  }

  async send(message: MailMessage): Promise<void> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: this.from },
          subject: message.subject,
          content: [{ type: 'text/html', value: message.html }],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        logger.error('SendGrid API error', { status: response.status, body });
        throw new Error(`SendGrid returned ${response.status}: ${body}`);
      }

      logger.info('Email sent via SendGrid', { to: message.to, subject: message.subject });
    } catch (err) {
      logger.error('Failed to send email via SendGrid', { to: message.to, subject: message.subject, err });
      throw err;
    }
  }
}
