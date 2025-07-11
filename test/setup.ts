import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Provide a minimal chrome mock for extension utils
if (!(globalThis as any).chrome) {
  const storageData: Record<string, any> = {};
  (globalThis as any).chrome = {
    runtime: {
      lastError: null,
    },
    storage: {
      local: {
        set: (obj: Record<string, any>, cb?: () => void) => {
          Object.assign(storageData, obj);
          cb?.();
        },
        get: (keys: string[] | Record<string, any>, cb: (res: any) => void) => {
          if (Array.isArray(keys)) {
            const res = keys.reduce((acc, k) => (
              { ...acc, [k]: storageData[k] }
            ), {} as Record<string, any>);
            cb(res);
          } else {
            cb({});
          }
        },
        remove: (keys: string | string[], cb?: () => void) => {
          const list = Array.isArray(keys) ? keys : [keys];
          list.forEach(k => delete storageData[k]);
          cb?.();
        },
        clear: (cb?: () => void) => {
          Object.keys(storageData).forEach(k => delete storageData[k]);
          cb?.();
        },
      },
    },
  } as any;
}

// Mock Firebase Admin to avoid real network calls
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: vi.fn(async (token: string) => {
      if (token === 'valid-token') {
        return {
          uid: 'testUid',
          email: 'user@example.com',
          name: 'Test User',
          picture: '',
        };
      }
      throw new Error('invalid token');
    }),
  }),
}));

// Provide empty mocks for other firebase-admin modules
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({}),
}));

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({}),
}));