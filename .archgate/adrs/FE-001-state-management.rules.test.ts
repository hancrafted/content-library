/// <reference path="../rules.d.ts" />

// Sibling test for FE-001-state-management.rules.ts — pass and fail path for
// `single-storage-key`: calls passing the constant or the literal, calls
// passing anything else, a drifted `PREFS_KEY`, and a missing or empty config.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-001-state-management.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

const CONFIG = 'src/config.yaml';
const KEY = 'hancrafted:prefs';

// Marks the config file as absent; a default parameter would swallow `undefined`.
const MISSING = Symbol('missing');

// Stands in for archgate's RuleContext. `config` is the already-parsed YAML
// document, or MISSING for an absent file, so no YAML parser is needed.
function makeCtx(files: Record<string, string>, config: unknown = { localStorageKey: KEY }) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      const extension = { 'src/**/*.ts': '.ts', 'src/**/*.tsx': '.tsx' }[pattern];
      if (extension === undefined) throw new Error(`unexpected glob ${pattern}`);
      return Object.keys(files).filter((f) => f.startsWith('src/') && f.endsWith(extension));
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    async readYAML(path: string) {
      if (path !== CONFIG || config === MISSING) throw new Error(`ENOENT: ${path}`);
      return { frontmatter: null, content: config };
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

const STORAGE = 'src/lib/prefs-storage.ts';
const PURE = 'src/lib/prefs.pure.ts';
const rule = ruleSet.rules['single-storage-key'];

describe('single-storage-key', () => {
  it('passes on the constant, the literal, and the pre-paint script form', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [PURE]: `export const PREFS_KEY = '${KEY}';\n`,
      [STORAGE]: `window.localStorage.getItem(PREFS_KEY);\nwindow.localStorage.setItem(PREFS_KEY, raw);\nlocalStorage.getItem("${KEY}");\n`,
      'src/lib/theme.pure.ts': 'const s = `localStorage.getItem(${JSON.stringify(PREFS_KEY)})`;\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails on a call passing another key, on the line it sits on', async () => {
    // ARRANGE
    const expectedLine = 2;
    const { ctx, violations } = makeCtx({
      'src/hooks/x.tsx': `const a = 1;\nlocalStorage.setItem('theme', 'dark');\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual([['src/hooks/x.tsx', expectedLine]]);
  });

  it('fails on a call passing an unrelated variable', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [STORAGE]: `localStorage.getItem(otherKey);\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('fails when PREFS_KEY drifts from the config', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [PURE]: `export const PREFS_KEY = 'hancrafted:settings';\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0].file).toBe(PURE);
  });

  const badConfigs: [label: string, config: unknown][] = [
    ['a missing config', MISSING],
    ['an empty key', { localStorageKey: '' }],
    ['a non-string key', { localStorageKey: 1 }],
    ['an empty document', null],
  ];

  for (const [label, config] of badConfigs) {
    it(`fails on ${label}`, async () => {
      // ARRANGE
      const { ctx, violations } = makeCtx({ [STORAGE]: `localStorage.getItem(PREFS_KEY);\n` }, config);
      // ACT
      await rule.check(ctx);
      // ASSERT
      expect(violations.map((v) => v.file)).toEqual([CONFIG]);
    });
  }

  it('leaves files outside src/ alone', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ 'scripts/x.ts': `localStorage.setItem('other', '1');\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the FE-001 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(FE-001 [single-storage-key])';
    const { ctx, violations } = makeCtx({ [STORAGE]: `localStorage.getItem('x');\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});
