import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { okMessage, okList, parsePagination } from '../../utils/http.js';
import { ContactMessageModel } from '../../models/contact-message.model.js';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1).max(5000),
});

function serialize(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    subject: doc.subject ?? '',
    message: doc.message,
    status: doc.status,
    created_at: doc.created_at,
    _id: undefined,
  };
}

async function submit(req: Request, res: Response): Promise<void> {
  const { name, email, subject, message } = req.body;
  await ContactMessageModel.create({ name, email, subject, message, status: 'new' });
  okMessage(res, 'Thanks! Your message has been received. We&apos;ll be in touch.');
}

async function list(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const filter = status && ['new', 'read'].includes(status) ? { status } : {};
  const [items, total] = await Promise.all([
    ContactMessageModel.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessageModel.countDocuments(filter),
  ]);

  okList(res, {
    data: items.map((doc) => serialize(doc as unknown as Record<string, unknown>)),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

async function markRead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.contactId);
  const result = await ContactMessageModel.findByIdAndUpdate(id, { status: 'read' }, { new: true });
  if (!result) {
    res.status(404).json({ message: 'Contact message not found.' });
    return;
  }
  okMessage(res, 'Marked as read.');
}

export const contactRouter = Router();

contactRouter.post('/contact', validateBody(contactSchema), submit);
contactRouter.get('/contact', requireAuth, requireRole('admin'), list);
contactRouter.patch('/contact/:contactId/read', requireAuth, requireRole('admin'), markRead);
