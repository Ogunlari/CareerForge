import { NotificationModel } from '../../models/notification.model.js';
import { AppError } from '../../utils/errors.js';

export async function listNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const filter = { user_id: userId };

  const [docs, total] = await Promise.all([
    NotificationModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).maxTimeMS(3000),
    NotificationModel.countDocuments(filter).maxTimeMS(3000),
  ]);

  return {
    data: docs.map((d) => serialize(d.toObject() as unknown as Record<string, unknown>)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function markRead(notificationId: string, userId: string) {
  const result = await NotificationModel.updateOne(
    { _id: notificationId, user_id: userId },
    { $set: { is_read: true } },
  ).maxTimeMS(2000);
  if (result.modifiedCount === 0) {
    throw AppError.notFound('Notification not found.');
  }
}

export async function markAllRead(userId: string) {
  await NotificationModel.updateMany({ user_id: userId }, { $set: { is_read: true } }).maxTimeMS(2000);
}

export async function unreadCount(userId: string) {
  const count = await NotificationModel.countDocuments({
    user_id: userId,
    is_read: false,
  }).maxTimeMS(2000);
  return { count };
}

export async function deleteNotification(notificationId: string, userId: string) {
  const result = await NotificationModel.deleteOne({ _id: notificationId, user_id: userId }).maxTimeMS(2000);
  if (result.deletedCount === 0) {
    throw AppError.notFound('Notification not found.');
  }
}

function serialize(doc: Record<string, unknown>) {
  return {
    ...doc,
    id: String(doc._id),
    user_id: doc.user_id ? String(doc.user_id) : null,
    _id: undefined,
  };
}
