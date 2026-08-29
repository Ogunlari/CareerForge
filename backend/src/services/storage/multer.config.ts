import multer from 'multer';
import { AppError } from '../../utils/errors.js';

export const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const uploadFile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
    fields: 4,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_FILE_MIME_TYPES.has(file.mimetype)) {
      cb(AppError.badRequest('Unsupported file type. Allowed: PDF, DOC, DOCX, or plain text.'));
      return;
    }
    cb(null, true);
  },
});
