import { describe, it, expect } from 'vitest';
import {
  LOG_LEVELS,
  setLogLevel,
  debug,
} from '../../extension/utils/logger.js';

// Capture console.debug output
let output = '';
const originalLog = console.debug;

console.debug = (...args: any[]) => {
  output += args.join(' ');
};

describe('Logger', () => {
  it('suppresses debug when level INFO', () => {
    setLogLevel(LOG_LEVELS.INFO);
    output = '';
    debug('Test', 'should not log');
    expect(output).toBe('');
  });

  it('logs debug when level DEBUG', () => {
    setLogLevel(LOG_LEVELS.DEBUG);
    output = '';
    debug('Test', 'hello');
    expect(output).toContain('hello');
  });
});

// Restore original
console.debug = originalLog;