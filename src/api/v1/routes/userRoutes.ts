import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { sendSuccessResponse, sendErrorResponse, handleError } from '../utils';
import { AuthenticationError, ValidationError, NotFoundError } from '../errors';
import Joi from 'joi';

const router = Router();

const setCustomClaimsSchema = Joi.object({
  uid: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'manager', 'officer').required(),
}).xor('uid', 'email');

const getUidFromRequest = async (uid?: string, email?: string): Promise<string> => {
  if (uid) {
    return uid;
  }

  if (!email) {
    throw new ValidationError('Either uid or email must be provided');
  }

  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new NotFoundError('User not found');
    }
    throw error;
  }
};

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

// Set custom claims for a user by UID or email - requires authentication and admin role
router.post('/user/claims', authenticate, authorize({ roles: ['admin'] }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = setCustomClaimsSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { uid, email, role } = value;
    const targetUid = await getUidFromRequest(uid, email);

    await auth.setCustomUserClaims(targetUid, { role });

    sendSuccessResponse(res, { message: `Custom claims set for user ${targetUid} with role ${role}` });
  } catch (error) {
    const appError = handleError(error);
    sendErrorResponse(res, appError);
  }
});

// Admin-only bootstrap route for assigning a role by email or UID
router.post('/admin/claims', authenticate, authorize({ roles: ['admin'] }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = setCustomClaimsSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { uid, email, role } = value;
    const targetUid = await getUidFromRequest(uid, email);

    await auth.setCustomUserClaims(targetUid, { role });

    sendSuccessResponse(res, { message: `Admin bootstrap applied to user ${targetUid} with role ${role}` });
  } catch (error) {
    const appError = handleError(error);
    sendErrorResponse(res, appError);
  }
});

export default router;