import { Response } from 'express';
import { AppError, AuthenticationError, ValidationError, InternalServerError } from '../errors';
import { ErrorResponse, SuccessResponse } from '../types';

export const createErrorResponse = (error: AppError): ErrorResponse => ({
  success: false,
  error: {
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString(),
  },
});

export const createSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle Firebase errors
    if (error.message.includes('auth') || error.message.includes('token')) {
      return new AuthenticationError('Invalid authentication token');
    }

    // Handle validation errors (e.g., from Joi)
    if (error.message.includes('validation')) {
      return new ValidationError(error.message);
    }

    return new InternalServerError(error.message);
  }

  return new InternalServerError('An unexpected error occurred');
};

export const sendErrorResponse = (res: Response, error: AppError): void => {
  const errorResponse = createErrorResponse(error);
  res.status(error.statusCode).json(errorResponse);
};

export const sendSuccessResponse = <T>(res: Response, data: T, statusCode: number = 200): void => {
  const successResponse = createSuccessResponse(data);
  res.status(statusCode).json(successResponse);
};