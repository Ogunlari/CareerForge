export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
  INVALID_GOOGLE_TOKEN: 'INVALID_GOOGLE_TOKEN',
  GOOGLE_AUTH_DISABLED: 'GOOGLE_AUTH_DISABLED',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(ErrorCodes.VALIDATION_ERROR, 400, message, details);
  }

  static unauthorized(message = 'Authentication required.') {
    return new AppError(ErrorCodes.UNAUTHORIZED, 401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new AppError(ErrorCodes.FORBIDDEN, 403, message);
  }

  static notFound(message = 'Resource not found.') {
    return new AppError(ErrorCodes.NOT_FOUND, 404, message);
  }

  static conflict(message: string) {
    return new AppError(ErrorCodes.CONFLICT, 409, message);
  }
}
