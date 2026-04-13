import { ERROR_CODES } from '../../constants';

export abstract class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = ERROR_CODES.TOKEN_INVALID) {
    super(message, code, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code: string = ERROR_CODES.INSUFFICIENT_ROLE) {
    super(message, code, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', code: string = ERROR_CODES.VALIDATION_ERROR) {
    super(message, code, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = ERROR_CODES.LOAN_NOT_FOUND) {
    super(message, code, 404);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code: string = ERROR_CODES.INTERNAL_ERROR) {
    super(message, code, 500);
  }
}