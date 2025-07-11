/// <reference types="vitest" />
/// <reference types="vitest/globals" />
/// <reference types="node" />
/// <reference types="@testing-library/jest-dom" />

// Ambient declaration for Chrome APIs used in extension unit tests
declare const chrome: any;
declare module '@types/vitest';

declare module 'node:path' {
  import path from 'path';
  export = path;
}

declare module 'node:fs' {
  import fs from 'fs';
  export = fs;
}

declare module 'node:url' {
  export * from 'url';
}