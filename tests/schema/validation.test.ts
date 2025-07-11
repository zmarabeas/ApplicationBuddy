import { describe, it, expect } from 'vitest';
import {
  personalInfoSchema,
  workExperienceSchema,
} from '../../api/schema.js';

describe('Zod schemas', () => {
  it('fails for invalid personal email', () => {
    const invalid = {
      firstName: 'A',
      lastName: 'B',
      email: 'not-an-email',
    };
    expect(() => personalInfoSchema.parse(invalid)).toThrow();
  });

  it('passes for valid work experience', () => {
    const valid = {
      company: 'Acme',
      title: 'Engineer',
    };
    expect(() => workExperienceSchema.parse(valid)).not.toThrow();
  });
});