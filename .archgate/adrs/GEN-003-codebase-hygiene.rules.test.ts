/// <reference path="../rules.d.ts" />

import { describe, expect, it } from 'vitest';
import ruleSet from './GEN-003-codebase-hygiene.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

function globToRegExp(pattern: string): RegExp {
  const segments = pattern.split('/');
  let body = '';
  segments.forEach((segment, index) => {
    const separator = index === 0 ? '' : '/';
    if (segment === '**') {
      body += index === segments.length - 1 ? `${separator}.*` : `${separator}(?:[^/]+/)*`;
      return;
    }
    const literal = segment
      .split('*')
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('[^/]*');
    body += segments[index - 1] === '**' ? literal : separator + literal;
  });
  return new RegExp(`^${body}$`);
}

function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      const re = globToRegExp(pattern);
      return Object.keys(files).filter((f) => re.test(f));
    },
    async grepFiles(pattern: RegExp, fileGlob: string) {
      const re = globToRegExp(fileGlob);
      const matches: GrepMatch[] = [];
      for (const [file, content] of Object.entries(files)) {
        if (!re.test(file)) continue;
        content.split('\n').forEach((text, index) => {
          const found = text.match(pattern);
          if (found) {
            matches.push({ file, line: index + 1, column: (found.index ?? 0) + 1, content: text });
          }
        });
      }
      return matches;
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

const SRC_FILE = 'src/packages/config-contract/lib/config.types.ts';

const ASSEMBLED_DISABLE = `eslint-${'disable'}`;
const ASSEMBLED_ENABLE = `eslint-${'enable'}`;
const ASSEMBLED_OX_DISABLE = `oxlint-${'disable'}`;
const ASSEMBLED_OX_ENABLE = `oxlint-${'enable'}`;

const rule = ruleSet.rules['no-eslint-disable'];

describe('no-eslint-disable', () => {
  it('passes on a src file carrying no directive', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [SRC_FILE]: 'export const answer = 42;\n' });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  // decision: GEN-003 §1.1
  const forms: [label: string, source: string][] = [
    ['line-comment next-line', `// ${ASSEMBLED_DISABLE}-next-line no-console\nconsole.log(1);\n`],
    ['line-comment same-line', `console.log(1); // ${ASSEMBLED_DISABLE}-line no-console\n`],
    ['block-comment file-wide', `/* ${ASSEMBLED_DISABLE} */\nexport const a = 1;\n`],
    ['block-comment rule-scoped', `/* ${ASSEMBLED_DISABLE} no-console */\nconsole.log(1);\n`],
    ['paired enable', `export const a = 1;\n/* ${ASSEMBLED_ENABLE} no-console */\n`],
    ['oxlint line-comment next-line', `// ${ASSEMBLED_OX_DISABLE}-next-line no-console\nconsole.log(1);\n`],
    ['oxlint line-comment same-line', `console.log(1); // ${ASSEMBLED_OX_DISABLE}-line no-console\n`],
    ['oxlint line-comment file-wide', `// ${ASSEMBLED_OX_DISABLE}\nexport const a = 1;\n`],
    ['oxlint block-comment file-wide', `/* ${ASSEMBLED_OX_DISABLE} */\nexport const a = 1;\n`],
    ['oxlint block-comment rule-scoped', `/* ${ASSEMBLED_OX_DISABLE} no-console */\nconsole.log(1);\n`],
    ['oxlint block-comment next-line', `/* ${ASSEMBLED_OX_DISABLE}-next-line no-console */\nconsole.log(1);\n`],
    ['oxlint paired enable', `export const a = 1;\n/* ${ASSEMBLED_OX_ENABLE} no-console */\n`],
    ['oxlint line-comment paired enable', `export const a = 1;\n// ${ASSEMBLED_OX_ENABLE} no-console\n`],
  ];

  for (const [label, source] of forms) {
    it(`fails on the ${label} form`, async () => {
      // ARRANGE
      const { ctx, violations } = makeCtx({ [SRC_FILE]: source });
      // ACT
      await rule.check(ctx);
      // ASSERT
      expect(violations).toHaveLength(1);
      expect(violations[0].file).toBe(SRC_FILE);
    });
  }

  it('reports the line the directive sits on', async () => {
    // ARRANGE
    const source = `export const a = 1;\nexport const b = 2;\n// ${ASSEMBLED_DISABLE}-next-line no-console\nconsole.log(1);\n`;
    const expectedLine = 3;
    const { ctx, violations } = makeCtx({ [SRC_FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].line).toBe(expectedLine);
  });

  it('passes on prose naming a directive away from the comment opener', async () => {
    // ARRANGE
    const source = `// Suppression stays unspent, so never write ${ASSEMBLED_DISABLE} here.\nexport const a = 1;\n`;
    const { ctx, violations } = makeCtx({ [SRC_FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('passes on prose naming an oxlint directive away from the comment opener', async () => {
    // ARRANGE
    const source = `// Suppression stays unspent, so never write ${ASSEMBLED_OX_DISABLE} here.\nexport const a = 1;\n`;
    const { ctx, violations } = makeCtx({ [SRC_FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('leaves a directive outside src/ alone', async () => {
    // ARRANGE
    const source = `/* ${ASSEMBLED_DISABLE} */\nexport default [];\n`;
    const { ctx, violations } = makeCtx({ '.oxlintrc.json': source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the GEN-003 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(GEN-003 [no-eslint-disable])';
    const source = `/* ${ASSEMBLED_DISABLE} */\nexport const a = 1;\n`;
    const { ctx, violations } = makeCtx({ [SRC_FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});
