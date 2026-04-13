import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { sendSuccessResponse, sendErrorResponse, handleError } from '../utils';
import { AuthenticationError, ValidationError } from '../errors';
import Joi from 'joi';

const router = Router();

const setCustomClaimsSchema = Joi.object({
  uid: Joi.string().required(),
  role: Joi.string().valid('admin', 'manager', 'officer').required(),
});

// Get current user details - requires authentication
router.get('/user', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const userRecord = await auth.getUser(req.user.uid);
    sendSuccessResponse(res, {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: req.user.role,
      customClaims: userRecord.customClaims,
    });
  } catch (error) {
    const appError = handleError(error);
    sendErrorResponse(res, appError);
  }
});

// Set custom claims for a user - requires authentication and admin role
router.post('/user/claims', authenticate, authorize({ roles: ['admin'] }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = setCustomClaimsSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { uid, role } = value;

    await auth.setCustomUserClaims(uid, { role });

    sendSuccessResponse(res, { message: `Custom claims set for user ${uid} with role ${role}` });
  } catch (error) {
    const appError = handleError(error);
    sendErrorResponse(res, appError);
  }
});

export default router;