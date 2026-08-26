import { Router } from 'express';
import { isDatabaseConnected } from '../config/db.js';

export const healthRouter = Router();

healthRouter.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/health/ready', (_req, res) => {
  if (!isDatabaseConnected()) {
    res.status(503).json({ status: 'unavailable', dependency: 'database' });
    return;
  }
  res.status(200).json({ status: 'ready' });
});
