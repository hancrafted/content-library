import { toPickerHex } from '@/shared/lib/colour-convert.pure';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TAG_IDS } from './schemas/fields';
import { TAG_ICONS } from './schemas/tag-looks';

/*
 * Each Tag's look (design-ADR Tags replace Topics): an icon by name beside the vocabulary, and one colour token per
 * theme in globals.css, `--tag-<id>`, which the token editor adjusts. The colour is the card's ink, so it reads 4.5:1
 * or better on the page in both themes.
 */

const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf8');
const THEMES = [':root', '.dark'] as const;
const READABLE = 4.5;

function block(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  return css.slice(start, css.indexOf('\n}', start));
}

function token(theme: string, name: string): string | undefined {
  return block(theme)
    .match(new RegExp(`\\n\\s*--${name}:\\s*([^;]+);`))?.[1]
    .trim();
}

function luminance(value: string): number {
  const hex = toPickerHex(value);
  if (!hex) throw new Error(`cannot read ${value}`);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = TAG_IDS.flatMap((id) => THEMES.map((theme) => [id, theme] as const));

describe('success cases', () => {
  it.each(PAIRS)('declares --tag-%s under %s as a colour', (id, theme) => {
    // ARRANGE
    const name = `tag-${id}`;
    // ACT
    const value = token(theme, name);
    // ASSERT
    expect(value && toPickerHex(value)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it.each(PAIRS)('reads --tag-%s 4.5:1 on the page under %s', (id, theme) => {
    // ARRANGE
    const background = token(theme, 'background') ?? '';
    const value = token(theme, `tag-${id}`) ?? '';
    // ACT
    const ratio = contrast(value, background);
    // ASSERT
    expect(ratio).toBeGreaterThanOrEqual(READABLE);
  });
});

describe('failure cases', () => {
  it('finds no token for a name outside the vocabulary', () => {
    // ARRANGE
    const stray = 'tag-kubernetes';
    // ACT
    const value = token(':root', stray);
    // ASSERT
    expect(value).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('names an icon for every Tag in the vocabulary, and for no other', () => {
    // ARRANGE
    const expected = [...TAG_IDS].sort();
    // ACT
    const named = Object.keys(TAG_ICONS).sort();
    // ASSERT
    expect(named).toEqual(expected);
  });
});
