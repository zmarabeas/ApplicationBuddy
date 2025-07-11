import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
// Type-only imports for IDEs
import type { expect as ExpectType, describe as DescribeFn, it as ItFn } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Extension manifest', () => {
  const manifestPath = path.resolve(
    __dirname,
    '../../extension/manifest.json'
  );
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  it('uses manifest_version 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('has a valid name and version', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.version).toMatch(/\d+\.\d+\.\d+/);
  });
});