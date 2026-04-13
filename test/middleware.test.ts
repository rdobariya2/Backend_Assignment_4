import { Request, Response } from 'express';
import { authenticate } from '../src/api/v1/middleware/authenticate';
import { authorize } from '../src/api/v1/middleware/authorize';
import { AuthenticationError, AuthorizationError } from '../src/api/v1/errors';
import { auth } from '../src/config/firebaseConfig';
import { ERROR_CODES } from '../src/constants';

describe('Authentication middleware', () => {
  const next = jest.fn();
  const res = {} as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return TOKEN_NOT_FOUND when Authorization header is missing', async () => {
    const req = {
      headers: {},
    } as unknown as Request;

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.code).toBe(ERROR_CODES.TOKEN_NOT_FOUND);
  });

  it('should return TOKEN_INVALID when token verification fails', async () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    } as unknown as Request;

    jest.spyOn(auth, 'verifyIdToken').mockRejectedValue(new Error('Invalid token'));

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.code).toBe(ERROR_CODES.TOKEN_INVALID);
  });

  it('should attach user to request when token verification succeeds', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as Request;

    jest.spyOn(auth, 'verifyIdToken').mockResolvedValue({ uid: 'uid-123', email: 'test@pixell-river.com', role: 'manager' });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user).toEqual({ uid: 'uid-123', email: 'test@pixell-river.com', role: 'manager' });
  });
});

describe('Authorization middleware', () => {
  const next = jest.fn();
  const res = {} as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ROLE_NOT_FOUND when user is not authenticated', () => {
    const req = {} as Request;
    const middleware = authorize({ roles: ['admin'] });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error.code).toBe(ERROR_CODES.ROLE_NOT_FOUND);
  });

  it('should return INSUFFICIENT_ROLE when user role is invalid for the route', () => {
    const req = { user: { role: 'officer' } } as unknown as Request;
    const middleware = authorize({ roles: ['manager', 'admin'] });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error.code).toBe(ERROR_CODES.INSUFFICIENT_ROLE);
  });

  it('should allow access when user role is authorized', () => {
    const req = { user: { role: 'manager' } } as unknown as Request;
    const middleware = authorize({ roles: ['manager', 'admin'] });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0].length).toBe(0);
  });
});
