import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../../oxlint.config.mts';
import { lintProbe } from './lint-probe.ts';

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

  // GEN-005 §1: oxfmt sorts imports but never removes one, so lint is what reports a dead import.
  it('reports an import nothing uses', async () => {
    // ARRANGE
    const source = "import { unused } from './other.ts';\nexport const a = 1;\n";

    // ACT
    const diagnostics = await lintProbe(source, 'src/shared/lib/probe.ts');

    // ASSERT
    expect(diagnostics.map((d) => d.ruleId)).toContain('no-unused-vars');
  });
});
