import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ignore = readFileSync(path.resolve(__dirname, '../../../.prettierignore'), 'utf8')
  .split('\n')
  .map((line) => line.trim());

describe('.prettierignore', () => {
  it('keeps Prettier off every Episode research staging folder', () => {
    expect(ignore).toContain('docs/episodes/*/research/');
  });
});
