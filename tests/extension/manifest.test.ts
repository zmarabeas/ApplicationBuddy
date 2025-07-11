import { readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

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