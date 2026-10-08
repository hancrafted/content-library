/// <reference path="../rules.d.ts" />

// Sibling test for FE-005-static-export-contract.rules.ts — pass and fail path
// for every rule, plus the boundaries each is easy to get wrong: route groups
// that look like intercepting folders, static segments, the src/ scope, and
// prose that merely names a banned key.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-005-static-export-contract.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Stands in for archgate's RuleContext over an in-memory file set. The rules
// glob only `src/**/*` and the root `*`, so the double serves those two shapes.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      if (pattern === 'src/**/*') return Object.keys(files).filter((f) => f.startsWith('src/'));
      if (pattern === '*') return Object.keys(files).filter((f) => !f.includes('/'));
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

const GOOD_CONFIG = `const nextConfig = {\n  output: 'export',\n  trailingSlash: true,\n  images: { unoptimized: true },\n};\n`;
const LOCALE_PAGE = 'src/app/[locale]/page.tsx';
const FULL_SEGMENT = `export const dynamicParams = false;\nexport const generateStaticParams = prefixedLocaleParams;\nexport default function Page() {}\n`;

describe('dynamic-segment-static-params', () => {
  const rule = ruleSet.rules['dynamic-segment-static-params'];

  it('passes when every dynamic page and layout exports both', async () => {
    // ARRANGE
    const asyncForm = `export const dynamicParams = false;\nexport async function generateStaticParams() { return []; }\n`;
    const { ctx, violations } = makeCtx({
      [LOCALE_PAGE]: FULL_SEGMENT,
      'src/app/[locale]/layout.tsx': asyncForm,
      'src/app/[locale]/episode/page-template/page.tsx': FULL_SEGMENT,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails once per missing export', async () => {
    // ARRANGE
    const nestedPage = 'src/app/[locale]/episode/page-template/page.tsx';
    const { ctx, violations } = makeCtx({
      [LOCALE_PAGE]: `export const generateStaticParams = prefixedLocaleParams;\n`,
      [nestedPage]: `export default function Page() {}\n`,
    });
    const expectedFiles = [LOCALE_PAGE, nestedPage, nestedPage];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(expectedFiles);
  });

  it('fails when dynamicParams is true', async () => {
    // ARRANGE
    const source = `export const dynamicParams = true;\nexport const generateStaticParams = prefixedLocaleParams;\n`;
    const { ctx, violations } = makeCtx({ [LOCALE_PAGE]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('leaves static segments and non-segment files alone', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      'src/app/(en)/page.tsx': `export default function Page() {}\n`,
      'src/app/[locale]/params.ts': `export function resolveLocale() {}\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the FE-005 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(FE-005 [dynamic-segment-static-params])';
    const { ctx, violations } = makeCtx({ [LOCALE_PAGE]: `\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});

describe('export-config-intact', () => {
  const rule = ruleSet.rules['export-config-intact'];

  it('passes on the static export config', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ 'next.config.ts': GOOD_CONFIG });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  const failing: [label: string, source: string][] = [
    ['a missing output export', GOOD_CONFIG.replace("output: 'export',", '')],
    ['the default image loader', GOOD_CONFIG.replace('images: { unoptimized: true },', '')],
    ['a rewrites function', `${GOOD_CONFIG}async rewrites() { return []; }\n`],
    ['a redirects key', `${GOOD_CONFIG}const x = { redirects: async () => [] };\n`],
    ['a headers function', `${GOOD_CONFIG}async headers() { return []; }\n`],
  ];

  for (const [label, source] of failing) {
    it(`fails on ${label}`, async () => {
      // ARRANGE
      const { ctx, violations } = makeCtx({ 'next.config.ts': source });
      // ACT
      await rule.check(ctx);
      // ASSERT
      expect(violations).toHaveLength(1);
    });
  }

  it('ignores prose that names a banned key without calling it', async () => {
    // ARRANGE
    const source = `// GitHub Pages cannot set headers, so no redirects either.\n${GOOD_CONFIG}`;
    const { ctx, violations } = makeCtx({ 'next.config.ts': source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('passes on a static export config under the legal next.config.mjs name', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ 'next.config.mjs': GOOD_CONFIG });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('reports a missing next.config instead of throwing', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ 'package.json': '{}' });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('flags a comment that writes a banned key with a colon — known false positive', async () => {
    // Deliberate and documented: SERVER_CONFIG_RE is textual, so `headers:` in
    // a comment reads as a declaration. Do not "fix" the regex to skip comments:
    // telling a comment from a key needs a parser, and a regex that guesses
    // risks missing real keys. Reword the comment instead.
    // ARRANGE
    const source = `// headers: none, Pages cannot set them.\n${GOOD_CONFIG}`;
    const { ctx, violations } = makeCtx({ 'next.config.ts': source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('carries the FE-005 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(FE-005 [export-config-intact])';
    const { ctx, violations } = makeCtx({ 'next.config.ts': `\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});

describe('no-request-time-features', () => {
  const rule = ruleSet.rules['no-request-time-features'];

  it('passes on build-time-only source', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      'next.config.ts': GOOD_CONFIG,
      [LOCALE_PAGE]: FULL_SEGMENT,
      'src/app/(en)/page.tsx': `'use client';\nexport default function Page() {}\n`,
      'src/app/feed.xml/route.ts': `export const dynamic = 'force-static';\nexport async function GET() { return new Response(''); }\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  const failing: [label: string, files: Record<string, string>][] = [
    ['a root proxy file', { 'proxy.ts': `export function proxy() {}\n` }],
    ['a src middleware file', { 'src/middleware.ts': `export function middleware() {}\n` }],
    ['an intercepting route folder', { 'src/app/(.)photo/page.tsx': `export default function P() {}\n` }],
    ['a file-level use server', { 'src/lib/actions.ts': `'use server';\nexport async function save() {}\n` }],
    ['an inline use server', { 'src/lib/form.tsx': `async function save() {\n  "use server";\n}\n` }],
    ['a revalidate export', { 'src/app/(en)/page.tsx': `export const revalidate = 60;\n` }],
    ['a POST route handler', { 'src/app/api/route.ts': `export async function POST() {}\n` }],
    ['a GET that reads the request', { 'src/app/api/route.ts': `export async function GET(request: Request) {}\n` }],
  ];

  for (const [label, files] of failing) {
    it(`fails on ${label}`, async () => {
      // ARRANGE
      const { ctx, violations } = makeCtx(files);
      // ACT
      await rule.check(ctx);
      // ASSERT
      expect(violations).toHaveLength(1);
    });
  }

  it('misses an arrow-form GET that reads its request — known gap (Risk 1)', async () => {
    // Pinned on purpose: NON_GET_HANDLER_RE matches `const`, so an arrow-form
    // POST is caught, but GET_WITH_PARAM_RE matches only `function`. FE-005
    // Risk 1 records the asymmetry; this test keeps it deliberate, not accidental.
    // ARRANGE
    const source = `export const GET = async (request: Request) => new Response('');\n`;
    const { ctx, violations } = makeCtx({ 'src/app/api/route.ts': source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('reports the line a directive sits on', async () => {
    // ARRANGE
    const file = 'src/lib/form.tsx';
    const expectedLine = 3;
    const { ctx, violations } = makeCtx({
      [file]: `import x from 'y';\nasync function save() {\n  'use server';\n}\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([expectedLine]);
  });

  it('leaves files outside src/ and the root alone', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      'docs/proxy.ts': `export function proxy() {}\n`,
      'scripts/actions.ts': `'use server';\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the FE-005 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(FE-005 [no-request-time-features])';
    const { ctx, violations } = makeCtx({ 'middleware.ts': `\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });
});
