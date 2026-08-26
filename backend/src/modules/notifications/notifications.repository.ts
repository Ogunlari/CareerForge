import { NotificationModel } from '../../models/notification.model.js';

export async function createNotification(input: {
  userId: string;
  type?: 'application' | 'message' | 'job' | 'profile' | 'system';
  title: string;
  message: string;
  relatedId?: string;
}) {
  return NotificationModel.create({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    related_id: input.relatedId,
  });
}
