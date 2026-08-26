import type { MailMessage, MailProvider } from './mail.provider.js';
import { logger } from '../../utils/logger.js';

export class DevMailProvider implements MailProvider {
  async send(message: MailMessage): Promise<void> {
    logger.info('DevMailProvider: email suppressed in non-production', {
      to: message.to,
      subject: message.subject,
      htmlPreview: message.html.slice(0, 200),
    });
  }
}
