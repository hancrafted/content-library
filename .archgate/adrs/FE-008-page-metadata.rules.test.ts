/// <reference path="../rules.d.ts" />

// Sibling test for FE-008-page-metadata.rules.ts — pass and fail path for each
// rule, plus the boundaries each is easy to get wrong: the function and const
// forms of generateMetadata, files that are neither page nor layout, and a
// comment that merely names a banned field.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-008-page-metadata.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Stands in for archgate's RuleContext over an in-memory file set. The rules
// glob only `src/app/**/*`, so the double serves that one shape.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      if (pattern === 'src/app/**/*') return Object.keys(files).filter((f) => f.startsWith('src/app/'));
      throw new Error(`unexpected glob ${pattern}`);
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

const EN_PAGE = 'src/app/(en)/page.tsx';
const DE_PAGE = 'src/app/[locale]/episode/page-template/page.tsx';
const EN_LAYOUT = 'src/app/(en)/layout.tsx';
const STATIC_FORM = `export const metadata = pageMetadata('home', DEFAULT_LOCALE);\nexport default function Page() {}\n`;
const FUNCTION_FORM = `export async function generateMetadata({ params }) {\n  return pageMetadata('episodeTemplate', await resolveLocale(params));\n}\n`;

describe('page-exports-metadata', () => {
  const rule = ruleSet.rules['page-exports-metadata'];

  it('passes the const and the function form built by pageMetadata', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [EN_PAGE]: STATIC_FORM, [DE_PAGE]: FUNCTION_FORM });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a page that exports no metadata', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [EN_PAGE]: `export default function Page() {}\n` });
    const expectedFiles = [EN_PAGE];
    const expectedProvenance = '(FE-008 [page-exports-metadata])';
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(expectedFiles);
    expect(violations[0]?.message).toContain(expectedProvenance);
  });

  it('fails a page whose metadata is written by hand', async () => {
    // ARRANGE
    const handWritten = `export const metadata = { title: 'Home', alternates: { canonical: '/' } };\n`;
    const { ctx, violations } = makeCtx({ [EN_PAGE]: handWritten });
    const expectedFiles = [EN_PAGE];
    const expectedHint = 'built by hand';
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(expectedFiles);
    expect(violations[0]?.message).toContain(expectedHint);
  });

  it('ignores files that are not pages', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      'src/app/[locale]/params.ts': `export function resolveLocale() {}\n`,
      'src/app/globals.css': `body {}\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('layout-holds-site-metadata-only', () => {
  const rule = ruleSet.rules['layout-holds-site-metadata-only'];

  it('passes a layout that sets only siteMetadata', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [EN_LAYOUT]: `export const metadata = siteMetadata(DEFAULT_LOCALE, SITE_URL);\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails each page-level field a layout names, with its line', async () => {
    // ARRANGE
    const source = `export const metadata = {\n  description: 'x',\n  alternates: { canonical: '/' },\n};\n`;
    const { ctx, violations } = makeCtx({ [EN_LAYOUT]: source });
    const expectedLines = [2, 3, 3];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual(expectedLines);
  });

  it('fails a layout that calls pageMetadata', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [EN_LAYOUT]: `export const metadata = pageMetadata('home', 'en');\n` });
    const expectedFiles = [EN_LAYOUT];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(expectedFiles);
  });

  it('pins the known false positive: a comment naming a banned field fails', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [EN_LAYOUT]: `// pages own their description\nexport default function L() {}\n`,
    });
    const expectedLines = [1];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual(expectedLines);
  });
});
