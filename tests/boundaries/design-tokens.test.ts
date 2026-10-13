import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The global token set (FE-011, docs/design/design-system.md): raw values sit
 * on `:root` and `.dark`, `@theme inline` maps each utility to them, so every
 * token stays runtime-editable. Read from the stylesheet text, because
 * Tailwind resolves the utilities only at build time.
 */

const read = (file: string) =>
  readFileSync(path.join(__dirname, '../..', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const GLOBALS = read('src/app/globals.css');
const PALETTE = read('src/components/episodes/maintaining-markdown-for-ai/palette.css');

const block = (css: string, opener: string): string => {
  const start = css.indexOf(opener);
  if (start < 0) return '';
  return css.slice(start, css.indexOf('\n}', start));
};
const ROOT = block(GLOBALS, ':root {');
const DARK = block(GLOBALS, '.dark {');
const THEME = block(GLOBALS, '@theme inline {');
const lines = (css: string) => css.split('\n').map((line) => line.trim());

describe('success cases', () => {
  it.each([
    ['hero', 'clamp(2.5rem, 5.2vw, 4.5rem)', '1.05'],
    ['heading', 'clamp(2.25rem, 4.2vw, 3.75rem)', '1.1'],
    ['subheading', 'clamp(1.875rem, 3.4vw, 3rem)', '1.15'],
    ['body', '1rem', '1.6'],
  ])('declares the %s role with its documented size and line height', (role, size, leading) => {
    // ARRANGE
    const expected = [
      `--size-${role}: ${size};`,
      `--leading-${role}: ${leading};`,
      `--text-${role}: var(--size-${role});`,
      `--text-${role}--line-height: var(--leading-${role});`,
    ];
    // ACT
    const declared = [...lines(ROOT), ...lines(THEME)];
    // ASSERT
    expect(expected.filter((line) => !declared.includes(line))).toEqual([]);
  });

  it('declares the card surface for light and dark', () => {
    // ARRANGE
    const expected = ['--card:', '--card-foreground:'];
    // ACT
    const missing = expected.filter((name) => !ROOT.includes(name) || !DARK.includes(name));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('maps bg-card and text-card-foreground through the theme', () => {
    // ARRANGE
    const expected = ['--color-card: var(--card);', '--color-card-foreground: var(--card-foreground);'];
    // ACT
    const missing = expected.filter((line) => !THEME.includes(line));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('declares normal, medium and semibold weights and the font families on the root', () => {
    // ARRANGE
    const expected = [
      '--weight-normal: 400;',
      '--weight-medium: 500;',
      '--weight-semibold: 600;',
      '--font-sans:',
      '--font-mono:',
    ];
    // ACT
    const missing = expected.filter((line) => !ROOT.includes(line));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('maps the weights through the theme', () => {
    // ARRANGE
    const expected = [
      '--font-weight-normal: var(--weight-normal);',
      '--font-weight-medium: var(--weight-medium);',
      '--font-weight-semibold: var(--weight-semibold);',
    ];
    // ACT
    const missing = expected.filter((line) => !THEME.includes(line));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('sets heading letter-spacing on the display roles', () => {
    // ARRANGE
    const expected = [
      '--text-hero--letter-spacing:',
      '--text-heading--letter-spacing:',
      '--text-subheading--letter-spacing:',
    ];
    // ACT
    const missing = expected.filter((line) => !THEME.includes(line));
    // ASSERT
    expect(missing).toEqual([]);
  });
});

describe('failure cases', () => {
  it('re-declares no global token name in the maintaining-markdown-for-ai palette', () => {
    // ARRANGE
    const globalNames = new Set([...(ROOT + DARK).matchAll(/(--[a-z-]+):/g)].map((m) => m[1]));
    // ACT
    const clashes = [...PALETTE.matchAll(/(--[a-z-]+):/g)].map((m) => m[1]).filter((name) => globalNames.has(name));
    // ASSERT
    expect(clashes).toEqual([]);
  });
});
