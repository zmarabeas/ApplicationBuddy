import { describe, it, expect } from 'vitest';
import request from 'supertest';
import handler from '../../api/index.js';

describe('404 handling', () => {
  it('returns 404 for unknown path', async () => {
    const res = await request(handler as any).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Endpoint not found');
  });
});