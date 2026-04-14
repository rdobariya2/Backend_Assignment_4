import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors';
import { UserRole } from '../types';
import { ERROR_CODES } from '../../../constants';

interface AuthorizationOptions {
  roles: UserRole[];
}

export const authorize = (options: AuthorizationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated', ERROR_CODES.ROLE_NOT_FOUND);
      }

      const userRole = req.user.role;
      if (!options.roles.includes(userRole)) {
        throw new AuthorizationError('Insufficient permissions for this operation', ERROR_CODES.INSUFFICIENT_ROLE);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};