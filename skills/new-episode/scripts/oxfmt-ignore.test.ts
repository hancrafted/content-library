import JSON5 from 'json5';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const text = readFileSync(path.resolve(__dirname, '../../../.oxfmtrc.jsonc'), 'utf8');
const config = JSON5.parse(text) as { ignorePatterns: string[] };

describe('.oxfmtrc.jsonc ignorePatterns', () => {
  it('keeps oxfmt off every Episode research staging folder', () => {
    expect(config.ignorePatterns).toContain('docs/episodes/*/research/');
  });
});
