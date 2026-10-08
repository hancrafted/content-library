/// <reference path="../rules.d.ts" />

// Sibling test for FE-010-context-drawer.rules.ts — pass and fail path for each
// rule, plus the edges: a print block that does not name the slot, a slot named
// only outside print, a commented-out block, nested braces, and a drawer
// comment that merely names a banned call.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-010-context-drawer.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Stands in for archgate's RuleContext over an in-memory file set. Globs resolve
// by exact path or by the `dir/**/*` prefix form the rules use.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      if (pattern.endsWith('/**/*')) return Object.keys(files).filter((f) => f.startsWith(pattern.slice(0, -4)));
      return Object.keys(files).filter((f) => f === pattern);
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

const CSS = 'src/app/globals.css';
const DRAWER = 'src/components/context-drawer/context-drawer.client.tsx';
const PROVENANCE = '(FE-010 [print-reveals-context])';

describe('print-reveals-context', () => {
  const rule = ruleSet.rules['print-reveals-context'];

  it('passes a print block that sets the context slot to display block', async () => {
    // ARRANGE
    const css = `@media print {\n  [data-slot='context'] { display: block !important; }\n  [data-slot='context-trigger'] { display: none; }\n}\n`;
    const { ctx, violations } = makeCtx({ [CSS]: css });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a stylesheet with no print block', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [CSS]: `body { color: red; }\n` });
    const expectedFiles = [CSS];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(expectedFiles);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('fails a print block that does not name the context slot', async () => {
    // ARRANGE
    const css = `@media print { .toc { display: block; } }\n[data-slot='context'] { display: block; }\n`;
    const { ctx, violations } = makeCtx({ [CSS]: css });
    const expectedCount = 1;
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(expectedCount);
  });

  it('fails when the slot is named only by the trigger, whose attribute value differs', async () => {
    // ARRANGE
    const css = `@media print { [data-slot='context-trigger'] { display: block; } }\n`;
    const { ctx, violations } = makeCtx({ [CSS]: css });
    const expectedCount = 1;
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(expectedCount);
  });

  it('ignores a print block that sits inside a comment', async () => {
    // ARRANGE
    const css = `/* @media print { [data-slot='context'] { display: block; } } */\n`;
    const { ctx, violations } = makeCtx({ [CSS]: css });
    const expectedCount = 1;
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(expectedCount);
  });

  it('reads a rule that follows a nested block in the same print block', async () => {
    // ARRANGE
    const css = `@media print {\n  @supports (display: grid) { .x { color: red; } }\n  [data-slot="context"] { display: block; }\n}\n`;
    const { ctx, violations } = makeCtx({ [CSS]: css });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails when the stylesheet is missing', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({});
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations[0]?.message).toContain(PROVENANCE);
  });
});

describe('drawer-is-non-modal', () => {
  const rule = ruleSet.rules['drawer-is-non-modal'];

  it('passes a drawer that uses neither', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [DRAWER]: `export function D() { return <aside role="complementary" />; }\n`,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails showModal( and aria-modal, with their lines', async () => {
    // ARRANGE
    const source = `ref.current.showModal();\n<aside aria-modal="true" />\n`;
    const { ctx, violations } = makeCtx({ [DRAWER]: source });
    const expectedLines = [1, 2];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual(expectedLines);
    expect(violations[0]?.message).toContain('(FE-010 [drawer-is-non-modal])');
  });

  it('ignores files outside the drawer folder', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ 'src/components/other.tsx': `x.showModal();\n` });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('pins the known false positive: a comment naming showModal( fails', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [DRAWER]: `// never showModal() here\n` });
    const expectedLines = [1];
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual(expectedLines);
  });
});
