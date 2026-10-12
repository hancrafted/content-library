import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toPickerHex } from './colour-convert.pure';

// The global status colours (docs/design-system/README.md, Status colours): text on the page and card surfaces, and the
// -foreground on a fill of the colour, are 4.5:1 or better in both themes.

const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf8');

function block(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  return css.slice(start, css.indexOf('\n}', start));
}

function token(theme: ':root' | '.dark', name: string): string {
  const match = block(theme).match(new RegExp(`\\n\\s*--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`--${name} is not declared under ${theme}`);
  return match[1].trim();
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

const STATUSES = ['success', 'warning', 'info', 'destructive'] as const;
const THEMES = [':root', '.dark'] as const;

describe('success cases', () => {
  it.each(STATUSES.flatMap((name) => THEMES.map((theme) => [name, theme] as const)))(
    '%s is declared with a -foreground under %s',
    (name, theme) => {
      // ARRANGE
      const declared = [token(theme, name), token(theme, `${name}-foreground`)];
      // ACT
      const unreadable = declared.filter((value) => toPickerHex(value) === null);
      // ASSERT
      expect(unreadable).toEqual([]);
    },
  );

  it.each(STATUSES.flatMap((name) => THEMES.map((theme) => [name, theme] as const)))(
    '%s reads at 4.5:1 as text on the page and card, and carries its -foreground at 4.5:1, under %s',
    (name, theme) => {
      // ARRANGE
      const minimum = 4.5;
      const fill = token(theme, name);
      const surfaces = [token(theme, 'background'), token(theme, 'card')];
      const foreground = token(theme, `${name}-foreground`);
      // ACT
      const onSurfaces = surfaces.map((surface) => contrast(fill, surface));
      const onFill = contrast(foreground, fill);
      // ASSERT
      expect(Math.min(...onSurfaces, onFill)).toBeGreaterThanOrEqual(minimum);
    },
  );
});

describe('failure cases', () => {
  it('throws on a token a theme does not declare', () => {
    // ARRANGE
    const missing = 'no-such-status';
    // ACT
    const read = () => token(':root', missing);
    // ASSERT
    expect(read).toThrow('--no-such-status');
  });
});

describe('edge cases', () => {
  it.each(STATUSES.flatMap((name) => [name, `${name}-foreground`]))('maps %s into the Tailwind theme', (name) => {
    // ARRANGE
    const mapping = `--color-${name}: var(--${name});`;
    // ACT
    const theme = css.slice(css.indexOf('@theme inline'));
    // ASSERT
    expect(theme).toContain(mapping);
  });
});
