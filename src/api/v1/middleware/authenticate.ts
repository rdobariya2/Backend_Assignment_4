import { Request, Response, NextFunction } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { AuthenticationError } from '../errors';
import { AuthenticatedUser } from '../types';
import { ERROR_CODES } from '../../../constants';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header missing or malformed', ERROR_CODES.TOKEN_NOT_FOUND);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decodedToken = await auth.verifyIdToken(token);
      const customClaims = decodedToken as any; // Firebase custom claims

      const user: AuthenticatedUser = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: customClaims.role || 'officer', // Default to officer if no role
      };

      req.user = user;
      next();
    } catch (firebaseError) {
      throw new AuthenticationError('Invalid or expired token', ERROR_CODES.TOKEN_INVALID);
    }
  } catch (error) {
    next(error);
  }
};