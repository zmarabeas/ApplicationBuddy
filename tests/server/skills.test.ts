import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import handler from '../../api/index.js';

// Mock firestore
vi.mock('../../api/firestore-storage.js', () => ({
  firestoreStorage: {
    getUserByFirebaseUID: vi.fn(async () => ({ id: 1 })),
    getProfile: vi.fn(async () => ({ id: 1 })),
    updateSkills: vi.fn(async (_: any, skills: any) => ({ skills })),
  },
}));

describe('/api/profile/skills', () => {
  const url = '/api/profile/skills';

  it('rejects when skills is not array', async () => {
    const res = await request(handler as any)
      .patch(url)
      .set('Authorization', 'Bearer valid-token')
      .send({ skills: 'not-array' });
    expect(res.status).toBe(400);
  });

  it('accepts valid skills array', async () => {
    const res = await request(handler as any)
      .patch(url)
      .set('Authorization', 'Bearer valid-token')
      .send({ skills: ['js', 'ts'] });
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(['js', 'ts']);
  });
});