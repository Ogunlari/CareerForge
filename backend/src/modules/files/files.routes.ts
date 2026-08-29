import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { uploadFile } from '../../services/storage/multer.config.js';
import * as controller from './files.controller.js';

export const filesRouter = Router();

filesRouter.post('/files/resume', requireAuth, uploadFile.single('file'), controller.upload);
filesRouter.get('/files/:storageKey', controller.getSigned);
