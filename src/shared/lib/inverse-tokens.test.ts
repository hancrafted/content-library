import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
const css = readFileSync(join(__dirname, '../../app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const afterVariant = css.slice(css.indexOf('\n);') + 3);

type Theme = 'light' | 'dark';
const DEPTHS = [0, 1, 2, 3];
const THEMES: Theme[] = ['light', 'dark'];

function selectorsOf(declaresToken: string): string[] {
  const lists = [...afterVariant.matchAll(/(^|\n)([^{}\n@][^{}]*)\{([^{}]*)\}/g)].filter((rule) =>
    rule[3].includes(declaresToken),
  );
  return lists.flatMap((rule) => rule[2].split(',').map((selector) => selector.trim().replace(/\s+/g, ' ')));
}

function parse(selector: string): {
  themes: Theme[];
  depth: number;
  header: boolean;
} {
  const header = selector.includes('data-testid');
  const depth = header ? 1 : (selector.match(/\[data-inverse\]/g) ?? []).length;
  const themes: Theme[] = selector.startsWith(':root:not(.dark)')
    ? ['light']
    : selector.startsWith('.dark')
      ? ['dark']
      : ['light', 'dark'];
  return { themes, depth, header };
}

describe('success cases', () => {
  it('declares each theme once: the light and dark values each sit in one selector list', () => {
    // ARRANGE
    const lightBlocks = css.match(/--card: oklch\(1 0 0\)/g);
    const darkBlocks = css.match(/--card: oklch\(0\.205 0 0\)/g);
    // ACT
    const counts = [lightBlocks?.length, darkBlocks?.length];
    // ASSERT
    expect(counts).toEqual([1, 1]);
  });

  it('keeps no --inv-* or --org-* copy of a theme', () => {
    // ARRANGE
    const copies = /--(?:inv|org)-/;
    // ACT
    const found = css.match(copies);
    // ASSERT
    expect(found).toBeNull();
  });

  it.each(THEMES.flatMap((page) => DEPTHS.map((depth) => [page, depth] as const)))(
    'gives the tokens and the dark: variant the same theme in a %s page at depth %i',
    (page, depth) => {
      // ARRANGE
      const effective: Theme = depth % 2 === 0 ? page : page === 'light' ? 'dark' : 'light';
      const darkSelectors = selectorsOf('--background: oklch(0.145 0 0)');
      const lightSelectors = selectorsOf('--background: oklch(0.985 0 0)');
      const claims = (list: string[]) =>
        list.filter((selector) => {
          const parsed = parse(selector);
          return parsed.themes.includes(page) && parsed.depth === depth && !parsed.header;
        }).length;
      // ACT
      const tokenTheme = claims(darkSelectors) === 1 ? 'dark' : claims(lightSelectors) === 1 ? 'light' : 'none';
      const variantDark = variantMatches(page, depth);
      // ASSERT
      expect(tokenTheme).toBe(effective);
      expect(variantDark).toBe(effective === 'dark');
    },
  );
});

function variantMatches(page: Theme, depth: number): boolean {
  const start = css.indexOf('@custom-variant dark');
  const source = css.slice(start, css.indexOf('\n);', start));
  const groups = [...source.matchAll(/:where\(([^()]*(?:\([^()]*\)[^()]*)*)\)(?::not\(\s*:where\(([^()]*)\)\s*\))?/g)];
  const matches = groups.filter((group) => {
    const positives = group[1].split(',').map((selector) => selector.trim().replace(/\s*\*$/, ''));
    const inGroup = positives.some((selector) => {
      const parsed = parse(selector);
      return parsed.themes.includes(page) && !parsed.header && depth >= parsed.depth;
    });
    if (!inGroup) return false;
    if (!group[2]) return true;
    const exclusionDepths = group[2].split(',').map((selector) => parse(selector.trim().replace(/\s*\*$/, '')).depth);
    return depth < Math.min(...exclusionDepths);
  });
  return matches.length > 0;
}

describe('failure cases', () => {
  it('keeps no retired tone selector', () => {
    // ARRANGE
    const retired = /data-tone|data-surface-tone|--tone-paper|--tone-ink/;
    // ACT
    const found = css.match(retired);
    // ASSERT
    expect(found).toBeNull();
  });
});

describe('edge cases', () => {
  it('joins the site header under a page tone to the inverse forms of both lists', () => {
    // ARRANGE
    const header = (selectors: string[]) => selectors.filter((selector) => selector.includes('site-header'));
    // ACT
    const seen = [
      header(selectorsOf('--background: oklch(0.145 0 0)')).length,
      header(selectorsOf('--background: oklch(0.985 0 0)')).length,
    ];
    // ASSERT
    expect(seen).toEqual([1, 1]);
  });

  it('matches the site header in the dark: variant only when the page is light', () => {
    // ARRANGE
    const start = css.indexOf('@custom-variant dark');
    const source = css.slice(start, css.indexOf('\n);', start));
    // ACT
    const lightHeader = source.includes(":root:not(.dark)[data-page-tone='inverse'] [data-testid='site-header']");
    // ASSERT
    expect(lightHeader).toBe(true);
  });
});
