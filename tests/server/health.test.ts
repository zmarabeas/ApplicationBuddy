import { describe, it, expect } from 'vitest';
import handler from '../../api/index.js';
import request from 'supertest';

describe('API /api/health', () => {
  it('returns healthy status', async () => {
    const res = await request(handler as any).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});