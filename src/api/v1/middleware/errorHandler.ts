import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse, handleError } from '../utils';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError = handleError(error);
  sendErrorResponse(res, appError);
};