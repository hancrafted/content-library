/// <reference path="../rules.d.ts" />

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-001-state-management.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

const CONFIG = 'src/shared/config.yaml';
const KEY = 'hancrafted:prefs';
const PROGRESS = 'hancrafted:progress';

const ABSENT_FILE_NOT_A_DEFAULT_PARAMETER_UNDEFINED = Symbol('missing');

function makeCtx(
  files: Record<string, string>,
  config: unknown = { localStorageKey: KEY, progressStorageKey: PROGRESS },
) {
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
      if (path !== CONFIG || config === ABSENT_FILE_NOT_A_DEFAULT_PARAMETER_UNDEFINED)
        throw new Error(`ENOENT: ${path}`);
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

const STORAGE = 'src/shared/lib/prefs-storage.ts';
const PURE = 'src/shared/lib/prefs.pure.ts';
const rule = ruleSet.rules['single-storage-key'];

describe('single-storage-key', () => {
  it('passes on the constant, the literal, and the pre-paint script form', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [PURE]: `export const PREFS_KEY = '${KEY}';\n`,
      [STORAGE]: `window.localStorage.getItem(PREFS_KEY);\nwindow.localStorage.setItem(PREFS_KEY, raw);\nlocalStorage.getItem("${KEY}");\n`,
      'src/shared/lib/theme.pure.ts': 'const s = `localStorage.getItem(${JSON.stringify(PREFS_KEY)})`;\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('passes on the progress key, as constant and as literal', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [PURE]: `export const PROGRESS_KEY = '${PROGRESS}';\n`,
      [STORAGE]: `localStorage.getItem(PROGRESS_KEY);\nlocalStorage.setItem('${PROGRESS}', raw);\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails when PROGRESS_KEY drifts from the config', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [PURE]: `export const PROGRESS_KEY = 'hancrafted:runs';\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([PURE]);
  });

  it('fails on a call passing another key, on the line it sits on', async () => {
    // ARRANGE
    const expectedLine = 2;
    const { ctx, violations } = makeCtx({
      'src/shared/hooks/x.tsx': `const a = 1;\nlocalStorage.setItem('theme', 'dark');\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual([['src/shared/hooks/x.tsx', expectedLine]]);
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
    ['a missing config', ABSENT_FILE_NOT_A_DEFAULT_PARAMETER_UNDEFINED],
    ['an empty key', { localStorageKey: '', progressStorageKey: PROGRESS }],
    ['a non-string key', { localStorageKey: 1, progressStorageKey: PROGRESS }],
    ['a missing progress key', { localStorageKey: KEY }],
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
    const { ctx, violations } = makeCtx({ 'tools/x.ts': `localStorage.setItem('other', '1');\n` });
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
