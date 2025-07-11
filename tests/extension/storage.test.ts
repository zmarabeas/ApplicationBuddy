import { describe, it, expect } from 'vitest';
import {
  saveToStorage,
  getFromStorage,
  clearStorage,
} from '../../extension/utils/storage.js';

describe('Extension storage utils', () => {
  it('saves and retrieves value', async () => {
    await saveToStorage('testKey', 'value');
    const val = await getFromStorage('testKey');
    expect(val).toBe('value');
  });

  it('clears value', async () => {
    await saveToStorage('clearKey', 'gone');
    await clearStorage('clearKey');
    const val = await getFromStorage('clearKey');
    expect(val).toBeUndefined();
  });
});