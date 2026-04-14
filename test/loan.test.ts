import request from 'supertest';
import { auth } from '../src/config/firebaseConfig';
import { ERROR_CODES } from '../src/constants';

// Mock Firebase config to avoid loading the JSON file
jest.mock('../src/config/firebaseConfig', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      add: jest.fn(),
      orderBy: jest.fn(() => ({
        get: jest.fn(),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
  },
}));

import app from '../src/app';

describe('Loan API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Protected routes', () => {
    it('should return 401 TOKEN_NOT_FOUND when Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', ERROR_CODES.TOKEN_NOT_FOUND);
    });

    it('should return 401 TOKEN_INVALID when token verification fails', async () => {
      (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/api/v1/loans')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(ERROR_CODES.TOKEN_INVALID);
      expect(response.body.error.message).toContain('Invalid');
    });

    it('should allow admin to assign role using /admin/claims', async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'admin-uid', email: 'admin@pixell-river.com', role: 'admin' });
      (auth.getUserByEmail as jest.Mock).mockResolvedValue({ uid: 'target-uid', email: 'officer@pixell-river.com' });
      (auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/admin/claims')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ email: 'officer@pixell-river.com', role: 'officer' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      expect((auth.setCustomUserClaims as jest.Mock).mock.calls[0][0]).toBe('target-uid');
      expect((auth.setCustomUserClaims as jest.Mock).mock.calls[0][1]).toEqual({ role: 'officer' });
    });
  });
});