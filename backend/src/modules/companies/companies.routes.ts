import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { ok } from '../../utils/http.js';
import { param } from '../../utils/http.js';
import type { AuthUser } from '../../middleware/auth.types.js';
import {
  listCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from './companies.service.js';

const companySchema = z.object({
  name: z.string().min(2).max(200),
  logo_url: z.string().url().max(500).optional(),
  description: z.string().max(10000).optional(),
  website: z.string().url().max(300).optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(120).optional(),
  size: z.string().max(60).optional(),
  founded_year: z.number().int().min(1800).max(2100).optional(),
});

async function list(_req: Request, res: Response): Promise<void> {
  const companies = await listCompanies();
  ok(res, companies);
}

async function getById(req: Request, res: Response): Promise<void> {
  const company = await getCompanyById(param(req, 'companyId'));
  ok(res, company);
}

async function create(req: Request, res: Response): Promise<void> {
  const data = companySchema.parse(req.body);
  const user = req.user as AuthUser | undefined;
  const company = await createCompany(data, user);
  ok(res, company, 201);
}

async function update(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  const updates = companySchema.partial().parse(req.body);
  const company = await updateCompany(param(req, 'companyId'), updates, user);
  ok(res, company);
}

async function remove(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthUser;
  await deleteCompany(param(req, 'companyId'), user);
  res.status(204).send();
}

export const companiesRouter = Router();

companiesRouter.get('/companies', list);
companiesRouter.get('/companies/:companyId', getById);
companiesRouter.post('/companies', requireAuth, requireRole('recruiter', 'admin'), validateBody(companySchema), create);
companiesRouter.patch(
  '/companies/:companyId',
  requireAuth,
  requireRole('recruiter', 'admin'),
  validateBody(companySchema.partial()),
  update,
);
companiesRouter.delete('/companies/:companyId', requireAuth, requireRole('recruiter', 'admin'), remove);
