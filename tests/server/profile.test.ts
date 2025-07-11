import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import handler from '../../api/index.js';

// Mock firestore layer
const mockProfile = { id: 1, skills: ['js'], completionPercentage: 80 };

vi.mock('../../api/firestore-storage.js', () => ({
  firestoreStorage: {
    getUserByFirebaseUID: vi.fn(async () => ({ id: 1 })),
    getProfile: vi.fn(async () => mockProfile),
    updateProfile: vi.fn(async (_id: number, body: any) => ({ ...mockProfile, ...body })),
  },
}));

describe('/api/profile', () => {
  it('returns profile when authenticated', async () => {
    const res = await request(handler as any)
      .get('/api/profile')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('updates profile', async () => {
    const res = await request(handler as any)
      .put('/api/profile')
      .set('Authorization', 'Bearer valid-token')
      .send({ completionPercentage: 90 });
    expect(res.status).toBe(200);
    expect(res.body.completionPercentage).toBe(90);
  });
});