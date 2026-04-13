import request from 'supertest';
import app from '../src/app';

describe('Loan API', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Note: Other tests would require authentication setup
  // For now, testing the health endpoint to verify basic setup
});