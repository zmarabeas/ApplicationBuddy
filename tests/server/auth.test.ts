import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import handler from '../../api/index.js';

// Mock database layer
vi.mock('../../api/firestore-storage.js', () => {
  const mockUser = { id: 1, email: 'user@example.com' };
  return {
    firestoreStorage: {
      getUserByFirebaseUID: vi.fn(async () => mockUser),
      createUser: vi.fn(async () => mockUser),
      getProfile: vi.fn(async () => ({ id: 1 })),
    },
  };
});

describe('Auth middleware /api/user', () => {
  it('denies access without token', async () => {
    const res = await request(handler as any).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('denies access with invalid token', async () => {
    const res = await request(handler as any)
      .get('/api/user')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });

  it('returns user with valid token', async () => {
    const res = await request(handler as any)
      .get('/api/user')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('user@example.com');
  });
});