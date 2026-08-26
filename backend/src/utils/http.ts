import type { Request, Response } from 'express';
import { AppError } from './errors.js';

export interface PaginatedBody<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function param(req: Request, name: string): string {
  const value = req.params[name];
  const s = Array.isArray(value) ? value[0] : value;
  if (!s) throw AppError.badRequest(`Missing path parameter: ${name}`);
  return s;
}

export function queryString(value: unknown): string {
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === 'string' ? s : '';
}

export function ok(res: Response, data: unknown, status = 200): Response {
  return res.status(status).json({ data });
}

export function okMessage(res: Response, message: string, status = 200): Response {
  return res.status(status).json({ message });
}

export function okList<T>(res: Response, body: PaginatedBody<T>): Response {
  return res.status(200).json(body);
}

export function parsePagination(query: Request['query']): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export interface CursorPaginatedBody<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
  limit: number;
}

export function parseCursorPagination(query: Request['query']): { limit: number; cursor: string | null } {
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? '20'), 10) || 20));
  const cursor = typeof query.cursor === 'string' && query.cursor.length > 0 ? query.cursor : null;
  return { limit, cursor };
}

export function okCursorList<T>(res: Response, body: CursorPaginatedBody<T>): Response {
  return res.status(200).json(body);
}
