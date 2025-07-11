import { describe, it, expect } from 'vitest';
import {
  educationSchema,
  resumeSchema,
  questionTemplateSchema,
  userAnswerSchema,
} from '../../api/schema.js';

describe('Model schemas', () => {
  it('rejects education without institution', () => {
    expect(() => educationSchema.parse({})).toThrow();
  });

  it('accepts minimal resume', () => {
    const data = { filename: 'cv.pdf', fileType: 'pdf' };
    expect(() => resumeSchema.parse(data)).not.toThrow();
  });

  it('validates question template options optional', () => {
    const tmpl = {
      category: 'general',
      question: 'Why?',
      questionType: 'text',
    };
    expect(() => questionTemplateSchema.parse(tmpl)).not.toThrow();
  });

  it('rejects user answer without templateId', () => {
    expect(() => userAnswerSchema.parse({ answer: 'hi' })).toThrow();
  });
});