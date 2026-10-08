/// <reference path="../rules.d.ts" />

// Sibling test for FE-003-localization.rules.ts — pass and fail path for
// `href-via-localize-path`, plus its easy-to-get-wrong boundaries: `hrefLang`,
// a value wrapped onto the next line, and the .tsx scope.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-003-localization.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Stands in for archgate's RuleContext over an in-memory file set. The rule
// only globs `src/**/*.tsx`, so the double matches that one shape.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      if (pattern !== 'src/**/*.tsx') throw new Error(`unexpected glob ${pattern}`);
      return Object.keys(files).filter((f) => f.startsWith('src/') && f.endsWith('.tsx'));
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

const FILE = 'src/components/site-header.tsx';
const rule = ruleSet.rules['href-via-localize-path'];

describe('href-via-localize-path', () => {
  it('passes when every href is built by localizePath', async () => {
    // ARRANGE
    const source = `<Link href={localizePath(ROUTES.home, locale)} hrefLang="en">x</Link>\n<Link href={ localizePath(stripLocale(pathname), option) }>y</Link>\n`;
    const { ctx, violations } = makeCtx({ [FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  const failing: [label: string, source: string][] = [
    ['a string literal', `<Link href="/de/episode">x</Link>\n`],
    ['a hand-written prefix', `<Link href={'/de' + path}>x</Link>\n`],
    ['another helper', `<Link href={switchLocalePath(pathname, option)}>x</Link>\n`],
    ['an insecure external URL', `<a href="http://example.com" target="_blank" rel="noopener noreferrer">x</a>\n`],
    ['a bare variable', `<a href={url} target="_blank" rel="noopener noreferrer">x</a>\n`],
    ['an external URL without target and rel', `<a href="https://example.com">x</a>\n`],
    ['an external URL without target', `<a href="https://example.com" rel="noopener noreferrer">x</a>\n`],
    ['an external URL without rel', `<a href="https://example.com" target="_blank">x</a>\n`],
    [
      'an external URL whose rel lacks noreferrer',
      `<a href="https://example.com" target="_blank" rel="noopener">x</a>\n`,
    ],
  ];

  for (const [label, source] of failing) {
    it(`fails on ${label}`, async () => {
      // ARRANGE
      const { ctx, violations } = makeCtx({ [FILE]: source });
      // ACT
      await rule.check(ctx);
      // ASSERT
      expect(violations).toHaveLength(1);
      expect(violations[0].file).toBe(FILE);
    });
  }

  it('passes an https literal or externalHref() that opens in a new tab with noopener noreferrer', async () => {
    // ARRANGE
    const source = [
      `<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>`,
      `<a rel="noreferrer noopener" target="_blank" href={'https://example.com'}>y</a>`,
      `<a\n  href={externalHref(source)}\n  onClick={() => go()}\n  target="_blank"\n  rel="noopener noreferrer"\n>z</a>`,
    ].join('\n');
    const { ctx, violations } = makeCtx({ [FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('reports the line the href sits on, even when its value wraps', async () => {
    // ARRANGE
    const source = `export function A() {\n  return (\n    <Link href={\n      '/de'\n    }>x</Link>\n  );\n}\n`;
    const expectedLine = 3;
    const { ctx, violations } = makeCtx({ [FILE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([expectedLine]);
  });

  it('leaves files outside src/**/*.tsx alone', async () => {
    // ARRANGE
    const source = `<a href="/de">x</a>\n`;
    const { ctx, violations } = makeCtx({ 'src/lib/routes.ts': source, 'docs/page.tsx': source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the FE-003 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(FE-003 [href-via-localize-path])';
    const { ctx, violations } = makeCtx({ [FILE]: `<a href="/">x</a>\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});
