import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { ok, okList, parsePagination, param, queryString } from '../../utils/http.js';
import { objectId } from '../../utils/validation.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import { createNotification } from './notifications.repository.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  unreadCount,
  deleteNotification,
} from './notifications.service.js';

const createSchema = z.object({
  userId: objectId,
  type: z.enum(['application', 'message', 'job', 'profile', 'system']).default('system'),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  relatedId: z.string().max(100).optional(),
});

function serialize(doc: Record<string, unknown>) {
  return {
    ...doc,
    id: String(doc._id),
    user_id: doc.user_id ? String(doc.user_id) : null,
    _id: undefined,
  };
}

async function list(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query);
  const userId = queryString(req.query.userId) || (req.user as AuthUser).id;

  const result = await listNotifications(userId, page, limit);
  okList(res, result);
}

async function markReadHandler(req: Request, res: Response): Promise<void> {
  const userId = (req.user as AuthUser).id;
  await markRead(param(req, 'notificationId'), userId);
  res.status(200).json({ message: 'Notification marked as read.' });
}

async function markAllReadHandler(req: Request, res: Response): Promise<void> {
  const userId = req.body?.userId ?? (req.user as AuthUser).id;
  await markAllRead(userId);
  res.status(200).json({ message: 'All notifications marked as read.' });
}

async function unreadCountHandler(req: Request, res: Response): Promise<void> {
  const userId = queryString(req.query.userId) || (req.user as AuthUser).id;
  const result = await unreadCount(userId);
  ok(res, result);
}

async function remove(req: Request, res: Response): Promise<void> {
  const userId = (req.user as AuthUser).id;
  await deleteNotification(param(req, 'notificationId'), userId);
  res.status(204).send();
}

export const notificationsRouter = Router();

notificationsRouter.get('/notifications', requireAuth, list);
notificationsRouter.post('/notifications', requireAuth, validateBody(createSchema), async (req, res) => {
  const created = await createNotification(req.body);
  ok(res, serialize(created.toObject() as unknown as Record<string, unknown>));
});
notificationsRouter.patch('/notifications/read-all', requireAuth, markAllReadHandler);
notificationsRouter.patch('/notifications/:notificationId/read', requireAuth, markReadHandler);
notificationsRouter.get('/notifications/unread-count', requireAuth, unreadCountHandler);
notificationsRouter.delete('/notifications/:notificationId', requireAuth, remove);
