/// <reference path="../rules.d.ts" />

// Sibling test for FE-011-design-tokens.rules.ts — one probe per check (A1..A6) that fails on a violating file, and
// pass cases for what each check must leave alone: the global :root/.dark blocks, a Slide token file with a dark
// value, a legacy file, a test file, and "Invoice #0042", four hex digits that are not a colour.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-011-design-tokens.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Minimal glob -> RegExp for the double below: '**' spans any number of segments including none, '*' one segment's
// characters.
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

const LEGACY_PATH = 'src/design-system/legacy.json';
const GLOBALS_PATH = 'src/app/globals.css';
const GLOBALS =
  ':root {\n  --primary: oklch(0.2 0 0);\n  --machine: oklch(0.6 0.1 240);\n}\n.dark {\n  --primary: #eee;\n}\n';
const SLIDE_CSS = 'src/components/episodes/demo/slides/loop/loop.module.css';

function makeCtx(files: Record<string, string>, legacyGlobs: string[] = []) {
  const violations: Reported[] = [];
  const all: Record<string, string> = {
    [GLOBALS_PATH]: GLOBALS,
    [LEGACY_PATH]: JSON.stringify({ globs: legacyGlobs }),
    ...files,
  };
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(all),
    changedFiles: [],
    async glob(pattern: string) {
      const re = globToRegExp(pattern);
      return Object.keys(all).filter((file) => re.test(file));
    },
    async readFile(path: string) {
      if (path in all) return all[path];
      throw new Error(`ENOENT: ${path}`);
    },
    async readJSON(path: string) {
      return JSON.parse(all[path]);
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

async function run(ruleId: keyof typeof ruleSet.rules, files: Record<string, string>, legacy: string[] = []) {
  const { ctx, violations } = makeCtx(files, legacy);
  await ruleSet.rules[ruleId].check(ctx);
  return violations;
}

describe('no-raw-colour-in-css (A1)', () => {
  it('fails a raw colour in a stylesheet that is neither globals nor a Slide token file', async () => {
    // ARRANGE
    const files = { 'src/components/slide-master/panel.module.css': '.panel {\n  color: #ff0000;\n}\n' };
    // ACT
    const violations = await run('no-raw-colour-in-css', files);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ file: 'src/components/slide-master/panel.module.css', line: 2 });
    expect(violations[0].message).toContain('(FE-011 [no-raw-colour-in-css])');
  });

  it('fails a raw colour in globals.css outside :root and .dark, even after an @import', async () => {
    // ARRANGE
    const files = {
      [GLOBALS_PATH]: `@import 'tailwindcss';\n${GLOBALS}@theme inline {\n  --shadow: 0 1px rgb(15 23 42 / 0.2);\n}\n`,
    };
    // ACT
    const violations = await run('no-raw-colour-in-css', files);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([10]);
  });

  it('passes raw colours under :root and .dark, in a Slide token file, and in a legacy file', async () => {
    // ARRANGE
    const files = {
      [SLIDE_CSS]: '.loop {\n  --edge: #d0342c;\n}\n',
      'src/components/landing/hero.module.css': '.hero {\n  color: #fff;\n}\n',
    };
    // ACT
    const violations = await run('no-raw-colour-in-css', files, ['src/components/landing/**']);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('no-raw-value-in-code (A2)', () => {
  it.each([
    ['a hex in a style object', "const s = { color: '#ff0000' };"],
    ['an SVG fill', '<rect fill="#0af" />'],
    ['an rgba table entry', "const border = 'rgba(10, 14, 26, 0.12)';"],
    ['a named colour', "const s = { backgroundColor: 'red' };"],
    ['a font size', 'const s = { fontSize: 14 };'],
    ['a font weight', "const s = { fontWeight: 'bold' };"],
    ['a font family', 'const s = { fontFamily: "Inter" };'],
  ])('fails %s', async (_name, line) => {
    // ARRANGE
    const files = { 'src/components/slide-master/chart.tsx': `export const x = 1;\n${line}\n` };
    // ACT
    const violations = await run('no-raw-value-in-code', files);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(2);
    expect(violations[0].message).toContain('(FE-011 [no-raw-value-in-code])');
  });

  it('fails a font property in a CSS module', async () => {
    // ARRANGE
    const files = { [SLIDE_CSS]: '.loop {\n  font-size: 13px;\n  font-weight: 700;\n  font-family: serif;\n}\n' };
    // ACT
    const violations = await run('no-raw-value-in-code', files);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([2, 3, 4]);
  });

  it('passes "Invoice #0042", whose four hex digits are not a colour', async () => {
    // ARRANGE
    const files = {
      'src/components/slide-master/invoice.tsx': 'const label = "Invoice #0042";\nconst id = `Order #abcd`;\n',
    };
    // ACT
    const violations = await run('no-raw-value-in-code', files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('passes token references, custom-property font names, comments, tests and legacy files', async () => {
    // ARRANGE
    const files = {
      'src/components/slide-master/ok.tsx':
        "// fill=\"#fff\" was here\nconst s = { color: 'var(--foreground)', fill: 'currentColor' };\n",
      [SLIDE_CSS]: '.loop {\n  /* font-size: 13px */\n  --font-note: var(--font-mono);\n}\n',
      'src/lib/contrast.test.ts': "const bg = '#fafafa';\n",
      'src/components/landing/hero.tsx': "const c = '#fff';\n",
    };
    // ACT
    const violations = await run('no-raw-value-in-code', files, ['src/components/landing/**']);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('allows the citation marker 0.7em and inline code 0.9em in their own file only', async () => {
    // ARRANGE
    const files = {
      'src/components/context-drawer/slide-notes.tsx': "const s = { fontSize: '0.7em' };\n",
      'src/components/slide-master/rich-tags.tsx': "const s = { fontSize: '0.9em' };\n",
      'src/components/slide-master/other.tsx': "const s = { fontSize: '0.7em' };\n",
    };
    // ACT
    const violations = await run('no-raw-value-in-code', files);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(['src/components/slide-master/other.tsx']);
  });
});

describe('slide-token-no-global-name (A3)', () => {
  it('fails a Slide token file that redeclares a global token name', async () => {
    // ARRANGE
    const files = { [SLIDE_CSS]: '.loop {\n  --primary: red;\n  --edge: blue;\n}\n' };
    // ACT
    const violations = await run('slide-token-no-global-name', files);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ file: SLIDE_CSS, line: 2 });
    expect(violations[0].message).toContain('(FE-011 [slide-token-no-global-name])');
  });

  it('passes Slide-local names and legacy Slide files', async () => {
    // ARRANGE
    const files = {
      [SLIDE_CSS]: '.loop {\n  --edge: blue;\n}\n',
      'src/components/episodes/old/slides/x/x.module.css': '.x {\n  --primary: red;\n}\n',
    };
    // ACT
    const violations = await run('slide-token-no-global-name', files, ['src/components/episodes/old/**']);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('slide-token-dark-counterpart (A4)', () => {
  it('fails a raw colour with no dark value, and one whose dark value is another property', async () => {
    // ARRANGE
    const css = '.a {\n  --edge: #d0342c;\n}\n.b {\n  --fill: #111;\n}\n:global(.dark) .b {\n  --other: #eee;\n}\n';
    // ACT
    const violations = await run('slide-token-dark-counterpart', { [SLIDE_CSS]: css });
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([2, 5]);
    expect(violations[0].message).toContain('(FE-011 [slide-token-dark-counterpart])');
  });

  it('passes a raw colour paired under :global(.dark), and non-colour values', async () => {
    // ARRANGE
    const css = '.a {\n  --edge: #d0342c;\n  --gap: 1rem;\n}\n:global(.dark) .a {\n  --edge: #ff7a6e;\n}\n';
    // ACT
    const violations = await run('slide-token-dark-counterpart', { [SLIDE_CSS]: css });
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('exempts a legacy Slide file', async () => {
    // ARRANGE
    const files = { 'src/components/episodes/old/slides/x/x.module.css': '.x {\n  --edge: #fff;\n}\n' };
    // ACT
    const violations = await run('slide-token-dark-counterpart', files, ['src/components/episodes/old/**']);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('no-episode-selector-in-globals (A5)', () => {
  it('fails a [data-episode=] selector in globals.css', async () => {
    // ARRANGE
    const files = { [GLOBALS_PATH]: `${GLOBALS}[data-episode='ai'] .scene {\n  gap: 1rem;\n}\n` };
    // ACT
    const violations = await run('no-episode-selector-in-globals', files);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ file: GLOBALS_PATH, line: 8 });
    expect(violations[0].message).toContain('(FE-011 [no-episode-selector-in-globals])');
  });

  it('passes tokens only, and a comment that names the selector', async () => {
    // ARRANGE
    const files = { [GLOBALS_PATH]: `${GLOBALS}/* never add [data-episode='x'] here */\n` };
    // ACT
    const violations = await run('no-episode-selector-in-globals', files);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('no-dead-legacy-entry (A6)', () => {
  it('fails a legacy glob that matches no file', async () => {
    // ARRANGE
    const files = { 'src/components/landing/hero.tsx': '' };
    // ACT
    const violations = await run('no-dead-legacy-entry', files, [
      'src/components/landing/**',
      'src/components/gone/**',
    ]);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ file: LEGACY_PATH });
    expect(violations[0].message).toContain('src/components/gone/**');
    expect(violations[0].message).toContain('(FE-011 [no-dead-legacy-entry])');
  });

  it('passes when every entry matches a file', async () => {
    // ARRANGE
    const files = { 'src/components/landing/hero.tsx': '' };
    // ACT
    const violations = await run('no-dead-legacy-entry', files, ['src/components/landing/**']);
    // ASSERT
    expect(violations).toEqual([]);
  });
});
