import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRecentAuth } from '../../middleware/recent-auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import * as controller from './auth.controller.js';
import {
  loginSchema,
  refreshSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  signupSchema,
  updatePasswordSchema,
} from './auth.schemas.js';

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
});

export const authRouter = Router();

authRouter.post('/signup', authLimiter, validateBody(signupSchema), controller.signup);
authRouter.post('/login', authLimiter, validateBody(loginSchema), controller.login);
authRouter.post('/refresh', validateBody(refreshSchema), controller.refresh);
authRouter.post('/logout', requireAuth, controller.logout);
authRouter.get('/me', requireAuth, controller.me);
authRouter.post(
  '/reset-password-request',
  authLimiter,
  validateBody(resetPasswordRequestSchema),
  controller.requestPasswordReset,
);
authRouter.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), controller.resetPassword);
authRouter.get('/verify-token', requireAuth, controller.verifyToken);
authRouter.post('/update-password', requireAuth, requireRecentAuth, validateBody(updatePasswordSchema), controller.updatePassword);
authRouter.get('/sessions', requireAuth, controller.listSessions);
authRouter.delete('/sessions/:jti', requireAuth, controller.revokeSession);
authRouter.post('/logout-all', requireAuth, controller.logoutAll);

// Mounted under /api/auth by src/routes/index.ts
