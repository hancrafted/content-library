import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../../oxlint.config.mts';

// GEN-005 §1.5: the design-token legacy list is one file that lint and Archgate both read (FE-011).
describe('oxlint config', () => {
  it('exempts exactly the globs of the legacy list from the token vocabulary', () => {
    // ARRANGE
    const { globs } = JSON.parse(readFileSync('src/shared/design-system/legacy.json', 'utf8')) as { globs: string[] };

    // ACT
    const legacy = config.overrides?.find((o) => JSON.stringify(o.files) === JSON.stringify(globs));

    // ASSERT
    expect(legacy?.rules).toHaveProperty(['better-tailwindcss/no-restricted-classes']);
  });
});
