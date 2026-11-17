import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../../oxlint.config.mts';
import { lintProbe } from './lint-probe.ts';

// decision: GEN-005 §1.5
// decision: FE-011 §6.1
describe('oxlint config', () => {
  it('exempts exactly the globs of the legacy list from the token vocabulary', () => {
    // ARRANGE
    const { globs } = JSON.parse(readFileSync('src/shared/design-system/legacy.json', 'utf8')) as { globs: string[] };

    // ACT
    const legacy = config.overrides?.find((o) => JSON.stringify(o.files) === JSON.stringify(globs));

    // ASSERT
    expect(legacy?.rules).toHaveProperty(['better-tailwindcss/no-restricted-classes']);
  });

  // decision: GEN-005 §1.1
  it('reports an import nothing uses, since oxfmt sorts imports but never removes one', async () => {
    // ARRANGE
    const source = "import { unused } from './other.ts';\nexport const a = 1;\n";

    // ACT
    const diagnostics = await lintProbe(source, 'src/shared/lib/probe.ts');

    // ASSERT
    expect(diagnostics.map((d) => d.ruleId)).toContain('no-unused-vars');
  });

  it('lets a bare ts-expect-error through, the one directive form tsc reads that GEN-006 admits', async () => {
    // ARRANGE
    const source = "export function f(n: number) {\n  return n;\n}\n// @ts-expect-error\nf('a');\n";
    // ACT
    const diagnostics = await lintProbe(source, 'src/shared/lib/expect-error-probe.ts');
    // ASSERT
    expect(diagnostics.map((d) => d.ruleId)).not.toContain('typescript/ban-ts-comment');
  });

  it('still reports a ts-ignore, which silences the next line without proving an error is there', async () => {
    // ARRANGE
    const source = "export function f(n: number) {\n  return n;\n}\n// @ts-ignore\nf('a');\n";
    // ACT
    const diagnostics = await lintProbe(source, 'src/shared/lib/ignore-probe.ts');
    // ASSERT
    expect(diagnostics.map((d) => d.ruleId)).toContain('typescript/ban-ts-comment');
  });
});
